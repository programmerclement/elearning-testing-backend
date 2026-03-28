'use strict';

const SyllabusService = require('../services/syllabus.service');
const { success, created } = require('../utils/response');

const SyllabusController = {
  /**
   * @swagger
   * /api/syllabuses:
   *   post:
   *     summary: Create a new syllabus for a course
   *     tags: [Syllabuses]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [course_id, title]
   *             properties:
   *               course_id:   { type: integer, example: 1 }
   *               title:       { type: string,  example: "Complete Node.js Syllabus" }
   *               description: { type: string,  example: "Week-by-week learning breakdown" }
   *     responses:
   *       201:
   *         description: Syllabus created
   *       400:
   *         description: Validation error
   *       404:
   *         description: Course not found
   */
  async createSyllabus(req, res, next) {
    try {
      const syllabus = await SyllabusService.createSyllabus(req.body);
      return created(res, syllabus, 'Syllabus created successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/syllabuses/{id}:
   *   get:
   *     summary: Get a syllabus with all its outlines
   *     tags: [Syllabuses]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Syllabus with outlines
   *       404:
   *         description: Syllabus not found
   */
  async getSyllabus(req, res, next) {
    try {
      const syllabus = await SyllabusService.getSyllabus(req.params.id);
      return success(res, syllabus);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/syllabuses/{id}/outlines:
   *   post:
   *     summary: Add an outline item to a syllabus (with optional image upload)
   *     tags: [Syllabuses]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [title]
   *             properties:
   *               title:       { type: string,  example: "Week 1: Fundamentals" }
   *               description: { type: string,  example: "Core concepts and setup" }
   *               order_index: { type: integer, example: 1 }
   *               image:       { type: string,  format: binary }
   *     responses:
   *       201:
   *         description: Outline added
   *       400:
   *         description: Validation error
   *       404:
   *         description: Syllabus not found
   */
  async addOutline(req, res, next) {
    try {
      const syllabus = await SyllabusService.addOutline(req.params.id, req.body, req.file);
      return created(res, syllabus, 'Outline added successfully');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SyllabusController;
