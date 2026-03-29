'use strict';

const pool = require('../config/db');

class User {
  /**
   * Get user by ID
   */
  static async findById(userId) {
    const query = 'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?';
    const [rows] = await pool.query(query, [userId]);
    return rows[0] || null;
  }

  /**
   * Get user by email (includes password for login)
   */
  static async findByEmailForAuth(email) {
    const query = 'SELECT id, name, email, password, role, avatar FROM users WHERE email = ?';
    const [rows] = await pool.query(query, [email]);
    return rows[0] || null;
  }

  /**
   * Get user by email (public - no password)
   */
  static async findByEmail(email) {
    const query = 'SELECT id, name, email, role, avatar, created_at FROM users WHERE email = ?';
    const [rows] = await pool.query(query, [email]);
    return rows[0] || null;
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    const { name, email, password, role = 'student', avatar = null } = userData;
    const query = 'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(query, [name, email, password, role, avatar]);
    return result;
  }

  /**
   * Update user
   */
  static async update(userId, updates) {
    const allowedFields = ['name', 'email', 'avatar', 'role'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fields.length === 0) return null;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(userId);

    const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await pool.query(query, values);
    return result;
  }

  /**
   * Get all users (for admin)
   */
  static async findAll(filters = {}) {
    let query = 'SELECT id, name, email, role, avatar, created_at FROM users WHERE 1=1';
    const values = [];

    if (filters.role) {
      query += ' AND role = ?';
      values.push(filters.role);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(filters.limit || 20, filters.offset || 0);

    const [rows] = await pool.query(query, values);
    return rows;
  }

  /**
   * Count total users
   */
  static async count() {
    const query = 'SELECT COUNT(*) as count FROM users';
    const [rows] = await pool.query(query);
    return rows[0].count;
  }

  /**
   * Count users by role
   */
  static async countByRole(role) {
    const query = 'SELECT COUNT(*) as count FROM users WHERE role = ?';
    const [rows] = await pool.query(query, [role]);
    return rows[0].count;
  }

  /**
   * Delete user (admin only)
   */
  static async delete(userId) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.query(query, [userId]);
    return result;
  }
}

module.exports = User;
