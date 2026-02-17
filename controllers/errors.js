/**
 * Error Controller
 * Handles error responses and page not found scenarios
 */

const { AppError } = require("../middleware/errorHandler");

/**
 * 404 Page Not Found Handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.pageNotFound = (req, res, next) => {
  try {
    console.warn(`⚠ 404 Not Found: ${req.method} ${req.originalUrl}`);
    
    res
      .status(404)
      .render("404", {
        pageTitle: "Page Not Found",
        currentPage: "404",
        isLoggedIn: req.isLoggedIn || false,
        user: req.session.user || {},
        requestPath: req.originalUrl
      });
  } catch (error) {
    console.error('✗ Error rendering 404 page:', error);
    // Fallback JSON response if view rendering fails
    res.status(404).json({
      status: 404,
      message: "Page Not Found",
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Server Error Handler
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.handleServerError = (error, req, res, next) => {
  try {
    console.error('✗ Server Error:', {
      message: error.message,
      status: error.status || 500,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    const statusCode = error.status || 500;
    const message = error.message || 'An unexpected error occurred';

    res
      .status(statusCode)
      .render("error", {
        pageTitle: "Error",
        currentPage: "error",
        isLoggedIn: req.isLoggedIn || false,
        user: req.session.user || {},
        message,
        status: statusCode
      });
  } catch (renderError) {
    console.error('✗ Error rendering error page:', renderError);
    res.status(500).json({
      status: 500,
      message: "An error occurred while processing your request",
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Catch-all error middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function  
 */
exports.errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  exports.handleServerError(err, req, res, next);
};