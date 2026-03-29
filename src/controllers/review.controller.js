'use strict';

const ReviewModel = require('../models/review.model');
const { success, created, badRequest, notFound } = require('../utils/response');

const ReviewController = {
  /**
   * @swagger
   * /api/reviews:
   *   post:
   *     summary: Create or update a course review
   *     tags: [Reviews]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [course_id, rating]
   *             properties:
   *               course_id: { type: integer }
   *               rating: { type: integer, minimum: 1, maximum: 5 }
   *               comment: { type: string }
   */
  async createReview(req, res, next) {
    try {
      const { course_id, rating, comment } = req.body;

      if (!course_id || !rating) {
        return badRequest(res, 'Course ID and rating are required');
      }

      if (rating < 1 || rating > 5) {
        return badRequest(res, 'Rating must be between 1 and 5');
      }

      await ReviewModel.create({
        user_id: req.user.id,
        course_id,
        rating,
        comment,
      });

      return created(res, { success: true }, 'Review created successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/courses/{courseId}/reviews:
   *   get:
   *     summary: Get all reviews for a course
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: integer }
   */
  async getCourseReviews(req, res, next) {
    try {
      const reviews = await ReviewModel.findByCourseId(req.params.courseId);
      const stats = await ReviewModel.getAverageByCourse(req.params.courseId);
      return success(res, { reviews, stats });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/reviews/{reviewId}:
   *   put:
   *     summary: Update a review
   *     tags: [Reviews]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rating: { type: integer, minimum: 1, maximum: 5 }
   *               comment: { type: string }
   */
  async updateReview(req, res, next) {
    try {
      const { rating, comment } = req.body;

      if (rating && (rating < 1 || rating > 5)) {
        return badRequest(res, 'Rating must be between 1 and 5');
      }

      const rowsAffected = await ReviewModel.update({
        review_id: req.params.reviewId,
        rating,
        comment,
      });

      if (!rowsAffected) {
        return notFound(res, 'Review not found');
      }

      return success(res, { success: true }, 'Review updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/reviews/{reviewId}:
   *   delete:
   *     summary: Delete a review
   *     tags: [Reviews]
   *     security:
   *       - BearerAuth: []
   */
  async deleteReview(req, res, next) {
    try {
      const rowsAffected = await ReviewModel.delete(req.params.reviewId);

      if (!rowsAffected) {
        return notFound(res, 'Review not found');
      }

      return success(res, { success: true }, 'Review deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get user's review for a course (if exists)
   */
  async getUserCourseReview(req, res, next) {
    try {
      const review = await ReviewModel.findByUserAndCourse(
        req.user.id,
        req.params.courseId
      );
      return success(res, { review: review || null });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ReviewController;
