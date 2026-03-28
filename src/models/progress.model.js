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
};

module.exports = ProgressModel;
