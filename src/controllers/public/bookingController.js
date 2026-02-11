const Booking = require('../../models/Booking');
const Puja = require('../../models/Puja');
const ApiResponse = require('../../utils/apiResponse');
const generateBookingId = require('../../utils/generateBookingId');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * POST /api/v1/public/bookings
 * Create a new booking (public, no auth required)
 */
exports.createBooking = asyncHandler(async (req, res) => {
  const {
    pujaId,
    customerName,
    customerMobile,
    address,
    preferredDate,
    preferredTime,
    itemsDeliveryRequested,
  } = req.body;

  // Verify puja exists and is bookable
  const puja = await Puja.findById(pujaId);
  if (!puja || !puja.isActive) {
    return ApiResponse.error(res, 'Puja not found or inactive', 404);
  }

  if (puja.pujaType !== 'bookable') {
    return ApiResponse.error(
      res,
      'This puja is not available for direct booking. Please request a callback.',
      400
    );
  }

  // Validate preferred date is in the future
  const bookingDate = new Date(preferredDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today) {
    return ApiResponse.error(res, 'Preferred date must be in the future', 400);
  }

  // Generate unique booking ID with retry
  let bookingId;
  let attempts = 0;
  do {
    bookingId = generateBookingId();
    const existing = await Booking.findOne({ bookingId });
    if (!existing) break;
    attempts++;
  } while (attempts < 5);

  if (attempts >= 5) {
    return ApiResponse.error(res, 'Unable to generate booking ID. Please try again.', 500);
  }

  const booking = await Booking.create({
    bookingId,
    puja: pujaId,
    customerName,
    customerMobile,
    address,
    preferredDate: bookingDate,
    preferredTime,
    itemsDeliveryRequested: itemsDeliveryRequested || false,
    status: 'new',
  });

  // Populate puja info for response
  await booking.populate('puja', 'name slug duration');

  return ApiResponse.created(
    res,
    {
      bookingId: booking.bookingId,
      pujaName: booking.puja.name,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      itemsDeliveryRequested: booking.itemsDeliveryRequested,
      status: booking.status,
      customerName: booking.customerName,
      address: booking.address,
    },
    'Booking created successfully. Our team will coordinate and confirm.'
  );
});

/**
 * GET /api/v1/public/bookings/:bookingId
 * Get booking status by human-readable booking ID
 */
exports.getBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    bookingId: req.params.bookingId.toUpperCase(),
  })
    .populate('puja', 'name slug duration')
    .select('-adminNotes -__v');

  if (!booking) {
    return ApiResponse.error(res, 'Booking not found', 404);
  }

  return ApiResponse.success(res, booking, 'Booking status fetched');
});
