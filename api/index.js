/**
 * Vercel Serverless Function Handler
 * Entry point for Vercel's serverless deployment
 */

const path = require('path');

console.log('📦 Initializing Airbnb Vercel Function...');

try {
  // Load all dependencies
  const express = require('express');
  const session = require('express-session');
  const { default: mongoose } = require('mongoose');
  const MongoStore = require('connect-mongo');
  const multer = require('multer');

  // Load local modules
  const storeRouter = require("../routes/storeRouter");
  const hostRouter = require("../routes/hostRouter");
  const authRouter = require("../routes/auth_Router");
  const rootDir = require("../utils/pathUtil");
  const errorsController = require("../controllers/errors");
  const { setupConnectionListeners, connectDatabase } = require("../config/database");
  const { errorHandler, AppError } = require("../middleware/errorHandler");
  const { requestLogger } = require("../middleware/requestLogger");

  console.log('✓ All modules loaded');

  // Environment variables
  const NODE_ENV = process.env.NODE_ENV || 'production';
  const PORT = process.env.PORT || 3000;
  const SESSION_SECRET = process.env.SESSION_SECRET;
  const MONGO_DB_URI = process.env.MONGO_DB_URI;
  const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880;

  console.log(`\n🔍 Environment Status:`);
  console.log(`  NODE_ENV: ${NODE_ENV}`);
  console.log(`  SESSION_SECRET: ${SESSION_SECRET ? '✓' : '✗'}`);
  console.log(`  MONGO_DB_URI: ${MONGO_DB_URI ? '✓' : '✗'}\n`);

  const app = express();

  // View engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));

  // Utility
  const randomString = (len) => {
    let str = '';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i++) str += chars[Math.floor(Math.random() * chars.length)];
    return str;
  };

  // File upload
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/tmp'),
    filename: (req, file, cb) => cb(null, `${randomString(10)}-${Date.now()}-${file.originalname}`)
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  };

  // Middleware
  app.use(requestLogger);
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.json({ limit: '50mb' }));
  app.use(multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
  }).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'Rulephoto', maxCount: 1 }
  ]));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use("/uploads", express.static('/tmp'));
  app.use("/host/uploads", express.static('/tmp'));

  // Session
  app.use(session({
    secret: SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: true,
    store: MONGO_DB_URI ? new MongoStore({
      mongoUrl: MONGO_DB_URI,
      touchAfter: 86400
    }) : undefined,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000
    }
  }));

  // Session context
  app.use((req, res, next) => {
    req.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.isLoggedIn = req.isLoggedIn;
    res.locals.user = req.session.user || {};
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      uptime: process.uptime()
    });
  });

  // Database connection
  let dbConnected = false;
  const ensureDbConnection = async (req, res, next) => {
    if (req.path === '/api/health') return next();
    if (!dbConnected && MONGO_DB_URI) {
      try {
        await connectDatabase();
        setupConnectionListeners();
        dbConnected = true;
        console.log('✓ Database connected');
      } catch (error) {
        console.error('✗ Database error:', error.message);
        return res.status(503).json({ status: 503, message: 'Database unavailable' });
      }
    }
    next();
  };

  app.use(ensureDbConnection);

  // Routes
  app.use(authRouter);
  app.use(storeRouter);
  app.use("/host", (req, res, next) => {
    if (req.isLoggedIn) return next();
    return res.redirect("/login");
  });
  app.use("/host", hostRouter);

  // Error handlers
  app.use(errorsController.pageNotFound);
  app.use(errorHandler);
  app.use((err, req, res, next) => {
    console.error('✗ Error:', err.message);
    res.status(500).json({ status: 500, message: NODE_ENV === 'production' ? 'Error' : err.message });
  });

  console.log('✓ Vercel function ready\n');

  module.exports = app;

} catch (initError) {
  console.error('✗ INITIALIZATION FAILED');
  console.error(initError.message);
  console.error(initError.stack);

  // Fallback app
  const express = require('express');
  const fallback = express();

  fallback.get('/api/health', (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'Initialization failed: ' + initError.message
    });
  });

  fallback.use((req, res) => {
    res.status(500).json({ status: 500, message: 'App initialization failed' });
  });

  module.exports = fallback;
}
