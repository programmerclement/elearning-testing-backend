'use strict';

const ChapterService = require('../services/chapter.service');
const { success, created } = require('../utils/response');

const ChapterController = {
  /**
   * @swagger
   * /api/courses/{courseId}/chapters:
   *   post:
   *     summary: Add a chapter to a course (with optional thumbnail upload)
   *     tags: [Chapters]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
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
   *               title:       { type: string,  example: "Introduction to Node.js" }
   *               description: { type: string,  example: "Overview of Node.js fundamentals" }
   *               video_url:   { type: string,  example: "https://youtube.com/..." }
   *               duration:    { type: integer, example: 45, description: "Duration in minutes" }
   *               order_index: { type: integer, example: 1 }
   *               thumbnail:   { type: string,  format: binary }
   *     responses:
   *       201:
   *         description: Chapter created
   *       400:
   *         description: Validation error
   *       404:
   *         description: Course not found
   */
  async addChapter(req, res, next) {
    try {
      const chapter = await ChapterService.addChapter(
        req.params.courseId,
        req.body,
        req.file
      );
      return created(res, chapter, 'Chapter added successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/chapters/{chapterId}:
   *   get:
   *     summary: Get a single chapter by ID
   *     tags: [Chapters]
   *     parameters:
   *       - in: path
   *         name: chapterId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Chapter details
   *       404:
   *         description: Chapter not found
   */
  async getChapter(req, res, next) {
    try {
      const chapter = await ChapterService.getChapter(req.params.chapterId);
      return success(res, chapter);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/chapters/{chapterId}/exercises:
   *   post:
   *     summary: Add an exercise/question to a chapter
   *     tags: [Exercises]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: chapterId
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [question]
   *             properties:
   *               question:
   *                 type: string
   *                 example: "What is Node.js?"
   *               type:
   *                 type: string
   *                 enum: [checkbox, radio, text]
   *                 example: "radio"
   *               options:
   *                 type: array
   *                 description: Required for checkbox/radio types
   *                 items:
   *                   type: object
   *                   properties:
   *                     label:      { type: string,  example: "A JavaScript runtime" }
   *                     value:      { type: string,  example: "b" }
   *                     is_correct: { type: boolean, example: true }
   *               correct_answer:
   *                 type: string
   *                 description: Required for text type
   *                 example: "app.get()"
   *               points:      { type: integer, example: 2 }
   *               order_index: { type: integer, example: 1 }
   *     responses:
   *       201:
   *         description: Exercise created
   *       400:
   *         description: Validation error
   *       404:
   *         description: Chapter not found
   */
  async addExercise(req, res, next) {
    try {
      const exercise = await ChapterService.addExercise(req.params.chapterId, req.body);
      return created(res, exercise, 'Exercise added successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/chapters/{chapterId}/exercises:
   *   get:
   *     summary: Get all exercises for a chapter
   *     tags: [Exercises]
   *     parameters:
   *       - in: path
   *         name: chapterId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: List of exercises
   *       404:
   *         description: Chapter not found
   */
  async getExercises(req, res, next) {
    try {
      const exercises = await ChapterService.getExercisesByChapter(req.params.chapterId);
      return success(res, exercises);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/chapters/{chapterId}/complete:
   *   post:
   *     summary: Mark a chapter as completed for the authenticated user
   *     tags: [Progress]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: chapterId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Chapter marked as completed
   *       404:
   *         description: Chapter not found
   */
  async markComplete(req, res, next) {
    try {
      const result = await ChapterService.markComplete(req.params.chapterId, req.user);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ChapterController;
