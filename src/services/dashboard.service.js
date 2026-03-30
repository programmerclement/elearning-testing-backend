'use strict';

const db = require('../config/db');
const { paginate } = require('../utils/helpers');

const DashboardService = {
  /**
   * Get comprehensive dashboard metrics
   */
  async getMetrics() {
    try {
      // Total courses
      const [totalCoursesRows] = await db.query(
        `SELECT COUNT(*) AS total FROM courses WHERE deleted_at IS NULL`
      );
      const total_courses = totalCoursesRows[0].total;

      // Published courses
      const [publishedRows] = await db.query(
        `SELECT COUNT(*) AS total FROM courses WHERE deleted_at IS NULL AND status = 'published'`
      );
      const published_courses = publishedRows[0].total;

      // Growth percentage (courses created this month vs last month)
      const [growthRows] = await db.query(
        `SELECT
          (SELECT COUNT(*) FROM courses 
           WHERE deleted_at IS NULL AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')) AS this_month,
          (SELECT COUNT(*) FROM courses 
           WHERE deleted_at IS NULL AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m')) AS last_month
        `
      );
      let growth_percentage = 0;
      if (growthRows[0].last_month > 0) {
        growth_percentage = ((growthRows[0].this_month - growthRows[0].last_month) / growthRows[0].last_month * 100).toFixed(2);
      }

      // Total students (unique enrolled users)
      const [studentRows] = await db.query(
        `SELECT COUNT(DISTINCT user_id) AS total FROM enrollments`
      );
      const total_students = studentRows[0].total;

      // Average course rating
      const [avgRatingRows] = await db.query(
        `SELECT ROUND(AVG(rating), 2) AS avg_rating FROM reviews`
      );
      const average_rating = avgRatingRows[0].avg_rating || 0;

      // Attendance percentage (completed chapters / total chapter enrollments)
      const [attendanceRows] = await db.query(
        `SELECT
          COUNT(DISTINCT CASE WHEN completed = 1 THEN 1 END) AS completed,
          COUNT(*) AS total
         FROM user_progress`
      );
      const attendance_percentage = attendanceRows[0].total > 0
        ? ((attendanceRows[0].completed / attendanceRows[0].total) * 100).toFixed(2)
        : 0;

      // Total revenue
      const [revenueRows] = await db.query(
        `SELECT ROUND(SUM(total), 2) AS total_revenue FROM invoices WHERE status = 'paid'`
      );
      const total_revenue = revenueRows[0].total_revenue || 0;

      // Events/transactions this month
      const [eventsRows] = await db.query(
        `SELECT COUNT(*) AS total FROM invoices
         WHERE status = 'paid'
         AND DATE_FORMAT(paid_at, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')`
      );
      const events_this_month = eventsRows[0].total;

      return {
        total_courses,
        published_courses,
        growth_percentage: parseFloat(growth_percentage),
        total_students,
        average_rating: parseFloat(average_rating),
        attendance_percentage: parseFloat(attendance_percentage),
        total_revenue: parseFloat(total_revenue),
        events_this_month
      };
    } catch (err) {
      throw new Error(`Dashboard metrics error: ${err.message}`);
    }
  },

  /**
   * Get lessons/courses history with pagination and filtering
   */
  async getLessonsHistory(query) {
    try {
      const { page, limit, offset } = paginate(query, 10);
      const { search, status } = query;

      let where = 'WHERE c.deleted_at IS NULL';
      const params = [];

      // Search filter
      if (search) {
        where += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Status filter
      if (status) {
        where += ` AND c.status = ?`;
        params.push(status);
      }

      // Get total count
      let countQuery = `SELECT COUNT(*) AS total FROM courses c ${where}`;
      const [countRows] = await db.query(countQuery, params);
      const total = countRows[0].total;

      // Get paginated results with metrics
      const queryParams = [...params, limit, offset];
      const [rows] = await db.query(
        `SELECT
          ROW_NUMBER() OVER (ORDER BY c.created_at DESC) AS rank,
          c.id,
          c.title,
          'course' AS assignment_type,
          COUNT(DISTINCT en.user_id) AS total_students,
          ROUND(AVG(r.rating), 2) AS average_score,
          COUNT(DISTINCT r.id) AS rating_count,
          ROUND(SUM(CASE WHEN inv.status = 'paid' THEN inv.total ELSE 0 END), 2) AS profit,
          c.status,
          c.created_at
         FROM courses c
         LEFT JOIN enrollments en ON en.course_id = c.id
         LEFT JOIN reviews r ON r.course_id = c.id
         LEFT JOIN invoices inv ON inv.course_id = c.id
         ${where}
         GROUP BY c.id
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        queryParams
      );

      return {
        data: rows || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (err) {
      throw new Error(`Lessons history error: ${err.message}`);
    }
  },

  /**
   * Get student dashboard (legacy support)
   */
  async getStudentMetrics(user_id) {
    const [enrollments] = await db.query(
      `SELECT COUNT(*) AS total FROM enrollments WHERE user_id = ?`,
      [user_id]
    );
    const [completedCourses] = await db.query(
      `SELECT COUNT(*) AS total FROM enrollments WHERE user_id = ? AND completed_at IS NOT NULL`,
      [user_id]
    );
    const [averageScore] = await db.query(
      `SELECT ROUND(AVG(rating), 2) AS avg FROM reviews WHERE user_id = ?`,
      [user_id]
    );

    return {
      enrolled_courses: enrollments[0].total,
      completed_courses: completedCourses[0].total,
      average_rating: averageScore[0].avg || 0,
    };
  },

  /**
   * Get instructor dashboard (legacy support)
   */
  async getInstructorMetrics(instructor_id) {
    const [courses] = await db.query(
      `SELECT COUNT(*) AS total FROM courses WHERE instructor_id = ? AND deleted_at IS NULL`,
      [instructor_id]
    );
    const [students] = await db.query(
      `SELECT COUNT(DISTINCT en.user_id) AS total
       FROM enrollments en
       INNER JOIN courses c ON c.id = en.course_id
       WHERE c.instructor_id = ?`,
      [instructor_id]
    );
    const [revenue] = await db.query(
      `SELECT ROUND(SUM(inv.total), 2) AS total
       FROM invoices inv
       INNER JOIN courses c ON c.id = inv.course_id
       WHERE c.instructor_id = ? AND inv.status = 'paid'`,
      [instructor_id]
    );

    return {
      total_courses: courses[0].total,
      total_students: students[0].total,
      total_revenue: revenue[0].total || 0,
    };
  },

  /**
   * Get admin dashboard (legacy support)
   */
  async getAdminMetrics() {
    const [users] = await db.query(`SELECT COUNT(*) AS total FROM users`);
    const [courses] = await db.query(`SELECT COUNT(*) AS total FROM courses WHERE deleted_at IS NULL`);
    const [revenue] = await db.query(`SELECT ROUND(SUM(total), 2) AS total FROM invoices WHERE status = 'paid'`);
    const [transactions] = await db.query(`SELECT COUNT(*) AS total FROM invoices WHERE status = 'paid'`);

    return {
      total_users: users[0].total,
      total_courses: courses[0].total,
      total_revenue: revenue[0].total || 0,
      total_transactions: transactions[0].total,
    };
  },
};

module.exports = DashboardService;
