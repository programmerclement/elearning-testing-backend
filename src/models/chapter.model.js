'use strict';

const db = require('../config/db');

const ChapterModel = {
  async create({
    course_id, title, subtitle, description, intro_message,
    thumbnail, video_url, duration, order_index, week_number, attachments
  }) {
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
      `INSERT INTO chapters (
        course_id, title, subtitle, description, intro_message,
        thumbnail, video_url, duration, order_index, week_number, attachments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        title,
        subtitle || null,
        description || null,
        intro_message || null,
        thumbnail || null,
        video_url || null,
        duration || null,
        order_index,
        week_number || null,
        attachments ? JSON.stringify(attachments) : null
      ]
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

  async update(id, {
    title, subtitle, description, intro_message, 
    thumbnail, video_url, duration, order_index, week_number, attachments
  }) {
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (subtitle !== undefined) { updates.push('subtitle = ?'); params.push(subtitle); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (intro_message !== undefined) { updates.push('intro_message = ?'); params.push(intro_message); }
    if (thumbnail !== undefined) { updates.push('thumbnail = ?'); params.push(thumbnail); }
    if (video_url !== undefined) { updates.push('video_url = ?'); params.push(video_url); }
    if (duration !== undefined) { updates.push('duration = ?'); params.push(duration); }
    if (order_index !== undefined) { updates.push('order_index = ?'); params.push(order_index); }
    if (week_number !== undefined) { updates.push('week_number = ?'); params.push(week_number); }
    if (attachments !== undefined) { updates.push('attachments = ?'); params.push(attachments ? JSON.stringify(attachments) : null); }

    if (updates.length === 0) return 0;

    params.push(id);
    const query = `UPDATE chapters SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
    const [result] = await db.query(query, params);
    return result.affectedRows;
  },
};

module.exports = ChapterModel;
