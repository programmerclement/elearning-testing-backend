'use strict';

const db = require('../config/db');

const SyllabusModel = {
  async create({ course_id, title, description }) {
    const [result] = await db.query(
      `INSERT INTO syllabuses (course_id, title, description) VALUES (?, ?, ?)`,
      [course_id, title, description || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT s.*, c.title AS course_title
       FROM syllabuses s
       INNER JOIN courses c ON c.id = s.course_id AND c.deleted_at IS NULL
       WHERE s.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByIdWithOutlines(id) {
    const [sylRows] = await db.query(
      `SELECT s.*, c.title AS course_title
       FROM syllabuses s
       INNER JOIN courses c ON c.id = s.course_id AND c.deleted_at IS NULL
       WHERE s.id = ?`,
      [id]
    );
    if (!sylRows.length) return null;

    const [outlines] = await db.query(
      `SELECT * FROM syllabus_outlines WHERE syllabus_id = ? ORDER BY order_index ASC`,
      [id]
    );
    return { ...sylRows[0], outlines };
  },

  async addOutline({ syllabus_id, title, description, image, order_index }) {
    if (order_index === undefined || order_index === null) {
      const [rows] = await db.query(
        `SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order
         FROM syllabus_outlines WHERE syllabus_id = ?`,
        [syllabus_id]
      );
      order_index = rows[0].next_order;
    }

    const [result] = await db.query(
      `INSERT INTO syllabus_outlines (syllabus_id, title, description, image, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      [syllabus_id, title, description || null, image || null, order_index]
    );
    return result.insertId;
  },
};

module.exports = SyllabusModel;
