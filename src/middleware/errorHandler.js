const env = require('../config/env');

/**
 * Global error handler middleware
 * Catches all errors and returns structured JSON responses
 * Never leaks internal details in production
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists.`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  }

  // Log error in development
  if (env.isDev) {
    console.error('ERROR:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  } else {
    // In production, only log server errors
    if (statusCode >= 500) {
      console.error('SERVER ERROR:', err.message);
    }
  }

  res.status(statusCode).json({
    success: false,
    message: env.isProd && statusCode >= 500 ? 'Internal Server Error' : message,
    ...(env.isDev && { stack: err.stack }),
  });
};

/**
 * Async handler wrapper - catches async errors and forwards to error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
