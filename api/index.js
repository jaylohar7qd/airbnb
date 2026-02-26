/**
 * Vercel Serverless Function Handler
 * Production-ready version with proper error handling
 */

const express = require('express');
const path = require('path');

// Basic app setup
const app = express();

// Environment variables validation
const NODE_ENV = process.env.NODE_ENV || 'production';
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

console.log('🚀 Starting Vercel Function...');
console.log(`NODE_ENV: ${NODE_ENV}`);
console.log(`MONGO_DB_URI: ${MONGO_DB_URI ? '✓ Set' : '✗ Missing'}`);
console.log(`SESSION_SECRET: ${SESSION_SECRET ? '✓ Set' : '✗ Missing'}`);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Airbnb API is running!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API endpoint working' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    status: 500,
    message: NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Not Found'
  });
});

// Export for Vercel
module.exports = app;
