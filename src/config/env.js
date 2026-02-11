require("dotenv").config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/bookmypujari",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
    : ["http://localhost:3000", "http://localhost:3001"],
  RATE_LIMIT_WINDOW_MS:
    parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX_REQUESTS:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  BOOKING_RATE_LIMIT_MAX:
    parseInt(process.env.BOOKING_RATE_LIMIT_MAX, 10) || 10,
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};

// Validate critical env vars in production
if (env.isProd && !env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET must be set in production");
  process.exit(1);
}

if (!env.JWT_SECRET) {
  env.JWT_SECRET = "dev-only-secret-do-not-use-in-production";
  console.warn(
    "WARNING: Using default JWT_SECRET. Set JWT_SECRET env var for production.",
  );
}

module.exports = env;
