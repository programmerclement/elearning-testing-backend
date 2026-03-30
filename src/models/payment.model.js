'use strict';

const db = require('../config/db');

// Service fee rate (5%) and VAT rate (15%)
const SERVICE_FEE_RATE = 0.05;
const VAT_RATE         = 0.15;

const PaymentModel = {
  /**
   * Get course price for preview calculation.
   * Prioritize subscription_price, fall back to price field
   */
  async getCoursePrice(course_id) {
    const [rows] = await db.query(
      `SELECT COALESCE(subscription_price, price) as price FROM courses WHERE id = ? AND deleted_at IS NULL AND status = 'published'`,
      [course_id]
    );
    return rows[0] ? parseFloat(rows[0].price) : null;
  },

  /**
   * Check if a user is already enrolled in a course.
   */
  async isEnrolled(user_id, course_id) {
    const [rows] = await db.query(
      `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [user_id, course_id]
    );
    return rows.length > 0;
  },

  /**
   * Create invoice + enrollment inside a single SQL transaction (CRITICAL).
   * Now supports discount and coupon code.
   */
  async processPayment({
    user_id, course_id, subtotal, service_fee, vat, total,
    discount, coupon_code, transaction_reference, payment_method
  }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Insert invoice
      const [invoiceResult] = await conn.query(
        `INSERT INTO invoices
           (user_id, course_id, subtotal, service_fee, vat, total, discount, coupon_code, 
            transaction_reference, status, payment_method, paid_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, NOW())`,
        [
          user_id, course_id, subtotal, service_fee, vat, total,
          discount || 0, coupon_code || null, transaction_reference || null,
          payment_method || 'online'
        ]
      );
      const invoice_id = invoiceResult.insertId;

      // 2. Insert enrollment
      await conn.query(
        `INSERT INTO enrollments (user_id, course_id, invoice_id) VALUES (?, ?, ?)`,
        [user_id, course_id, invoice_id]
      );

      await conn.commit();
      return { invoice_id };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findInvoiceById(id) {
    const [rows] = await db.query(
      `SELECT inv.*, u.name AS user_name, c.title AS course_title
       FROM invoices inv
       LEFT JOIN users   u ON u.id = inv.user_id
       LEFT JOIN courses c ON c.id = inv.course_id
       WHERE inv.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Calculate fees based on subtotal.
   */
  calculateFees(subtotal) {
    const service_fee = parseFloat((subtotal * SERVICE_FEE_RATE).toFixed(2));
    const vat         = parseFloat(((subtotal + service_fee) * VAT_RATE).toFixed(2));
    const total       = parseFloat((subtotal + service_fee + vat).toFixed(2));
    return { subtotal, service_fee, vat, total };
  },

  /**
   * Get all invoices with related user and course info for admin dashboard
   */
  async getAllInvoices() {
    const [invoices] = await db.query(
      `SELECT inv.id, inv.user_id, inv.course_id, inv.subtotal, inv.service_fee, inv.vat, inv.total, 
              inv.status, inv.payment_method, inv.transaction_ref, inv.paid_at, inv.created_at, inv.updated_at,
              u.name AS user_name, u.email AS user_email,
              c.title AS course_title
       FROM invoices inv
       LEFT JOIN users u ON u.id = inv.user_id
       LEFT JOIN courses c ON c.id = inv.course_id
       ORDER BY inv.created_at DESC`
    );
    return invoices;
  },
};

module.exports = PaymentModel;
