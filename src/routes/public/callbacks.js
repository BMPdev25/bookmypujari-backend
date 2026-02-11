const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const callbackController = require('../../controllers/public/callbackController');
const validate = require('../../middleware/validate');

// POST /api/v1/public/callbacks - Submit callback request
router.post(
  '/',
  [
    body('pujaId').notEmpty().withMessage('Puja ID is required').isMongoId(),
    body('customerName')
      .notEmpty().withMessage('Name is required')
      .trim()
      .isLength({ min: 2, max: 100 }),
    body('customerMobile')
      .notEmpty().withMessage('Mobile number is required')
      .trim()
      .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),
    body('preferredCallTime')
      .optional()
      .isIn(['Morning (9-12)', 'Afternoon (12-4)', 'Evening (4-7)']),
    body('message').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  callbackController.createCallbackRequest
);

module.exports = router;
