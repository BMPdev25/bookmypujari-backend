const Booking = require('../../models/Booking');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * GET /api/v1/admin/bookings
 */
exports.getAllBookings = asyncHandler(async (req, res) => {
  const {
    status, page = 1, limit = 20,
    sortBy = 'createdAt', order = 'desc',
    search, dateFrom, dateTo,
  } = req.query;

  const filter = {};

  if (status && status !== 'all') filter.status = status;
  if (search) {
    filter.$or = [
      { bookingId: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { customerMobile: { $regex: search, $options: 'i' } },
    ];
  }
  if (dateFrom || dateTo) {
    filter.preferredDate = {};
    if (dateFrom) filter.preferredDate.$gte = new Date(dateFrom);
    if (dateTo) filter.preferredDate.$lte = new Date(dateTo);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('puja', 'name slug category')
      .populate('assignedPujari', 'name mobile')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit)),
    Booking.countDocuments(filter),
  ]);

  return ApiResponse.paginated(
    res,
    bookings,
    {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit),
    },
    'Bookings fetched successfully'
  );
});

/**
 * GET /api/v1/admin/bookings/:id
 */
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('puja', 'name slug category duration requiresItems')
    .populate('assignedPujari', 'name mobile email languages serviceAreas');

  if (!booking) return ApiResponse.error(res, 'Booking not found', 404);

  return ApiResponse.success(res, booking);
});

/**
 * PUT /api/v1/admin/bookings/:id/status
 */
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes, cancellationReason } = req.body;

  const validStatuses = ['new', 'pujari_assigned', 'items_preparing', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return ApiResponse.error(res, 'Invalid status', 400);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return ApiResponse.error(res, 'Booking not found', 404);

  // Status transition validation
  const validTransitions = {
    new: ['pujari_assigned', 'cancelled'],
    pujari_assigned: ['items_preparing', 'confirmed', 'cancelled'],
    items_preparing: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[booking.status].includes(status)) {
    return ApiResponse.error(
      res,
      `Cannot transition from "${booking.status}" to "${status}"`,
      400
    );
  }

  if (status === 'cancelled' && !cancellationReason) {
    return ApiResponse.error(res, 'Cancellation reason is required', 400);
  }

  booking.status = status;
  if (adminNotes) booking.adminNotes = adminNotes;
  if (cancellationReason) booking.cancellationReason = cancellationReason;

  await booking.save();
  await booking.populate('puja', 'name');
  await booking.populate('assignedPujari', 'name mobile');

  return ApiResponse.success(res, booking, 'Booking status updated successfully');
});

/**
 * PUT /api/v1/admin/bookings/:id/assign
 */
exports.assignPujari = asyncHandler(async (req, res) => {
  const { pujariId } = req.body;

  if (!pujariId) {
    return ApiResponse.error(res, 'Pujari ID is required', 400);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return ApiResponse.error(res, 'Booking not found', 404);

  booking.assignedPujari = pujariId;
  if (booking.status === 'new') {
    booking.status = 'pujari_assigned';
  }

  await booking.save();
  await booking.populate('puja', 'name');
  await booking.populate('assignedPujari', 'name mobile');

  return ApiResponse.success(res, booking, 'Pujari assigned successfully');
});

/**
 * PUT /api/v1/admin/bookings/:id/items-status
 */
exports.updateItemsStatus = asyncHandler(async (req, res) => {
  const { itemsDeliveryStatus } = req.body;

  const validStatuses = ['not_applicable', 'pending', 'preparing', 'dispatched', 'delivered'];
  if (!validStatuses.includes(itemsDeliveryStatus)) {
    return ApiResponse.error(res, 'Invalid items delivery status', 400);
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { itemsDeliveryStatus },
    { new: true, runValidators: true }
  ).populate('puja', 'name').populate('assignedPujari', 'name mobile');

  if (!booking) return ApiResponse.error(res, 'Booking not found', 404);

  return ApiResponse.success(res, booking, 'Items delivery status updated');
});
