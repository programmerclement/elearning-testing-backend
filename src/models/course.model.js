'use strict';

const db = require('../config/db');

const CourseModel = {
  async create({
    instructor_id,
    title,
    description,
    thumbnail,
    thumbnail_url,
    price,
    subscription_price,
    category,
    level,
    language,
    duration_weeks,
    required_hours_per_week,
    education_level,
    target_audience,
    objectives
  }) {
    const [result] = await db.query(
      `INSERT INTO courses (
        instructor_id, title, description, 
        thumbnail, thumbnail_url, price, subscription_price, 
        category, level, language, duration_weeks, required_hours_per_week,
        education_level, target_audience, objectives
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        instructor_id,
        title,
        description || null,
        thumbnail || null,
        thumbnail_url || null,
        price || 0,
        subscription_price || 0,
        category || null,
        level || 'beginner',
        language || 'English',
        duration_weeks || null,
        required_hours_per_week || null,
        education_level || null,
        target_audience || null,
        objectives || null
      ]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS instructor_name
       FROM courses c
       LEFT JOIN users u ON u.id = c.instructor_id
       WHERE c.id = ? AND c.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  async findByIdWithNested(id) {
    // Course row
    const [courses] = await db.query(
      `SELECT c.*, u.name AS instructor_name
       FROM courses c
       LEFT JOIN users u ON u.id = c.instructor_id
       WHERE c.id = ? AND c.deleted_at IS NULL`,
      [id]
    );
    if (!courses.length) return null;

    // Chapters (not soft-deleted)
    const [chapters] = await db.query(
      `SELECT * FROM chapters WHERE course_id = ? AND deleted_at IS NULL ORDER BY order_index ASC`,
      [id]
    );

    // Exercises for each chapter
    for (const ch of chapters) {
      const [exercises] = await db.query(
        `SELECT * FROM exercises WHERE chapter_id = ? ORDER BY order_index ASC`,
        [ch.id]
      );
      ch.exercises = exercises.map((ex) => ({
        ...ex,
        options: ex.options ? (typeof ex.options === 'string' ? JSON.parse(ex.options) : ex.options) : null,
      }));
    }

    return { ...courses[0], chapters };
  },

  async update(id, {
    title, description, price, subscription_price,
    category, level, language, thumbnail, thumbnail_url,
    duration_weeks, required_hours_per_week, education_level,
    target_audience, objectives
  }) {
    const updates = [];
    const params = [];
    
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (subscription_price !== undefined) { updates.push('subscription_price = ?'); params.push(subscription_price); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (level !== undefined) { updates.push('level = ?'); params.push(level); }
    if (language !== undefined) { updates.push('language = ?'); params.push(language); }
    if (thumbnail !== undefined) { updates.push('thumbnail = ?'); params.push(thumbnail); }
    if (thumbnail_url !== undefined) { updates.push('thumbnail_url = ?'); params.push(thumbnail_url); }
    if (duration_weeks !== undefined) { updates.push('duration_weeks = ?'); params.push(duration_weeks); }
    if (required_hours_per_week !== undefined) { updates.push('required_hours_per_week = ?'); params.push(required_hours_per_week); }
    if (education_level !== undefined) { updates.push('education_level = ?'); params.push(education_level); }
    if (target_audience !== undefined) { updates.push('target_audience = ?'); params.push(target_audience); }
    if (objectives !== undefined) { updates.push('objectives = ?'); params.push(objectives); }

    if (updates.length === 0) return 0;

    params.push(id);
    const query = `UPDATE courses SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
    const [result] = await db.query(query, params);
    return result.affectedRows;
  },

  async updateStatus(id, status) {
    const [result] = await db.query(
      `UPDATE courses SET status = ? WHERE id = ? AND deleted_at IS NULL`,
      [status, id]
    );
    return result.affectedRows;
  },

  async softDelete(id) {
    const [result] = await db.query(
      `UPDATE courses SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result.affectedRows;
  },

  async list({ limit, offset, status }) {
    const params = [];
    let where = 'WHERE c.deleted_at IS NULL';
    if (status) { where += ' AND c.status = ?'; params.push(status); }
    params.push(limit, offset);

    const [rows] = await db.query(
      `SELECT c.*, u.name AS instructor_name,
              COUNT(DISTINCT en.id) AS enrollment_count,
              ROUND(AVG(r.rating), 1) AS avg_rating
       FROM courses c
       LEFT JOIN users       u  ON u.id = c.instructor_id
       LEFT JOIN enrollments en ON en.course_id = c.id
       LEFT JOIN reviews     r  ON r.course_id  = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  },

  async count(status) {
    const params = [];
    let where = 'WHERE deleted_at IS NULL';
    if (status) { where += ' AND status = ?'; params.push(status); }
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM courses ${where}`, params);
    return rows[0].total;
  },
};

module.exports = CourseModel;
