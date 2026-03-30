'use strict';

const PaymentService = require('../services/payment.service');
const { success, created } = require('../utils/response');

const PaymentController = {
  /**
   * @swagger
   * /api/invoices/preview:
   *   get:
   *     summary: Preview invoice breakdown before payment
   *     tags: [Payments]
   *     parameters:
   *       - in: query
   *         name: course_id
   *         required: true
   *         schema: { type: integer }
   *         description: ID of the course to purchase
   *     responses:
   *       200:
   *         description: Invoice preview with fee breakdown
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean }
   *                 data:
   *                   type: object
   *                   properties:
   *                     subtotal:    { type: number, example: 49.99 }
   *                     service_fee: { type: number, example: 2.50 }
   *                     vat:         { type: number, example: 7.87 }
   *                     total:       { type: number, example: 60.36 }
   *       400:
   *         description: course_id required
   *       404:
   *         description: Course not found or not published
   */
  async previewInvoice(req, res, next) {
    try {
      const data = await PaymentService.previewInvoice(req.query);
      return success(res, data, 'Invoice preview');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/payments:
   *   post:
   *     summary: Process a payment and enroll in a course (atomic SQL transaction)
   *     tags: [Payments]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [course_id]
   *             properties:
   *               course_id:
   *                 type: integer
   *                 example: 3
   *               payment_method:
   *                 type: string
   *                 example: "credit_card"
   *                 description: "online | credit_card | paypal | bank_transfer"
   *     responses:
   *       201:
   *         description: Payment processed and enrollment created
   *       400:
   *         description: Already enrolled or validation error
   *       404:
   *         description: Course not found or not published
   *       500:
   *         description: Transaction failed — automatically rolled back
   */
  async processPayment(req, res, next) {
    try {
      const invoice = await PaymentService.processPayment(req.body, req.user);
      return created(res, invoice, 'Payment successful and enrollment created');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/payments:
   *   get:
   *     summary: Get all invoices (admin only)
   *     tags: [Payments]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: List of all invoices
   */
  async getAllInvoices(req, res, next) {
    try {
      const invoices = await PaymentService.getAllInvoices();
      return success(res, invoices, 'Invoices retrieved successfully');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PaymentController;
