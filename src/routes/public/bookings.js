const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const bookingController = require('../../controllers/public/bookingController');
const validate = require('../../middleware/validate');

// POST /api/v1/public/bookings - Create booking
router.post(
  '/',
  [
    body('pujaId').notEmpty().withMessage('Puja ID is required').isMongoId().withMessage('Invalid puja ID'),
    body('customerName')
      .notEmpty().withMessage('Name is required')
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('customerMobile')
      .notEmpty().withMessage('Mobile number is required')
      .trim()
      .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),
    body('address.line1').notEmpty().withMessage('Address line 1 is required').trim(),
    body('address.city').notEmpty().withMessage('City is required').trim(),
    body('address.pincode')
      .notEmpty().withMessage('Pincode is required')
      .trim()
      .matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
    body('address.line2').optional().trim(),
    body('address.landmark').optional().trim(),
    body('preferredDate')
      .notEmpty().withMessage('Preferred date is required')
      .isISO8601().withMessage('Invalid date format'),
    body('preferredTime')
      .notEmpty().withMessage('Preferred time is required')
      .isIn(['Early Morning (5-7 AM)', 'Morning (7-9 AM)', 'Late Morning (9-11 AM)', 'Afternoon (12-3 PM)', 'Evening (4-7 PM)'])
      .withMessage('Invalid time slot'),
    body('itemsDeliveryRequested').optional().isBoolean(),
  ],
  validate,
  bookingController.createBooking
);

// GET /api/v1/public/bookings/:bookingId - Get booking status
router.get(
  '/:bookingId',
  [
    param('bookingId')
      .matches(/^BMP-\d{8}-[A-Z0-9]{4}$/i)
      .withMessage('Invalid booking ID format'),
  ],
  validate,
  bookingController.getBookingStatus
);

module.exports = router;
