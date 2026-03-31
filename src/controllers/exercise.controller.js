'use strict';

const ExerciseModel = require('../models/exercise.model');
const { success, created } = require('../utils/response');
const { badRequest, notFound } = require('../utils/response');

const ExerciseController = {
  /**
   * @swagger
   * /api/courses/{courseId}/exercise-attempts:
   *   get:
   *     summary: Get exercise attempts for current student in a course
   *     tags: [Exercises]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: List of student's exercise attempts
   */
  async getStudentAttempts(req, res, next) {
    try {
      const attempts = await ExerciseModel.getStudentAttempts(req.user.id, req.params.courseId);
      return success(res, attempts);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/courses/{courseId}/all-attempts:
   *   get:
   *     summary: Get all exercise attempts for a course (Instructor only)
   *     tags: [Exercises]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: List of all exercise attempts with student info
   */
  async getAttemptsByCourse(req, res, next) {
    try {
      const attempts = await ExerciseModel.getAttemptsByCourse(req.params.courseId);
      return success(res, attempts);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/exercises/{exerciseId}/attempt:
   *   post:
   *     summary: Record an exercise attempt
   *     tags: [Exercises]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: exerciseId
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [answer]
   *             properties:
   *               answer:       { type: string,  example: "option_1" }
   *               is_correct:   { type: boolean, example: true }
   *               score:        { type: number,  example: 1 }
   *     responses:
   *       201:
   *         description: Exercise attempt recorded
   *       400:
   *         description: Validation error
   */
  async recordAttempt(req, res, next) {
    try {
      const { answer, is_correct, score } = req.body;
      
      // Allow empty answers - student might not answer
      const attemptId = await ExerciseModel.recordAttempt({
        user_id: req.user.id,
        exercise_id: req.params.exerciseId,
        answer: answer || null,
        is_correct: is_correct !== undefined ? is_correct : null,
        score: score !== undefined ? score : 0,
      });

      return created(res, { id: attemptId });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/exercises
   * Get all exercises (for admin)
   */
  async getAllExercises(req, res, next) {
    try {
      const exercises = await ExerciseModel.findAll();
      return success(res, { exercises });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ExerciseController;
