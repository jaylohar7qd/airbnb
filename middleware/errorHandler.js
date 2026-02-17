/**
 * Global Error Handler Middleware
 * Centralized error handling for all routes and controllers
 */

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.id || 'unknown';

  // Default error properties
  const errorResponse = {
    status: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    timestamp,
    requestId,
    ...(NODE_ENV === 'development' && { stack: err.stack, details: err }),
  };

  // Log error with context
  console.error('✗ Error Handler Triggered:', {
    status: errorResponse.status,
    message: errorResponse.message,
    url: req.originalUrl,
    method: req.method,
    timestamp,
    ...(err.code && { errorCode: err.code }),
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    errorResponse.status = 422;
    errorResponse.message = 'Validation Error';
    errorResponse.errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    errorResponse.status = 400;
    errorResponse.message = 'Invalid ID format';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    errorResponse.status = 409;
    errorResponse.message = `${Object.keys(err.keyPattern)[0]} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse.status = 401;
    errorResponse.message = 'Invalid token';
  }

  // TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    errorResponse.status = 401;
    errorResponse.message = 'Token expired';
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    errorResponse.status = 400;
    if (err.code === 'FILE_TOO_LARGE') {
      errorResponse.message = 'File size exceeds limit';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      errorResponse.message = 'Too many files';
    } else {
      errorResponse.message = `File upload error: ${err.message}`;
    }
  }

  // In production, don't send error details to client
  if (NODE_ENV === 'production') {
    delete errorResponse.stack;
    delete errorResponse.details;
    if (errorResponse.status === 500) {
      errorResponse.message = 'An unexpected error occurred. Please try again later.';
    }
  }

  // Send error response
  res.status(errorResponse.status).json(errorResponse);
};

/**
 * Async error wrapper for try-catch blocks
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
};
