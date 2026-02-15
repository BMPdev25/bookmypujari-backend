const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  // If already connected, skip
  if (mongoose.connection.readyState >= 1) return;

  try {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 1, // Reduced min pool size for serverless
    };

    const conn = await mongoose.connect(env.MONGODB_URI, options);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown (only for local dev, not serverless)
    if (process.env.VERCEL !== '1') {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;

