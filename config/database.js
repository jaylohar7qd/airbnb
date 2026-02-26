/**
 * Database Configuration Module
 * Handles MongoDB connection with error handling and logging
 */

const mongoose = require('mongoose');

// Get configuration from environment
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Connect to MongoDB with retry logic and error handling
 * @returns {Promise} MongoDB connection promise
 */
const connectDatabase = async () => {
  try {
    if (!MONGO_DB_URI) {
      throw new Error('MONGO_DB_URI environment variable is not defined');
    }

    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const connection = await mongoose.connect(MONGO_DB_URI, connectionOptions);

    console.log(`✓ MongoDB Connected Successfully in ${NODE_ENV} mode`);
    console.log(`  Database: ${connection.connections[0].name}`);
    console.log(`  Host: ${connection.connections[0].host}`);

    return connection;
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString(),
    });

    // Log more detailed error info for debugging
    if (error.message.includes('ECONNREFUSED')) {
      console.error('  → Connection refused: Check if MongoDB is running and accessible');
    }
    if (error.message.includes('authentication failed')) {
      console.error('  → Authentication failed: Check username and password in MONGO_DB_URI');
    }
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('  → DNS resolution failed: Check the hostname in MONGO_DB_URI');
    }
    if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
      console.error('  → Permission denied: Check IP whitelist on MongoDB Atlas');
    }

    // In serverless environment, don't exit - just throw the error
    throw error;
  }
};

/**
 * Handle MongoDB connection events
 */
const setupConnectionListeners = () => {
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠ MongoDB Disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('✗ MongoDB Connection Error:', error.message);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✓ MongoDB Reconnected');
  });
};

module.exports = {
  connectDatabase,
  setupConnectionListeners,
};
