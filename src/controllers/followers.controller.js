const FollowersModel = require('../models/followers.model');
const { sendResponse } = require('../utils/response');

/**
 * Followers Controller
 * Handle follower/following operations
 */

exports.getFollowers = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'User ID required', null);
    }

    const followers = await FollowersModel.getFollowers(user_id);
    sendResponse(res, 200, true, 'Followers retrieved', followers);
  } catch (err) {
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'User ID required', null);
    }

    const following = await FollowersModel.getFollowing(user_id);
    sendResponse(res, 200, true, 'Following retrieved', following);
  } catch (err) {
    next(err);
  }
};

exports.checkFollowing = async (req, res, next) => {
  try {
    const { follower_id, following_id } = req.query;

    if (!follower_id || !following_id) {
      return sendResponse(res, 400, false, 'Follower ID and Following ID required', null);
    }

    const isFollowing = await FollowersModel.isFollowing(follower_id, following_id);
    sendResponse(res, 200, true, 'Check complete', { is_following: isFollowing });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'User ID required', null);
    }

    const stats = await FollowersModel.getStats(user_id);
    sendResponse(res, 200, true, 'Stats retrieved', stats);
  } catch (err) {
    next(err);
  }
};

exports.addFollower = async (req, res, next) => {
  try {
    const { follower_id, following_id } = req.body;

    if (!follower_id || !following_id) {
      return sendResponse(res, 400, false, 'Follower ID and Following ID required', null);
    }

    const result = await FollowersModel.addFollower(follower_id, following_id);
    sendResponse(res, 201, true, 'Successfully followed', result);
  } catch (err) {
    next(err);
  }
};

exports.removeFollower = async (req, res, next) => {
  try {
    const { follower_id, following_id } = req.query;

    if (!follower_id || !following_id) {
      return sendResponse(res, 400, false, 'Follower ID and Following ID required', null);
    }

    const result = await FollowersModel.removeFollower(follower_id, following_id);
    sendResponse(res, 200, true, 'Successfully unfollowed', result);
  } catch (err) {
    next(err);
  }
};
