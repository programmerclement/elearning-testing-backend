'use strict';

const router = require('express').Router();
const controller = require('../controllers/coupon.controller');
const auth = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/auth.middleware');

// Public verification endpoint (must come BEFORE /:id to match correctly)
router.get('/verify/:code',   controller.verifyCoupon);

// Admin-only routes
router.post('/',              auth, allowRoles('admin'), controller.createCoupon);
router.get('/',               auth, allowRoles('admin'), controller.listCoupons);
router.get('/:id',            auth, allowRoles('admin'), controller.getCoupon);
router.put('/:id',            auth, allowRoles('admin'), controller.updateCoupon);
router.delete('/:id',         auth, allowRoles('admin'), controller.deleteCoupon);

// Apply coupon route (authenticated users)
router.post('/:id/apply',     auth, controller.applyCoupon);

module.exports = router;
