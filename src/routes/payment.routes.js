'use strict';

const router     = require('express').Router();
const controller = require('../controllers/payment.controller');
const auth       = require('../middlewares/auth.middleware');

// Invoice preview — no auth required (public pricing preview)
router.get('/invoices/preview', controller.previewInvoice);

// Get user's invoices — authenticated
router.get('/payments/my-invoices', auth, controller.getUserInvoices);

// Get all invoices — authenticated admin only
router.get('/payments', auth, controller.getAllInvoices);

// Process payment — authenticated
router.post('/payments', auth, controller.processPayment);

module.exports = router;
