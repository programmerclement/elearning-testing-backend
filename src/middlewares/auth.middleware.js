'use strict';

const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return errorResponse(res, 'No token provided', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

/**
 * Middleware to allow specific roles
 * Usage: allowRoles('admin', 'instructor')
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: You do not have access to this resource', 403);
    }

    next();
  };
};

/**
 * Optional middleware - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};

// Legacy export for backward compatibility - default export is verifyToken
module.exports = verifyToken;

// Also export as named exports for new code
module.exports.verifyToken = verifyToken;
module.exports.allowRoles = allowRoles;
module.exports.optionalAuth = optionalAuth;
module.exports.authenticate = verifyToken; // Alias

