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

  async findByCourseId(courseId) {
    const [rows] = await db.query(
      `SELECT s.*, c.title AS course_title
       FROM syllabuses s
       INNER JOIN courses c ON c.id = s.course_id AND c.deleted_at IS NULL
       WHERE s.course_id = ?
       ORDER BY s.created_at DESC`,
      [courseId]
    );
    return rows;
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

  async update(id, { title, description }) {
    const updates = [];
    const params = [];
    
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    
    if (updates.length === 0) return 0;
    
    params.push(id);
    const query = `UPDATE syllabuses SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.query(query, params);
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.query(
      `DELETE FROM syllabuses WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  },

  async findOutlineById(outlineId) {
    const [rows] = await db.query(
      `SELECT * FROM syllabus_outlines WHERE id = ?`,
      [outlineId]
    );
    return rows[0] || null;
  },

  async updateOutline(outlineId, { title, description, order_index }) {
    const updates = [];
    const params = [];
    
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (order_index !== undefined) { updates.push('order_index = ?'); params.push(order_index); }
    
    if (updates.length === 0) return 0;
    
    params.push(outlineId);
    const query = `UPDATE syllabus_outlines SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await db.query(query, params);
    return result.affectedRows;
  },

  async deleteOutline(outlineId) {
    const [result] = await db.query(
      `DELETE FROM syllabus_outlines WHERE id = ?`,
      [outlineId]
    );
    return result.affectedRows;
  },
};

module.exports = SyllabusModel;
