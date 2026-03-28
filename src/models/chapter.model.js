'use strict';

const db = require('../config/db');

const ChapterModel = {
  async create({ course_id, title, description, thumbnail, video_url, duration, order_index }) {
    // Auto-assign order_index if not provided
    if (order_index === undefined || order_index === null) {
      const [rows] = await db.query(
        `SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order
         FROM chapters WHERE course_id = ? AND deleted_at IS NULL`,
        [course_id]
      );
      order_index = rows[0].next_order;
    }

    const [result] = await db.query(
      `INSERT INTO chapters (course_id, title, description, thumbnail, video_url, duration, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course_id, title, description || null, thumbnail || null,
       video_url || null, duration || null, order_index]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT ch.*, c.title AS course_title
       FROM chapters ch
       INNER JOIN courses c ON c.id = ch.course_id AND c.deleted_at IS NULL
       WHERE ch.id = ? AND ch.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  async findByCourse(course_id) {
    const [rows] = await db.query(
      `SELECT * FROM chapters WHERE course_id = ? AND deleted_at IS NULL ORDER BY order_index ASC`,
      [course_id]
    );
    return rows;
  },

  async softDelete(id) {
    const [result] = await db.query(
      `UPDATE chapters SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result.affectedRows;
  },

  async update(id, { title, description, thumbnail, video_url, duration, order_index }) {
    const [result] = await db.query(
      `UPDATE chapters
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           thumbnail = COALESCE(?, thumbnail),
           video_url = COALESCE(?, video_url),
           duration  = COALESCE(?, duration),
           order_index = COALESCE(?, order_index)
       WHERE id = ? AND deleted_at IS NULL`,
      [title, description, thumbnail, video_url, duration, order_index, id]
    );
    return result.affectedRows;
  },
};

module.exports = ChapterModel;
