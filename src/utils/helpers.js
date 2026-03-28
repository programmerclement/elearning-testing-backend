'use strict';

/**
 * Parse pagination query params with safe defaults.
 * @param {object} query - Express req.query
 * @param {number} defaultLimit
 * @returns {{ page, limit, offset }}
 */
const paginate = (query = {}, defaultLimit = 10) => {
  const page  = Math.max(1, parseInt(query.page  || '1',  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || String(defaultLimit), 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build a public file URL from a multer file object.
 * Swap this implementation when migrating to cloud storage.
 * @param {Express.Multer.File} file
 * @returns {string}
 */
const fileUrl = (file) => {
  if (!file) return null;
  // Normalise Windows backslashes and make path relative to project root
  const relative = file.path.replace(/\\/g, '/').split('uploads/').pop();
  return `/uploads/${relative}`;
};

module.exports = { paginate, fileUrl };
