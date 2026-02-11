const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const bookingController = require('../../controllers/admin/bookingController');
const validate = require('../../middleware/validate');

// GET /api/v1/admin/bookings
router.get('/', bookingController.getAllBookings);

// GET /api/v1/admin/bookings/:id
router.get('/:id', bookingController.getBookingById);

// PUT /api/v1/admin/bookings/:id/status
router.put(
  '/:id/status',
  [
    body('status')
      .notEmpty()
      .isIn(['new', 'pujari_assigned', 'items_preparing', 'confirmed', 'completed', 'cancelled']),
    body('adminNotes').optional().trim().isLength({ max: 1000 }),
    body('cancellationReason').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  bookingController.updateBookingStatus
);

// PUT /api/v1/admin/bookings/:id/assign
router.put(
  '/:id/assign',
  [body('pujariId').notEmpty().isMongoId()],
  validate,
  bookingController.assignPujari
);

// PUT /api/v1/admin/bookings/:id/items-status
router.put(
  '/:id/items-status',
  [
    body('itemsDeliveryStatus')
      .notEmpty()
      .isIn(['not_applicable', 'pending', 'preparing', 'dispatched', 'delivered']),
  ],
  validate,
  bookingController.updateItemsStatus
);

module.exports = router;
