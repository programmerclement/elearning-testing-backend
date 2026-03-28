'use strict';

/**
 * Simulated Auth Middleware
 * In production, verify JWT and load user from DB.
 */
const authenticate = (req, _res, next) => {
  // Dummy authenticated user
  req.user = { id: 1, role: 'instructor' };
  next();
};

module.exports = authenticate;
