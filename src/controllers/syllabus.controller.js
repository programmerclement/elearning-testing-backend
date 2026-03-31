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
   * /api/syllabuses:
   *   get:
   *     summary: List all syllabuses with pagination
   *     tags: [Syllabuses]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *       - in: query
   *         name: status
   *         schema: { type: string, enum: [draft, published, archived] }
   *     responses:
   *       200:
   *         description: Paginated list of syllabuses
   */
  async listSyllabuses(req, res, next) {
    try {
      const result = await SyllabusService.listSyllabuses(req.query);
      return res.status(200).json({ success: true, ...result });
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

  /**
   * @swagger
   * /api/syllabuses/{id}:
   *   put:
   *     summary: Update a syllabus
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
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:       { type: string }
   *               description: { type: string }
   *     responses:
   *       200:
   *         description: Syllabus updated
   *       404:
   *         description: Syllabus not found
   */
  async updateSyllabus(req, res, next) {
    try {
      const syllabus = await SyllabusService.updateSyllabus(req.params.id, req.body);
      return success(res, syllabus, 'Syllabus updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/syllabuses/{id}:
   *   delete:
   *     summary: Delete a syllabus
   *     tags: [Syllabuses]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Syllabus deleted
   *       404:
   *         description: Syllabus not found
   */
  async deleteSyllabus(req, res, next) {
    try {
      const result = await SyllabusService.deleteSyllabus(req.params.id);
      return success(res, result, 'Syllabus deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/syllabuses/outlines/{outlineId}:
   *   put:
   *     summary: Update a syllabus outline
   *     tags: [Syllabuses]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: outlineId
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:       { type: string }
   *               description: { type: string }
   *               order_index: { type: integer }
   *     responses:
   *       200:
   *         description: Outline updated
   *       404:
   *         description: Outline not found
   */
  async updateOutline(req, res, next) {
    try {
      const result = await SyllabusService.updateOutline(req.params.outlineId, req.body);
      return success(res, result, 'Outline updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/syllabuses/outlines/{outlineId}:
   *   delete:
   *     summary: Delete a syllabus outline
   *     tags: [Syllabuses]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: outlineId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Outline deleted
   *       404:
   *         description: Outline not found
   */
  async deleteOutline(req, res, next) {
    try {
      const result = await SyllabusService.deleteOutline(req.params.outlineId);
      return success(res, result, 'Outline deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all syllabus outlines (for admin)
   * @swagger
   * /api/syllabuses/outlines:
   *   get:
   *     summary: Get all syllabus outlines (admin only)
   *     tags: [Syllabuses]
   *     responses:
   *       200:
   *         description: List of all syllabus outlines
   */
  async getAllOutlines(req, res, next) {
    try {
      const SyllabusModel = require('../models/syllabus.model');
      const outlines = await SyllabusModel.findAllOutlines();
      return success(res, { outlines }, 'All syllabus outlines retrieved');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = SyllabusController;
