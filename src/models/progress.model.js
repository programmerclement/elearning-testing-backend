'use strict';

const db = require('../config/db');

const ProgressModel = {
  /**
   * Mark a chapter as completed for a user.
   * Uses INSERT ... ON DUPLICATE KEY UPDATE for idempotency.
   */
  async markComplete({ user_id, chapter_id, course_id }) {
    const [result] = await db.query(
      `INSERT INTO user_progress (user_id, chapter_id, course_id, completed, completed_at)
       VALUES (?, ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE
         completed    = 1,
         completed_at = IF(completed = 0, NOW(), completed_at)`,
      [user_id, chapter_id, course_id]
    );
    return result;
  },

  async getByUserAndCourse(user_id, course_id) {
    const [rows] = await db.query(
      `SELECT up.*, ch.title AS chapter_title
       FROM user_progress up
       INNER JOIN chapters ch ON ch.id = up.chapter_id
       WHERE up.user_id = ? AND up.course_id = ?
       ORDER BY ch.order_index ASC`,
      [user_id, course_id]
    );
    return rows;
  },

  /**
   * Check if all chapters in a course are completed by the user.
   * If so, mark enrollment as completed.
   */
  async checkAndFinalizeEnrollment(user_id, course_id) {
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total FROM chapters WHERE course_id = ? AND deleted_at IS NULL`,
      [course_id]
    );
    const [doneRows] = await db.query(
      `SELECT COUNT(*) AS done FROM user_progress
       WHERE user_id = ? AND course_id = ? AND completed = 1`,
      [user_id, course_id]
    );

    if (totalRows[0].total > 0 && totalRows[0].total === doneRows[0].done) {
      await db.query(
        `UPDATE enrollments SET completed_at = NOW()
         WHERE user_id = ? AND course_id = ? AND completed_at IS NULL`,
        [user_id, course_id]
      );
      return true;
    }
    return false;
  },

  /**
   * Get overall progress percentage for a course
   */
  async getCourseProgress(user_id, course_id) {
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total FROM chapters WHERE course_id = ? AND deleted_at IS NULL`,
      [course_id]
    );
    const [doneRows] = await db.query(
      `SELECT COUNT(*) AS completed FROM user_progress
       WHERE user_id = ? AND course_id = ? AND completed = 1`,
      [user_id, course_id]
    );

    if (!totalRows[0].total) return 0;
    return Math.round((doneRows[0].completed / totalRows[0].total) * 100);
  },

  /**
   * Get all courses progress for a user
   */
  async getUserAllCoursesProgress(user_id) {
    const [rows] = await db.query(
      `SELECT 
         co.id,
         co.title,
         co.thumbnail,
         COUNT(DISTINCT c.id) AS total_chapters,
         COUNT(DISTINCT up.id) AS completed_chapters,
         ROUND(COUNT(DISTINCT up.id) / COUNT(DISTINCT c.id) * 100) AS progress_percentage
       FROM enrollments e
       INNER JOIN courses co ON co.id = e.course_id
       LEFT JOIN chapters c ON c.course_id = co.id AND c.deleted_at IS NULL
       LEFT JOIN user_progress up ON up.user_id = ? AND up.chapter_id = c.id AND up.completed = 1
       WHERE e.user_id = ?
       GROUP BY co.id
       ORDER BY e.enrolled_at DESC`,
      [user_id, user_id]
    );
    return rows;
  },

  /**
   * Get completion status for specific chapter
   */
  async isChapterCompleted(user_id, chapter_id) {
    const [rows] = await db.query(
      `SELECT * FROM user_progress WHERE user_id = ? AND chapter_id = ? AND completed = 1`,
      [user_id, chapter_id]
    );
    return !!rows[0];
  },
};

module.exports = ProgressModel;
