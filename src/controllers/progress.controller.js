'use strict';

const ProgressModel = require('../models/progress.model');
const { success, badRequest } = require('../utils/response');

const ProgressController = {
  /**
   * @swagger
   * /api/progress:
   *   post:
   *     summary: Mark a chapter as completed
   *     tags: [Progress]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [chapter_id, course_id]
   *             properties:
   *               chapter_id: { type: integer }
   *               course_id: { type: integer }
   */
  async markChapterComplete(req, res, next) {
    try {
      const { chapter_id, course_id } = req.body;

      if (!chapter_id || !course_id) {
        return badRequest(res, 'Chapter ID and Course ID are required');
      }

      const result = await ProgressModel.markComplete({
        user_id: req.user.id,
        chapter_id,
        course_id,
      });

      // Check if all chapters completed
      const isCompleted = await ProgressModel.checkAndFinalizeEnrollment(
        req.user.id,
        course_id
      );

      return success(res, {
        success: true,
        courseCompleted: isCompleted,
      }, 'Chapter marked as completed');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/progress/{courseId}:
   *   get:
   *     summary: Get course progress for current user
   *     tags: [Progress]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: integer }
   */
  async getCourseProgress(req, res, next) {
    try {
      const { courseId } = req.params;
      
      const progressList = await ProgressModel.getByUserAndCourse(
        req.user.id,
        courseId
      );

      const percentage = await ProgressModel.getCourseProgress(
        req.user.id,
        courseId
      );

      return success(res, {
        progress: progressList,
        percentage,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get all courses progress for user
   */
  async getAllCoursesProgress(req, res, next) {
    try {
      const coursesProgress = await ProgressModel.getUserAllCoursesProgress(
        req.user.id
      );

      // Transform to match frontend expectations
      const progress = coursesProgress.map(course => ({
        course_id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        total_chapters: course.total_chapters,
        completed_chapters: course.completed_chapters,
        percentage: course.progress_percentage,
        completed_at: course.completed_at
      }));

      return success(res, { progress });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Check if a chapter is completed
   */
  async checkChapterCompletion(req, res, next) {
    try {
      const { chapterId } = req.params;
      const isCompleted = await ProgressModel.isChapterCompleted(
        req.user.id,
        chapterId
      );

      return success(res, { completed: isCompleted });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ProgressController;
