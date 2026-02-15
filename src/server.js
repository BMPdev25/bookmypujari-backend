const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
mongoose.set('debug', true); // Enable mongoose debugging temporarily

const connectDB = require('./config/db');
const env = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import public routes
const publicPujaRoutes = require('./routes/public/pujas');
const publicBookingRoutes = require('./routes/public/bookings');
const publicCallbackRoutes = require('./routes/public/callbacks');

// Import admin routes
const adminAuthRoutes = require('./routes/admin/auth');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminPujaRoutes = require('./routes/admin/pujas');
const adminBookingRoutes = require('./routes/admin/bookings');
const adminPujariRoutes = require('./routes/admin/pujaris');
const adminPujaItemRoutes = require('./routes/admin/pujaItems');
const adminCallbackRoutes = require('./routes/admin/callbacks');

const app = express();

// ================================================
// SECURITY MIDDLEWARE
// ================================================

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: env.isProd ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      console.error(`CORS Blocked: Origin '${origin}' is not in allowed list: ${env.CORS_ORIGINS}`);
      const error = new Error('Not allowed by CORS');
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours preflight cache
  })
);

// ================================================
// DATABASE CONNECTION MIDDLEWARE
// ================================================

// Connect to MongoDB before handling requests (cached for serverless)
// MUST be before routes to ensure connection exists
let isConnected = false;
app.use(async (req, res, next) => {
  // Skip DB connection for health check and simple preflight
  if (req.path === '/health' || req.method === 'OPTIONS') {
    return next();
  }

  try {
    if (!isConnected) {
      if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return next();
      }
      await connectDB();
      isConnected = true;
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed' 
    });
  }
});

// Global rate limiter - 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Stricter rate limiter for booking creation
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.BOOKING_RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter - prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================================================
// REQUEST PARSING & SANITIZATION
// ================================================

// Body parser with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Request logging
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ================================================
// HEALTH CHECK
// ================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BookMyPujari API is running',
    environment: env.NODE_ENV,
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to BookMyPujari API! Use /api/v1 for endpoints.'
  });
});



// ================================================
// PUBLIC API ROUTES (No Auth Required)
// ================================================

app.use('/api/v1/public/pujas', publicPujaRoutes);
app.use('/api/v1/public/bookings', bookingLimiter, publicBookingRoutes);
app.use('/api/v1/public/callbacks', publicCallbackRoutes);

// ================================================
// ADMIN API ROUTES (JWT Auth Required)
// ================================================

app.use('/api/v1/admin/auth', authLimiter, adminAuthRoutes);
app.use('/api/v1/admin/dashboard', authenticate, adminDashboardRoutes);
app.use('/api/v1/admin/pujas', authenticate, adminPujaRoutes);
app.use('/api/v1/admin/bookings', authenticate, adminBookingRoutes);
app.use('/api/v1/admin/pujaris', authenticate, adminPujariRoutes);
app.use('/api/v1/admin/puja-items', authenticate, adminPujaItemRoutes);
app.use('/api/v1/admin/callbacks', authenticate, adminCallbackRoutes);

// ================================================
// ERROR HANDLING
// ================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// ================================================
// START SERVER
// ================================================

// Connect to MongoDB before handling requests (cached for serverless)
// ================================================
// DATABASE CONNECTION MIDDLEWARE
// ================================================

// Only start listening locally (not on Vercel)
if (env.isDev || process.env.VERCEL !== '1') {
  const startServer = async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }
      app.listen(env.PORT, () => {
        console.log(`\n🚀 BookMyPujari API Server`);
        console.log(`   Environment: ${env.NODE_ENV}`);
        console.log(`   Port: ${env.PORT}`);
        console.log(`   Health: http://localhost:${env.PORT}/health`);
        console.log(`   Public API: http://localhost:${env.PORT}/api/v1/public`);
        console.log(`   Admin API: http://localhost:${env.PORT}/api/v1/admin`);
        console.log('');
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;
