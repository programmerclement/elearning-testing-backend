const db = require('../config/db');

/**
 * Followers Model
 * Handles follower/following relationships
 */

class FollowersModel {
  /**
   * Get followers of a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} List of followers
   */
  static async getFollowers(userId) {
    const query = `
      SELECT 
        f.id,
        f.follower_id,
        f.created_at,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.avatar
      FROM followers f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `;
    const [followers] = await db.query(query, [userId]);
    return followers.map(f => ({
      id: f.id,
      follower_id: f.follower_id,
      created_at: f.created_at,
      user: {
        id: f.user_id,
        name: f.name,
        email: f.email,
        role: f.role,
        avatar: f.avatar,
      },
    }));
  }

  /**
   * Get users that a user is following
   * @param {number} userId - User ID
   * @returns {Promise<Array>} List of users being followed
   */
  static async getFollowing(userId) {
    const query = `
      SELECT 
        f.id,
        f.following_id,
        f.created_at,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.avatar
      FROM followers f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `;
    const [following] = await db.query(query, [userId]);
    return following.map(f => ({
      id: f.id,
      following_id: f.following_id,
      created_at: f.created_at,
      user: {
        id: f.user_id,
        name: f.name,
        email: f.email,
        role: f.role,
        avatar: f.avatar,
      },
    }));
  }

  /**
   * Check if user follows another user
   * @param {number} followerId - Follower user ID
   * @param {number} followingId - User being followed
   * @returns {Promise<boolean>} True if follows, false otherwise
   */
  static async isFollowing(followerId, followingId) {
    const query = `
      SELECT id FROM followers
      WHERE follower_id = ? AND following_id = ?
      LIMIT 1
    `;
    const [result] = await db.query(query, [followerId, followingId]);
    return result.length > 0;
  }

  /**
   * Add a follower relationship
   * @param {number} followerId - Follower user ID
   * @param {number} followingId - User to follow
   * @returns {Promise<Object>} Created relationship
   */
  static async addFollower(followerId, followingId) {
    // Prevent self-follow
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if already following
    const isFollowing = await this.isFollowing(followerId, followingId);
    if (isFollowing) {
      throw new Error('Already following this user');
    }

    const query = `
      INSERT INTO followers (follower_id, following_id)
      VALUES (?, ?)
    `;
    const [result] = await db.query(query, [followerId, followingId]);
    return {
      id: result.insertId,
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date(),
    };
  }

  /**
   * Remove a follower relationship
   * @param {number} followerId - Follower user ID
   * @param {number} followingId - User to unfollow
   * @returns {Promise<Object>} Result { affectedRows }
   */
  static async removeFollower(followerId, followingId) {
    const query = `
      DELETE FROM followers
      WHERE follower_id = ? AND following_id = ?
    `;
    const [result] = await db.query(query, [followerId, followingId]);
    if (result.affectedRows === 0) {
      throw new Error('Follower relationship not found');
    }
    return { affectedRows: result.affectedRows };
  }

  /**
   * Get follower count for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Number of followers
   */
  static async getFollowerCount(userId) {
    const query = `
      SELECT COUNT(*) as count FROM followers
      WHERE following_id = ?
    `;
    const [result] = await db.query(query, [userId]);
    return result[0].count;
  }

  /**
   * Get following count for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Number of users being followed
   */
  static async getFollowingCount(userId) {
    const query = `
      SELECT COUNT(*) as count FROM followers
      WHERE follower_id = ?
    `;
    const [result] = await db.query(query, [userId]);
    return result[0].count;
  }

  /**
   * Get follower stats for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} { followers, following }
   */
  static async getStats(userId) {
    const followerCount = await this.getFollowerCount(userId);
    const followingCount = await this.getFollowingCount(userId);
    return {
      followers: followerCount,
      following: followingCount,
    };
  }
}

module.exports = FollowersModel;
