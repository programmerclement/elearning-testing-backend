'use strict';

const db = require('../config/db');

const CouponModel = {
  async create({ code, discount_percentage, expires_at, is_active = 1 }) {
    const [result] = await db.query(
      `INSERT INTO coupons (code, discount_percentage, expires_at, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [code.toUpperCase(), discount_percentage, expires_at || null, is_active]
    );
    return result.insertId;
  },

  async findByCode(code) {
    const [rows] = await db.query(
      `SELECT * FROM coupons 
       WHERE code = ? 
       AND is_active = 1
       AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`,
      [code.toUpperCase()]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM coupons WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async list({ limit, offset }) {
    const [rows] = await db.query(
      `SELECT * FROM coupons ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  async count() {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM coupons`);
    return rows[0].total;
  },

  async update(id, { code, discount_percentage, expires_at, is_active }) {
    const updates = [];
    const params = [];

    if (code !== undefined) { updates.push('code = ?'); params.push(code.toUpperCase()); }
    if (discount_percentage !== undefined) { updates.push('discount_percentage = ?'); params.push(discount_percentage); }
    if (expires_at !== undefined) { updates.push('expires_at = ?'); params.push(expires_at || null); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

    if (updates.length === 0) return 0;

    updates.push('updated_at = NOW()');
    params.push(id);
    
    const query = `UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.query(query, params);
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.query(
      `DELETE FROM coupons WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  },

  async recordUsage(couponId, userId, orderId) {
    try {
      const [result] = await db.query(
        `INSERT INTO coupon_usage (coupon_id, user_id, order_id, created_at) VALUES (?, ?, ?, NOW())`,
        [couponId, userId, orderId || null]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  coupon_usage table not found. Skipping usage record.');
        return null;
      }
      throw error;
    }
  },

  async getUserCouponUsageCount(couponId, userId) {
    try {
      const [rows] = await db.query(
        `SELECT COUNT(*) AS count FROM coupon_usage WHERE coupon_id = ? AND user_id = ?`,
        [couponId, userId]
      );
      return rows[0]?.count || 0;
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  coupon_usage table not found. Returning 0 usage.');
        return 0;
      }
      throw error;
    }
  },

  async getCouponTotalUsage(couponId) {
    try {
      const [rows] = await db.query(
        `SELECT COUNT(*) AS count FROM coupon_usage WHERE coupon_id = ?`,
        [couponId]
      );
      return rows[0]?.count || 0;
    } catch (error) {
      // If coupon_usage table doesn't exist, just return 0
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️  coupon_usage table not found. Run database setup. Returning 0 usage.');
        return 0;
      }
      throw error;
    }
  },
};

module.exports = CouponModel;

