/**
 * MAIN EXPRESS SERVER ENTRY POINT (server.js)
 * -------------------------------------------------------------
 * Connections:
 * - Loaded by: node server.js
 * - Connects DB via: config/db.js
 * - Mounts API Routes:
 *     /api/auth         --> routes/authRoutes.js
 *     /api/admin        --> routes/adminRoutes.js
 *     /api/students     --> routes/studentRoutes.js
 *     /api/companies    --> routes/companyRoutes.js
 *     /api/jobs         --> routes/jobRoutes.js
 *     /api/applications --> routes/applicationRoutes.js
 * - Static file serving: /uploads --> uploads/
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directory for uploads (PDF Resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Disable HTTP caching on API responses to prevent back button caching
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Mount API Routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

// Root test route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Campus Placement Management System API is running...' });
});

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API route '${req.originalUrl}' not found.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum allowed size exceeded.' });
    }
    return res.status(400).json({ message: err.message || 'File upload error' });
  }
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || 500);
  res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
