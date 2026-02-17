/**
 * Request Logger Middleware
 * Logs incoming requests with timestamp and method information
 */

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Attach request ID to request object
  req.id = requestId;

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? '⚠' : '✓';
    
    if (NODE_ENV === 'development') {
      console.log(`${logLevel} [${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
    
    return originalJson(data);
  };

  next();
};

module.exports = {
  requestLogger,
};
