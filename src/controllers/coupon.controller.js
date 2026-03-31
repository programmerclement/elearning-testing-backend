'use strict';

const db = require('../config/db');
const CouponModel = require('../models/coupon.model');
const { success, created, badRequest, notFound } = require('../utils/response');

const CouponController = {
  /**
   * @swagger
   * /api/coupons:
   *   post:
   *     summary: Create a new coupon (admin only)
   *     tags: [Coupons]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [code, discount_type, discount_value]
   *             properties:
   *               code:                  { type: string, example: "SAVE20" }
   *               discount_type:         { type: string, enum: ["percentage", "fixed"], example: "percentage" }
   *               discount_value:        { type: number, example: 20 }
   *               max_uses:              { type: integer, nullable: true }
   *               max_uses_per_user:     { type: integer, default: 1 }
   *               expiry_date:           { type: string, format: date-time, nullable: true }
   *               description:           { type: string, nullable: true }
   *     responses:
   *       201:
   *         description: Coupon created
   *       400:
   *         description: Validation error
   */
  async createCoupon(req, res, next) {
    try {
      const { code, discount_percentage, expires_at, is_active = 1 } = req.body;

      if (!code) throw badRequest('Coupon code is required');
      if (discount_percentage === undefined || discount_percentage < 0) {
        throw badRequest('Discount percentage is required and must be non-negative');
      }

      // Check if code already exists
      const existing = await CouponModel.findByCode(code);
      if (existing) throw badRequest('Coupon code already exists');

      const id = await CouponModel.create({
        code,
        discount_percentage,
        expires_at: expires_at || null,
        is_active
      });

      const coupon = await CouponModel.findById(id);
      return created(res, coupon, 'Coupon created successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/coupons:
   *   get:
   *     summary: List all coupons with pagination (admin only)
   *     tags: [Coupons]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *     responses:
   *       200:
   *         description: Paginated list of coupons
   */
  async listCoupons(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
      const offset = (page - 1) * limit;

      const [coupons, total] = await Promise.all([
        CouponModel.list({ limit, offset }),
        CouponModel.count()
      ]);

      return res.status(200).json({
        success: true,
        data: coupons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/coupons/{id}:
   *   get:
   *     summary: Get a specific coupon (admin only)
   *     tags: [Coupons]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Coupon details
   *       404:
   *         description: Coupon not found
   */
  async getCoupon(req, res, next) {
    try {
      const coupon = await CouponModel.findById(req.params.id);
      if (!coupon) throw notFound('Coupon not found');
      return success(res, coupon);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/coupons/{id}:
   *   put:
   *     summary: Update a coupon (admin only)
   *     tags: [Coupons]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               code:                  { type: string }
   *               discount_type:         { type: string, enum: ["percentage", "fixed"] }
   *               discount_value:        { type: number }
   *               max_uses:              { type: integer, nullable: true }
   *               max_uses_per_user:     { type: integer }
   *               expiry_date:           { type: string, format: date-time, nullable: true }
   *               description:           { type: string }
   *     responses:
   *       200:
   *         description: Coupon updated
   *       404:
   *         description: Coupon not found
   */
  async updateCoupon(req, res, next) {
    try {
      const coupon = await CouponModel.findById(req.params.id);
      if (!coupon) throw notFound('Coupon not found');

      const { discount_percentage } = req.body;
      
      if (discount_percentage !== undefined && discount_percentage < 0) {
        throw badRequest('Discount percentage must be non-negative');
      }

      await CouponModel.update(req.params.id, req.body);
      const updated = await CouponModel.findById(req.params.id);
      return success(res, updated, 'Coupon updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/coupons/{id}:
   *   delete:
   *     summary: Delete a coupon (admin only)
   *     tags: [Coupons]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Coupon deleted
   *       404:
   *         description: Coupon not found
   */
  async deleteCoupon(req, res, next) {
    try {
      const coupon = await CouponModel.findById(req.params.id);
      if (!coupon) throw notFound('Coupon not found');

      await CouponModel.delete(req.params.id);
      return success(res, { message: 'Coupon deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/coupons/verify/{code}:
   *   get:
   *     summary: Verify a coupon code (public)
   *     tags: [Coupons]
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Coupon details if valid
   *       404:
   *         description: Coupon not found or inactive
   */
  async verifyCoupon(req, res, next) {
    try {
      const code = (req.params.code || '').toUpperCase().trim();
      
      if (!code) throw badRequest('Coupon code is required');
      
      const coupon = await CouponModel.findByCode(code);
      
      if (!coupon) {
        // Check if coupon exists but is inactive or expired
        const inactiveQuery = 'SELECT id, is_active, expires_at FROM coupons WHERE code = ? LIMIT 1';
        const [inactiveRows] = await db.query(inactiveQuery, [code]);
        
        if (inactiveRows && inactiveRows.length > 0) {
          const inactive = inactiveRows[0];
          if (!inactive.is_active) {
            throw notFound('Coupon is no longer active');
          }
          if (inactive.expires_at && new Date(inactive.expires_at) <= new Date()) {
            throw notFound('Coupon has expired');
          }
        }
        
        throw notFound('Invalid coupon code');
      }
      
      // Get usage information
      const totalUsage = await CouponModel.getCouponTotalUsage(coupon.id);
      
      const response = {
        id: coupon.id,
        code: coupon.code,
        discount_percentage: coupon.discount_percentage,
        is_active: coupon.is_active,
        expires_at: coupon.expires_at,
        max_uses: coupon.max_uses,
        created_at: coupon.created_at,
        updated_at: coupon.updated_at,
        usage_count: totalUsage,
        remaining_uses: coupon.max_uses ? coupon.max_uses - totalUsage : null
      };
      
      return success(res, response, 'Coupon is valid');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/coupons/{id}/apply:
   *   post:
   *     summary: Apply coupon to an order (user)
   *     tags: [Coupons]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               order_id:    { type: integer }
   *               user_id:     { type: integer }
   *     responses:
   *       200:
   *         description: Coupon applied
   */
  async applyCoupon(req, res, next) {
    try {
      const coupon = await CouponModel.findById(req.params.id);
      if (!coupon) throw notFound('Coupon not found');

      const { order_id, user_id } = req.body;
      if (!order_id || !user_id) throw badRequest('Order ID and User ID are required');

      // Check max_uses
      if (coupon.max_uses) {
        const totalUsage = await CouponModel.getCouponTotalUsage(coupon.id);
        if (totalUsage >= coupon.max_uses) {
          throw badRequest('Coupon usage limit has been reached');
        }
      }

      // Check max_uses_per_user
      const userUsage = await CouponModel.getUserCouponUsageCount(coupon.id, user_id);
      if (userUsage >= coupon.max_uses_per_user) {
        throw badRequest('You have reached the usage limit for this coupon');
      }

      // Record usage
      const usageId = await CouponModel.recordUsage(coupon.id, user_id, order_id);

      return success(res, {
        usage_id: usageId,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      }, 'Coupon applied successfully');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = CouponController;
