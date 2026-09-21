const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes by checking JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bca_awd_placement_system_secret_key_2026');
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User account no longer exists' });
      }

      if (req.user.isDeleted) {
        return res.status(403).json({ message: 'This account has been deleted or deactivated. Please contact the administrator.' });
      }

      return next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message || error);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
