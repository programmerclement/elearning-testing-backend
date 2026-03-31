'use strict';

const DashboardService = require('../services/dashboard.service');
const { success, paginated, successResponse, errorResponse } = require('../utils/response');
const pool = require('../config/db');

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

  /**
   * GET /api/dashboard/student
   * Get student dashboard with enrolled courses, progress, and exam results
   */
  async getStudentDashboard(req, res) {
    try {
      const userId = req.user.id;

      // Enrolled courses
      const [enrollments] = await pool.query(
        `SELECT c.id, c.title, c.description, c.thumbnail, c.price, c.level,
                (SELECT COUNT(*) FROM chapters WHERE course_id = c.id) as total_chapters,
                (SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND course_id = c.id AND completed = 1) as completed_chapters
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.user_id = ? AND c.deleted_at IS NULL
         ORDER BY e.enrolled_at DESC`,
        [userId, userId]
      );

      // Progress statistics
      const [progressStats] = await pool.query(
        `SELECT 
           COUNT(*) as total_progress,
           SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_progress
         FROM user_progress
         WHERE user_id = ?`,
        [userId]
      );

      // Exam results and average score
      const [examResults] = await pool.query(
        `SELECT ea.exercise_id, ea.score, ea.is_correct, ea.attempted_at,
                e.chapter_id, c.course_id, c.title as chapter_title
         FROM exercise_attempts ea
         JOIN exercises e ON ea.exercise_id = e.id
         JOIN chapters c ON e.chapter_id = c.id
         WHERE ea.user_id = ?
         ORDER BY ea.attempted_at DESC
         LIMIT 10`,
        [userId]
      );

      const avgScore = examResults.length > 0
        ? (examResults.reduce((sum, r) => sum + (r.score || 0), 0) / examResults.length).toFixed(2)
        : 0;

      return successResponse(res, {
        message: 'Student dashboard data',
        data: {
          enrolledCourses: enrollments,
          progressStats: {
            totalChapters: progressStats[0]?.total_progress || 0,
            completedChapters: progressStats[0]?.completed_progress || 0,
            progressPercentage: progressStats[0]?.total_progress > 0
              ? ((progressStats[0]?.completed_progress / progressStats[0]?.total_progress) * 100).toFixed(2)
              : 0,
          },
          examResults: examResults,
          averageScore: parseFloat(avgScore),
        },
      });
    } catch (error) {
      console.error('Get student dashboard error:', error);
      return errorResponse(res, error.message, 500);
    }
  },

  /**
   * GET /api/dashboard/instructor
   * Get instructor dashboard with courses, students, and earnings
   */
  async getInstructorDashboard(req, res) {
    try {
      const userId = req.user.id;

      // Total courses created
      const [courses] = await pool.query(
        `SELECT id, title, description, thumbnail, status, price, created_at FROM courses
         WHERE instructor_id = ? AND deleted_at IS NULL
         ORDER BY created_at DESC`,
        [userId]
      );

      // Total students enrolled in all courses
      const [enrollmentStats] = await pool.query(
        `SELECT COUNT(DISTINCT e.user_id) as total_students,
                COUNT(e.id) as total_enrollments,
                COALESCE(SUM(c.price), 0) as total_revenue
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE c.instructor_id = ? AND c.deleted_at IS NULL
         AND e.user_id IN (
           SELECT DISTINCT user_id FROM enrollments WHERE course_id IN (
             SELECT id FROM courses WHERE instructor_id = ?
           )
         )`,
        [userId, userId]
      );

      // Average course rating
      const [ratingStats] = await pool.query(
        `SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_reviews
         FROM reviews
         WHERE course_id IN (SELECT id FROM courses WHERE instructor_id = ? AND deleted_at IS NULL)`,
        [userId]
      );

      // Course earnings breakdown
      const [earnings] = await pool.query(
        `SELECT c.id, c.title, COUNT(e.id) as students, COALESCE(SUM(c.price), 0) as course_revenue
         FROM courses c
         LEFT JOIN enrollments e ON c.id = e.course_id
         WHERE c.instructor_id = ? AND c.deleted_at IS NULL AND c.status = 'published'
         GROUP BY c.id
         ORDER BY course_revenue DESC`,
        [userId]
      );

      return successResponse(res, {
        message: 'Instructor dashboard data',
        data: {
          totalCourses: courses.length,
          totalStudents: enrollmentStats[0]?.total_students || 0,
          totalEnrollments: enrollmentStats[0]?.total_enrollments || 0,
          totalRevenue: parseFloat(enrollmentStats[0]?.total_revenue || 0),
          averageRating: parseFloat(ratingStats[0]?.average_rating || 0).toFixed(2),
          totalReviews: ratingStats[0]?.total_reviews || 0,
          courses: courses,
          courseEarnings: earnings,
        },
      });
    } catch (error) {
      console.error('Get instructor dashboard error:', error);
      return errorResponse(res, error.message, 500);
    }
  },

  /**
   * GET /api/dashboard/admin
   * Get admin dashboard with system statistics
   */
  async getAdminDashboard(req, res) {
    try {
      // Total users by role
      const [userStats] = await pool.query(
        `SELECT role, COUNT(*) as count FROM users GROUP BY role`
      );

      // Total courses
      const [courseStats] = await pool.query(
        `SELECT 
           COUNT(*) as total,
           SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
           SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
         FROM courses WHERE deleted_at IS NULL`
      );

      // Total revenue
      const [revenueStats] = await pool.query(
        `SELECT 
           COUNT(*) as total_transactions,
           COALESCE(SUM(total), 0) as total_revenue,
           COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
         FROM invoices WHERE status = 'paid'`
      );

      // Total chapters
      const [chapterStats] = await pool.query(
        `SELECT COUNT(*) as total FROM chapters WHERE deleted_at IS NULL`
      );

      // Total enrollments
      const [enrollmentStats] = await pool.query(
        `SELECT COUNT(*) as total FROM enrollments`
      );

      // Total reviews
      const [reviewStats] = await pool.query(
        `SELECT COUNT(*) as total FROM reviews`
      );

      // Total exercises
      const [exerciseStats] = await pool.query(
        `SELECT COUNT(*) as total FROM exercises`
      );

      // Total invoices
      const [invoiceStats] = await pool.query(
        `SELECT COUNT(*) as total FROM invoices`
      );

      // Recent users
      const [recentUsers] = await pool.query(
        `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5`
      );

      // Recent transactions
      const [recentTransactions] = await pool.query(
        `SELECT i.id, i.total, i.status, i.created_at, u.name, c.title
         FROM invoices i
         JOIN users u ON i.user_id = u.id
         JOIN courses c ON i.course_id = c.id
         ORDER BY i.created_at DESC
         LIMIT 5`
      );

      const usersByRole = {};
      userStats.forEach(stat => {
        usersByRole[stat.role] = stat.count;
      });

      return successResponse(res, {
        message: 'Admin dashboard data',
        data: {
          users: {
            total: Object.values(usersByRole).reduce((a, b) => a + b, 0),
            byRole: usersByRole,
          },
          courses: courseStats[0],
          revenue: revenueStats[0],
          totalChapters: chapterStats[0]?.total || 0,
          enrollments: enrollmentStats[0],
          reviews: reviewStats[0],
          exercises: exerciseStats[0],
          invoices: invoiceStats[0],
          recentUsers: recentUsers,
          recentTransactions: recentTransactions,
        },
      });
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      return errorResponse(res, error.message, 500);
    }
  },

  /**
   * GET /api/dashboard/instructor/students
   * Get all students enrolled in instructor's courses
   */
  async getInstructorStudents(req, res) {
    try {
      const instructorId = req.user.id;
      
      const DashboardModel = require('../models/dashboard.model');
      const students = await DashboardModel.getInstructorStudents(instructorId);

      return successResponse(res, {
        message: 'Instructor students data',
        data: students,
      });
    } catch (error) {
      console.error('Get instructor students error:', error);
      return errorResponse(res, error.message, 500);
    }
  },
};

module.exports = DashboardController;
