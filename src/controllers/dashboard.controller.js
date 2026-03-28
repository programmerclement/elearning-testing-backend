'use strict';

const DashboardService = require('../services/dashboard.service');
const { success, paginated } = require('../utils/response');

const DashboardController = {
  /**
   * @swagger
   * /api/dashboard/metrics:
   *   get:
   *     summary: Get platform metrics
   *     tags: [Dashboard]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Dashboard metrics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean }
   *                 data:
   *                   type: object
   *                   properties:
   *                     total_students:     { type: integer, example: 42 }
   *                     average_score:      { type: number,  example: 78.5 }
   *                     total_certificates: { type: integer, example: 10 }
   *                     total_assignments:  { type: integer, example: 30 }
   */
  async getMetrics(req, res, next) {
    try {
      const data = await DashboardService.getMetrics();
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/dashboard/lessons-history:
   *   get:
   *     summary: Get paginated top courses by enrollments and reviews
   *     tags: [Dashboard]
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
   *         description: Paginated lessons history
   */
  async getLessonsHistory(req, res, next) {
    try {
      const result = await DashboardService.getLessonsHistory(req.query);
      return paginated(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = DashboardController;
