/**
 * Airbnb App - Main Application File
 * Entry point for the Express application
 */

// Load environment variables
require('dotenv').config();

// Core Module
const path = require('path');

// External Module
const express = require('express');
const session = require('express-session');
const {default: mongoose} = require('mongoose');
const MongoStore = require('connect-mongo');
const multer = require('multer');

// Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/auth_Router");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const { connectDatabase, setupConnectionListeners } = require("./config/database");
const { errorHandler, asyncHandler, AppError } = require("./middleware/errorHandler");
const { requestLogger } = require("./middleware/requestLogger");

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-key';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB default



const app = express();

// ========== Logging ==========
console.log(`\n🚀 Starting Airbnb App in ${NODE_ENV} mode on port ${PORT}\n`);

// ========== View Engine Setup ==========
app.set('view engine', 'ejs');
app.set('views', 'views');

// ========== Utility Functions ==========
/**
 * Generate random string for file naming
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
const randomString = (length) => {
  const character = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += character.charAt(Math.floor(Math.random() * character.length));
  }
  return result;
};

// ========== File Upload Configuration ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(new AppError(`Failed to set upload destination: ${err.message}`, 500));
    }
  },
  filename: (req, file, cb) => {
    try {
      const uniqueName = `${randomString(10)}-${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    } catch (err) {
      cb(new AppError(`Failed to generate filename: ${err.message}`, 500));
    }
  }
});

const fileFilter = (req, file, cb) => {
  try {
    const allowedMimes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PNG, JPG, JPEG, and PDF files are allowed', 400));
    }
  } catch (err) {
    cb(err);
  }
};

const multerOptions = {
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
};

// ========== Middleware Setup ==========
// Request logging
app.use(requestLogger);

// Body parser (increased limit for file uploads)
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

// File upload handling
app.use(multer(multerOptions).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'Rulephoto', maxCount: 1 }
]));

// Static files
app.use(express.static(path.join(rootDir, 'public')));
app.use("/uploads", express.static(path.join(rootDir, UPLOAD_DIR)));
app.use("/host/uploads", express.static(path.join(rootDir, UPLOAD_DIR)));


// ========== Session Configuration ==========
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_DB_URI,
    touchAfter: 24 * 3600 // Lazy session update
  }),
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ========== Session Middleware ==========
app.use((req, res, next) => {
  try {
    req.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.isLoggedIn = req.isLoggedIn;
    res.locals.user = req.session.user || {};
    next();
  } catch (err) {
    console.error('✗ Session Middleware Error:', err.message);
    next(new AppError('Session Error', 500, err.message));
  }
});

// ========== Routes ==========
app.use(authRouter);
app.use(storeRouter);

// Protected Host Routes (Require Login)
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    return next();
  }
  console.warn('⚠ Unauthorized access attempt to /host');
  return res.redirect("/login");
});
app.use("/host", hostRouter);

// ========== 404 Handler ==========
app.use(errorsController.pageNotFound);

// ========== Global Error Handler ==========
app.use(errorHandler);

// ========== Database Connection & Server Startup ==========
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    setupConnectionListeners();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`\n✓ Server running successfully`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Environment: ${NODE_ENV}`);
      console.log(`  Process ID: ${process.pid}\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⚠ SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✓ Server closed');
        mongoose.connection.close(false, () => {
          console.log('✓ MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⚠ SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✓ Server closed');
        mongoose.connection.close(false, () => {
          console.log('✓ MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('✗ Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();