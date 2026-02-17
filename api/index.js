/**
 * Vercel Serverless Function Handler
 * This file serves as the entry point for Vercel's serverless function
 */

const path = require('path');
const express = require('express');
const session = require('express-session');
const { default: mongoose } = require('mongoose');
const MongoStore = require('connect-mongo');
const multer = require('multer');

// Local Module
const storeRouter = require("../routes/storeRouter");
const hostRouter = require("../routes/hostRouter");
const authRouter = require("../routes/auth_Router");
const rootDir = require("../utils/pathUtil");
const errorsController = require("../controllers/errors");
const { setupConnectionListeners, connectDatabase } = require("../config/database");
const { errorHandler, asyncHandler, AppError } = require("../middleware/errorHandler");
const { requestLogger } = require("../middleware/requestLogger");

// Environment variables (Vercel provides these automatically)
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880;

// Validate required environment variables
const requiredEnvVars = ['SESSION_SECRET', 'MONGO_DB_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`✗ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please add these to Vercel project settings.');
}

const app = express();

// ========== Logging ==========
console.log(`🚀 Starting Airbnb App in ${NODE_ENV} mode`);
console.log(`\n📋 Environment Variables Status:`);
console.log(`  - NODE_ENV: ${NODE_ENV}`);
console.log(`  - SESSION_SECRET: ${SESSION_SECRET ? '✓ Set' : '✗ MISSING'}`);
console.log(`  - MONGO_DB_URI: ${MONGO_DB_URI ? '✓ Set' : '✗ MISSING'}`);
console.log(`  - MAX_FILE_SIZE: ${MAX_FILE_SIZE}`);
console.log(`  - UPLOAD_DIR: ${UPLOAD_DIR}\n`);

// ========== View Engine Setup ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// ========== Utility Functions ==========
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
      cb(null, '/tmp');
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
app.use(requestLogger);
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(multer(multerOptions).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'Rulephoto', maxCount: 1 }
]));

app.use(express.static(path.join(__dirname, '../public')));
app.use("/uploads", express.static('/tmp'));
app.use("/host/uploads", express.static('/tmp'));

// ========== Session Configuration ==========
const mongoUri = process.env.MONGO_DB_URI;
if (!mongoUri) {
  console.error('✗ MONGO_DB_URI environment variable is not set');
  throw new Error('MONGO_DB_URI is required');
}

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: mongoUri,
    touchAfter: 24 * 3600
  }),
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
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

// Connect to database once at startup
let dbConnected = false;

// ========== Health Check Endpoint (BEFORE error handlers) ==========
app.get('/api/health', (req, res) => {
  try {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      uptime: process.uptime(),
      mongoDbConnected: dbConnected
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

const ensureDbConnection = async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDatabase();
      setupConnectionListeners();
      dbConnected = true;
      console.log('✓ Database connected');
    } catch (error) {
      console.error('✗ Database connection failed:', error.message);
      return res.status(503).json({
        status: 503,
        message: 'Database connection failed',
        error: NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  next();
};

app.use(ensureDbConnection);

// ========== Routes ==========
app.use(authRouter);
app.use(storeRouter);

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

module.exports = app;
