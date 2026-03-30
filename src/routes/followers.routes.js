const express = require('express');
const router = express.Router();
const followersController = require('../controllers/followers.controller');

/**
 * Followers Routes
 * GET  /followers                  - Get followers of a user
 * GET  /followers/following        - Get users being followed
 * GET  /followers/check            - Check if following
 * GET  /followers/stats            - Get follower stats
 * POST /followers                  - Add a follower
 * DELETE /followers                - Remove a follower
 */

// Get followers of a user
router.get('/', followersController.getFollowers);

// Get users being followed
router.get('/following', followersController.getFollowing);

// Check if user follows another user
router.get('/check', followersController.checkFollowing);

// Get follower/following stats
router.get('/stats', followersController.getStats);

// Add a follower (follow)
router.post('/', followersController.addFollower);

// Remove a follower (unfollow)
router.delete('/', followersController.removeFollower);

module.exports = router;
