const Booking = require('../../models/Booking');
const CallbackRequest = require('../../models/CallbackRequest');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * GET /api/v1/admin/dashboard/stats
 * Get dashboard statistics
 */
exports.getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    todayBookings,
    weekBookings,
    pendingAssignments,
    itemsDeliveryPending,
    upcomingPujas,
    newCallbacks,
    statusBreakdown,
  ] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: todayStart } }),
    Booking.countDocuments({ createdAt: { $gte: weekStart } }),
    Booking.countDocuments({ status: 'new' }),
    Booking.countDocuments({ itemsDeliveryRequested: true, itemsDeliveryStatus: { $in: ['pending', 'preparing'] } }),
    Booking.countDocuments({
      preferredDate: { $gte: todayStart },
      status: { $in: ['new', 'pujari_assigned', 'items_preparing', 'confirmed'] },
    }),
    CallbackRequest.countDocuments({ status: 'new' }),
    Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // Get recent bookings
  const recentBookings = await Booking.find()
    .populate('puja', 'name')
    .populate('assignedPujari', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('bookingId customerName status preferredDate itemsDeliveryRequested createdAt');

  return ApiResponse.success(res, {
    stats: {
      todayBookings,
      weekBookings,
      pendingAssignments,
      itemsDeliveryPending,
      upcomingPujas,
      newCallbacks,
    },
    statusBreakdown: statusBreakdown.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
    recentBookings,
  });
});
