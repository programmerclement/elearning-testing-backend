'use strict';

const PaymentModel = require('../models/payment.model');
const { notFound, badRequest } = require('../utils/response');

const PaymentService = {
  /**
   * Preview invoice — calculate fees without persisting anything.
   */
  async previewInvoice(query) {
    const { course_id } = query;
    if (!course_id) throw badRequest('course_id query parameter is required');

    const coursePrice = await PaymentModel.getCoursePrice(course_id);
    if (coursePrice === null) throw notFound('Course not found or not published');

    return PaymentModel.calculateFees(coursePrice);
  },

  /**
   * Process payment — atomic SQL transaction: invoice + enrollment.
   */
  async processPayment(body, user) {
    const { course_id, payment_method } = body;
    if (!course_id) throw badRequest('course_id is required');

    // Check course exists and is published
    const coursePrice = await PaymentModel.getCoursePrice(course_id);
    if (coursePrice === null) throw notFound('Course not found or not available for purchase');

    // Prevent double enrollment
    const alreadyEnrolled = await PaymentModel.isEnrolled(user.id, course_id);
    if (alreadyEnrolled) throw badRequest('You are already enrolled in this course');

    const fees = PaymentModel.calculateFees(coursePrice);

    const result = await PaymentModel.processPayment({
      user_id:        user.id,
      course_id,
      ...fees,
      payment_method: payment_method || 'online',
    });

    const invoice = await PaymentModel.findInvoiceById(result.invoice_id);
    return invoice;
  },
};

module.exports = PaymentService;
