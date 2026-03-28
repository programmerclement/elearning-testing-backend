'use strict';

const db = require('../config/db');

const DashboardModel = {
  /**
   * Total number of active students enrolled in any course.
   */
  async getTotalStudents() {
    const [rows] = await db.query(
      `SELECT COUNT(DISTINCT user_id) AS total
       FROM enrollments`
    );
    return rows[0].total;
  },

  /**
   * Average score from exercise attempts.
   */
  async getAverageScore() {
    const [rows] = await db.query(
      `SELECT ROUND(AVG(score), 2) AS avg_score
       FROM exercise_attempts`
    );
    return rows[0].avg_score || 0;
  },

  /**
   * Total assignments (exercises) across all published courses.
   */
  async getTotalAssignments() {
    const [rows] = await db.query(
      `SELECT COUNT(e.id) AS total
       FROM exercises e
       INNER JOIN chapters   ch ON ch.id = e.chapter_id  AND ch.deleted_at IS NULL
       INNER JOIN courses    c  ON c.id  = ch.course_id  AND c.deleted_at IS NULL AND c.status = 'published'`
    );
    return rows[0].total;
  },

  /**
   * Total students who completed every chapter of a course (mock certificate).
   * This counts completed enrollments as certificates issued.
   */
  async getTotalCertificates() {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM enrollments
       WHERE completed_at IS NOT NULL`
    );
    return rows[0].total;
  },

  /**
   * Paginated top courses ordered by enrollment count then avg review rating.
   */
  async getLessonsHistory({ limit, offset }) {
    const [rows] = await db.query(
      `SELECT
         c.id,
         c.title,
         c.thumbnail,
         c.status,
         c.price,
         c.category,
         c.level,
         u.name        AS instructor_name,
         COUNT(DISTINCT en.id)   AS enrollment_count,
         COUNT(DISTINCT r.id)    AS review_count,
         ROUND(AVG(r.rating), 1) AS avg_rating
       FROM courses c
       LEFT JOIN users       u  ON u.id  = c.instructor_id
       LEFT JOIN enrollments en ON en.course_id = c.id
       LEFT JOIN reviews     r  ON r.course_id  = c.id
       WHERE c.deleted_at IS NULL AND c.status = 'published'
       GROUP BY c.id, c.title, c.thumbnail, c.status, c.price, c.category, c.level, u.name
       ORDER BY enrollment_count DESC, avg_rating DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  async countPublishedCourses() {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM courses WHERE deleted_at IS NULL AND status = 'published'`
    );
    return rows[0].total;
  },
};

module.exports = DashboardModel;
