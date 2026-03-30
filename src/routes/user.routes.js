const express = require('express');
const router = express.Router();
const UserModel = require('../models/user.model');
const { sendResponse } = require('../utils/response');

/**
 * User Routes
 * GET /users/:id - Get user profile by ID
 */

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendResponse(res, 400, false, 'User ID required', null);
    }

    // Get user by ID
    const query = `SELECT id, name, email, role, bio, avatar, created_at FROM users WHERE id = ?`;
    const [users] = await require('../config/db').query(query, [id]);

    if (users.length === 0) {
      return sendResponse(res, 404, false, 'User not found', null);
    }

    sendResponse(res, 200, true, 'User retrieved', users[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
