# Airbnb Application - Deployment & Configuration Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update `.env` with your actual configuration values

3. **Start the application:**
   ```bash
   npm start
   ```

## 📋 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGO_DB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?appName=appname

# Server Configuration
NODE_ENV=development  # development or production
PORT=3000

# Session Configuration
SESSION_SECRET=your_secret_key_here
COOKIE_MAX_AGE=86400000

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=uploads

# Server Logging
LOG_LEVEL=debug  # debug, info, warn, error
```

## 🛡️ Error Handling Features

The application includes comprehensive error handling:

### 1. **Async Error Wrapper**
   - Automatically catches errors in async functions
   - Prevents unhandled promise rejections

### 2. **Global Error Handler**
   - Centralized error processing
   - Specific error type handling (Validation, Cast, Duplicate Key, etc.)
   - Different responses for production vs development

### 3. **Database Connection Management**
   - Automatic retry logic
   - Connection event listeners
   - Graceful error logging

### 4. **File Upload Validation**
   - File type validation
   - File size limits
   - Error handling for multer errors

### 5. **Request Logging**
   - Request ID tracking
   - Response time monitoring
   - Request metadata logging

## 🔧 Configuration Files

### `/config/database.js`
Handles MongoDB connection with error handling and retry logic

### `/middleware/errorHandler.js`
- `errorHandler`: Main error handling middleware
- `asyncHandler`: Wraps async functions to catch errors
- `AppError`: Custom error class

### `/middleware/requestLogger.js`
Logs incoming requests with metadata and response times

## 📊 Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS certificates for secure cookies
- [ ] Update MongoDB URI to production database
- [ ] Set secure SESSION_SECRET (use strong random string)
- [ ] Configure proper file upload limits
- [ ] Test error handling scenarios
- [ ] Review and update error messages for production
- [ ] Set up monitoring and logging
- [ ] Test graceful shutdown procedures

## 🧪 Error Scenarios Handled

1. **MongoDB Connection Errors**
   - Missing URI configuration
   - Authentication failures
   - Network timeouts

2. **Validation Errors**
   - Form data validation
   - Mongoose schema validation
   - File upload validation

3. **File Upload Errors**
   - File too large
   - Invalid file type
   - Upload directory issues

4. **Session Errors**
   - Session middleware failures
   - Cookie parsing errors

5. **Route Errors**
   - 404 Page Not Found
   - Invalid routes
   - Protected route access

## ⚙️ Development vs Production

### Development Mode
```env
NODE_ENV=development
```
- Detailed error messages with stack traces
- Verbose logging
- Dynamic error response details

### Production Mode
```env
NODE_ENV=production
```
- Generic error messages (for security)
- Minimal logging
- Secure cookie settings (HTTPS only)
- Process exit on connection failure

## 🔐 Security Features

- HTTPOnly cookies (prevent XSS attacks)
- Secure cookies in production (HTTPS only)
- SameSite cookie policy (strict)
- Session timeout (24 hours default)
- Input validation
- File type restrictions

## 📝 Logging Levels

The application uses different symbols for logging:
- ✓ Success/Info
- ⚠ Warning
- ✗ Error
- 🚀 Startup

## 🚨 Graceful Shutdown

The application handles graceful shutdown on:
- SIGTERM signal
- SIGINT signal (Ctrl+C)
- Uncaught exceptions
- Unhandled promise rejections

All connections are properly closed before process termination.

## 📞 Support & Debugging

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGO_DB_URI format
   - Verify database credentials
   - Ensure network connectivity
   - Check firewall/IP whitelist on MongoDB Atlas

2. **File Upload Issues**
   - Verify UPLOAD_DIR path exists
   - Check file size limits
   - Validate file types
   - Ensure write permissions

3. **Session Errors**
   - Verify SESSION_SECRET is set
   - Check MongoDB URI for session store
   - Clear browser cookies if issues persist

## 🔍 Health Check

To verify the application is running correctly:

```bash
curl http://localhost:3000/
```

Check logs for:
- ✓ Database connection message
- ✓ Server startup message
- ✓ No error messages in console

---

**Version**: 1.0.0  
**Last Updated**: February 17, 2026
