'use strict';

const db = require('../config/db');

const ReviewModel = {
  async create({ user_id, course_id, rating, comment }) {
    const [result] = await db.query(
      `INSERT INTO reviews (user_id, course_id, rating, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rating = VALUES(rating),
         comment = VALUES(comment),
         updated_at = NOW()`,
      [user_id, course_id, rating, comment || null]
    );
    return result.insertId || result.affectedRows;
  },

  async findByCourseId(courseId) {
    const [rows] = await db.query(
      `SELECT r.*, u.name, u.email, u.avatar
       FROM reviews r
       INNER JOIN users u ON u.id = r.user_id
       WHERE r.course_id = ? AND r.id > 0
       ORDER BY r.created_at DESC`,
      [courseId]
    );
    return rows;
  },

  async findByUserAndCourse(userId, courseId) {
    const [rows] = await db.query(
      `SELECT * FROM reviews WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );
    return rows[0] || null;
  },

  async getAverageByCourse(courseId) {
    const [rows] = await db.query(
      `SELECT 
         AVG(rating) AS average_rating,
         COUNT(*) AS total_reviews,
         SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS count_5_star,
         SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS count_4_star,
         SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS count_3_star,
         SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS count_2_star,
         SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS count_1_star
       FROM reviews WHERE course_id = ?`,
      [courseId]
    );
    return rows[0];
  },

  async update({ review_id, rating, comment }) {
    const [result] = await db.query(
      `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW()
       WHERE id = ?`,
      [rating, comment || null, review_id]
    );
    return result.affectedRows;
  },

  async delete(reviewId) {
    const [result] = await db.query(
      `DELETE FROM reviews WHERE id = ?`,
      [reviewId]
    );
    return result.affectedRows;
  },
};

module.exports = ReviewModel;
