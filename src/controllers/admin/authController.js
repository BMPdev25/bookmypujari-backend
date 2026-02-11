const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const ApiResponse = require('../../utils/apiResponse');
const { asyncHandler } = require('../../middleware/errorHandler');
const env = require('../../config/env');

/**
 * POST /api/v1/admin/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.error(res, 'Please provide email and password', 400);
  }

  // Find admin with password field
  const admin = await Admin.findOne({ email }).select('+passwordHash +loginAttempts +lockUntil');

  if (!admin) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  // Check if account is locked
  if (admin.isLocked()) {
    return ApiResponse.error(
      res,
      'Account is temporarily locked due to multiple failed login attempts. Please try again in 30 minutes.',
      423
    );
  }

  // Verify password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    await admin.incrementLoginAttempts();
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  // Check if admin is active
  if (!admin.isActive) {
    return ApiResponse.error(res, 'Account has been deactivated', 403);
  }

  // Reset login attempts on successful login
  await admin.resetLoginAttempts();

  // Generate JWT
  const token = jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return ApiResponse.success(
    res,
    {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
    'Login successful'
  );
});

/**
 * GET /api/v1/admin/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, {
    id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    role: req.admin.role,
  });
});
