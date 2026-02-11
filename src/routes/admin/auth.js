const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../../controllers/admin/authController');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');

// POST /api/v1/admin/auth/login
router.post(
  '/login',
  [
    body('email').notEmpty().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.login
);

// GET /api/v1/admin/auth/me
router.get('/me', authenticate, authController.getMe);

module.exports = router;
