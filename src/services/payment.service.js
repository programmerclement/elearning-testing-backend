'use strict';

const db = require('../config/db');
const PaymentModel = require('../models/payment.model');
const CouponModel = require('../models/coupon.model');
const { notFound, badRequest } = require('../utils/response');

const SERVICE_FEE_RATE = 0.05;
const VAT_RATE = 0.15;

const PaymentService = {
  /**
   * Calculate invoice breakdown with optional coupon
   */
  calculateInvoice(subtotal, discount = 0) {
    const discounted_subtotal = Math.max(0, subtotal - discount);
    const service_fee = parseFloat((discounted_subtotal * SERVICE_FEE_RATE).toFixed(2));
    const taxable_amount = discounted_subtotal + service_fee;
    const vat = parseFloat((taxable_amount * VAT_RATE).toFixed(2));
    const total = parseFloat((discounted_subtotal + service_fee + vat).toFixed(2));
    
    return {
      original_price: subtotal,
      discount_amount: discount,
      subtotal: discounted_subtotal,
      service_fee,
      vat,
      total
    };
  },

  /**
   * Preview invoice — calculate fees with coupon support
   */
  async previewInvoice(query) {
    const { course_id, coupon_code } = query;
    if (!course_id) throw badRequest('course_id query parameter is required');

    const coursePrice = await PaymentModel.getCoursePrice(course_id);
    if (coursePrice === null) throw notFound('Course not found or not published');

    let discount = 0;
    let coupon = null;

    if (coupon_code) {
      coupon = await CouponModel.findByCode(coupon_code);
      if (!coupon) throw notFound('Coupon code not found or inactive');
      discount = (coursePrice * coupon.discount_percentage) / 100;
    }

    const breakdown = this.calculateInvoice(coursePrice, discount);
    return {
      ...breakdown,
      coupon: coupon ? { code: coupon.code, discount_percentage: coupon.discount_percentage } : null
    };
  },

  /**
   * Process payment — atomic SQL transaction with coupon support
   */
  async processPayment(body, user) {
    const { course_id, payment_method, coupon_code } = body;
    if (!course_id) throw badRequest('course_id is required');

    // Check course exists and is published
    const coursePrice = await PaymentModel.getCoursePrice(course_id);
    if (coursePrice === null) throw notFound('Course not found or not available for purchase');

    // Prevent double enrollment
    const alreadyEnrolled = await PaymentModel.isEnrolled(user.id, course_id);
    if (alreadyEnrolled) throw badRequest('You are already enrolled in this course');

    let discount = 0;
    let coupon = null;

    if (coupon_code) {
      coupon = await CouponModel.findByCode(coupon_code);
      if (!coupon) throw notFound('Coupon code not found or inactive');
      discount = (coursePrice * coupon.discount_percentage) / 100;
    }

    const breakdown = this.calculateInvoice(coursePrice, discount);

    // Generate transaction reference (e.g., TXN-YYYYMMDD-12345)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000);
    const transaction_reference = `TXN-${dateStr}-${random}`;

    const result = await PaymentModel.processPayment({
      user_id: user.id,
      course_id,
      subtotal: breakdown.subtotal,
      service_fee: breakdown.service_fee,
      vat: breakdown.vat,
      total: breakdown.total,
      discount: discount,
      coupon_code: coupon_code || null,
      transaction_reference,
      payment_method: payment_method || 'online',
    });

    const invoice = await PaymentModel.findInvoiceById(result.invoice_id);
    return invoice;
  },

  /**
   * Get all invoices with pagination
   */
  async getAllInvoices(query = {}) {
    const { page = 1, limit = 10 } = query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    return PaymentModel.getAllInvoices();
  },

  /**
   * Get payment history for a user
   */
  async getUserPayments(user_id, query = {}) {
    const [rows] = await db.query(
      `SELECT inv.*, c.title AS course_title
       FROM invoices inv
       LEFT JOIN courses c ON c.id = inv.course_id
       WHERE inv.user_id = ?
       ORDER BY inv.created_at DESC
       LIMIT ? OFFSET ?`,
      [user_id, parseInt(query.limit || 10), (Math.max(1, parseInt(query.page || 1)) - 1) * parseInt(query.limit || 10)]
    );
    return rows;
  }
};

module.exports = PaymentService;
