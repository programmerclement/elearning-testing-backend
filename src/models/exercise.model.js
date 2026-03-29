'use strict';

const db = require('../config/db');

const ExerciseModel = {
  async create({ chapter_id, question, type, options, correct_answer, points, order_index }) {
    if (order_index === undefined || order_index === null) {
      const [rows] = await db.query(
        `SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order
         FROM exercises WHERE chapter_id = ?`,
        [chapter_id]
      );
      order_index = rows[0].next_order;
    }

    const optionsJson = options ? JSON.stringify(options) : null;

    const [result] = await db.query(
      `INSERT INTO exercises (chapter_id, question, type, options, correct_answer, points, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [chapter_id, question, type || 'radio', optionsJson,
       correct_answer || null, points || 1, order_index]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT e.*, ch.title AS chapter_title
       FROM exercises e
       INNER JOIN chapters ch ON ch.id = e.chapter_id AND ch.deleted_at IS NULL
       WHERE e.id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    const ex = rows[0];
    ex.options = ex.options
      ? (typeof ex.options === 'string' ? JSON.parse(ex.options) : ex.options)
      : null;
    return ex;
  },

  async findByChapter(chapter_id) {
    const [rows] = await db.query(
      `SELECT * FROM exercises WHERE chapter_id = ? ORDER BY order_index ASC`,
      [chapter_id]
    );
    return rows.map((ex) => ({
      ...ex,
      options: ex.options
        ? (typeof ex.options === 'string' ? JSON.parse(ex.options) : ex.options)
        : null,
    }));
  },

  async delete(id) {
    const [result] = await db.query(`DELETE FROM exercises WHERE id = ?`, [id]);
    return result.affectedRows;
  },

  async recordAttempt({ user_id, exercise_id, answer, is_correct, score }) {
    const [result] = await db.query(
      `INSERT INTO exercise_attempts (user_id, exercise_id, answer, is_correct, score)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, exercise_id, answer, is_correct, score]
    );
    return result.insertId;
  },

  async getAttemptsByCourse(courseId) {
    const [rows] = await db.query(
      `SELECT 
         ea.id,
         ea.user_id,
         ea.exercise_id,
         ea.answer,
         ea.is_correct,
         ea.score,
         ea.attempted_at,
         u.name AS student_name,
         u.email AS student_email,
         e.question AS exercise_title,
         e.points,
         c.id AS chapter_id,
         c.title AS chapter_title,
         co.id AS course_id
       FROM exercise_attempts ea
       INNER JOIN users u ON u.id = ea.user_id
       INNER JOIN exercises e ON e.id = ea.exercise_id
       INNER JOIN chapters c ON c.id = e.chapter_id AND c.deleted_at IS NULL
       INNER JOIN courses co ON co.id = c.course_id AND co.deleted_at IS NULL
       WHERE co.id = ?
       ORDER BY ea.attempted_at DESC`,
      [courseId]
    );
    return rows;
  },

  async getStudentAttempts(userId, courseId) {
    const [rows] = await db.query(
      `SELECT 
         ea.id,
         ea.user_id,
         ea.exercise_id,
         ea.answer,
         ea.is_correct,
         ea.score,
         ea.attempted_at,
         e.question AS exercise_title,
         e.points,
         c.id AS chapter_id,
         c.title AS chapter_title,
         co.id AS course_id
       FROM exercise_attempts ea
       INNER JOIN exercises e ON e.id = ea.exercise_id
       INNER JOIN chapters c ON c.id = e.chapter_id AND c.deleted_at IS NULL
       INNER JOIN courses co ON co.id = c.course_id AND co.deleted_at IS NULL
       WHERE ea.user_id = ? AND co.id = ?
       ORDER BY ea.attempted_at DESC`,
      [userId, courseId]
    );
    return rows;
  },
};

module.exports = ExerciseModel;
