'use strict';

const db = require('../config/db');

const SyllabusModel = {
  async create({
    title, description, category, subscription_price,
    education_level, target_audience, objectives, status
  }) {
    const [result] = await db.query(
      `INSERT INTO syllabuses (
        title, description, category, subscription_price,
        education_level, target_audience, objectives, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        category || null,
        subscription_price || 0,
        education_level || null,
        target_audience || null,
        objectives || null,
        status || 'draft'
      ]
    );
    return result.insertId;
  },

  async findAll({ limit, offset, status }) {
    const params = [];
    let where = '';
    if (status) { where = 'WHERE status = ?'; params.push(status); }
    params.push(limit || 10, offset || 0);

    const [rows] = await db.query(
      `SELECT * FROM syllabuses ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  },

  async count(status) {
    const [rows] = await db.query(
      status 
        ? `SELECT COUNT(*) AS total FROM syllabuses WHERE status = ?`
        : `SELECT COUNT(*) AS total FROM syllabuses`,
      status ? [status] : []
    );
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM syllabuses WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByIdWithOutlines(id) {
    const [sylRows] = await db.query(
      `SELECT * FROM syllabuses WHERE id = ?`,
      [id]
    );
    if (!sylRows.length) return null;

    const [outlines] = await db.query(
      `SELECT * FROM syllabus_outlines WHERE syllabus_id = ? ORDER BY order_index ASC`,
      [id]
    );
    return { ...sylRows[0], outlines };
  },

  async addOutline({
    syllabus_id, title, description, abstract, thumbnail, order_index
  }) {
    if (order_index === undefined || order_index === null) {
      const [rows] = await db.query(
        `SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order
         FROM syllabus_outlines WHERE syllabus_id = ?`,
        [syllabus_id]
      );
      order_index = rows[0].next_order;
    }

    const [result] = await db.query(
      `INSERT INTO syllabus_outlines (
        syllabus_id, title, description, abstract, thumbnail, order_index
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [syllabus_id, title, description || null, abstract || null, thumbnail || null, order_index]
    );
    return result.insertId;
  },

  async update(id, {
    title, description, category, subscription_price,
    education_level, target_audience, objectives, status
  }) {
    const updates = [];
    const params = [];
    
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (subscription_price !== undefined) { updates.push('subscription_price = ?'); params.push(subscription_price); }
    if (education_level !== undefined) { updates.push('education_level = ?'); params.push(education_level); }
    if (target_audience !== undefined) { updates.push('target_audience = ?'); params.push(target_audience); }
    if (objectives !== undefined) { updates.push('objectives = ?'); params.push(objectives); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    
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

  /**
   * Get all syllabus outlines (for admin viewing all outlines across all syllabuses)
   */
  async findAllOutlines() {
    const [rows] = await db.query(
      `SELECT so.*, s.title AS syllabus_title, s.id AS syllabus_id, c.id AS course_id, c.title AS course_title
       FROM syllabus_outlines so
       INNER JOIN syllabuses s ON so.syllabus_id = s.id
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE so.deleted_at IS NULL
       ORDER BY s.course_id, s.id, so.order_index ASC`
    );
    return rows;
  },
};
