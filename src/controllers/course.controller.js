'use strict';

const CourseService = require('../services/course.service');
const SyllabusService = require('../services/syllabus.service');
const { success, created } = require('../utils/response');

const CourseController = {
  /**
   * @swagger
   * /api/courses:
   *   post:
   *     summary: Create a new course draft
   *     tags: [Courses]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title]
   *             properties:
   *               title:       { type: string,  example: "Mastering Node.js" }
   *               description: { type: string,  example: "A comprehensive Node.js course" }
   *               price:       { type: number,  example: 49.99 }
   *               category:    { type: string,  example: "Web Development" }
   *               level:       { type: string,  enum: [beginner, intermediate, advanced], example: "intermediate" }
   *               language:    { type: string,  example: "English" }
   *     responses:
   *       201:
   *         description: Course draft created
   *       400:
   *         description: Validation error
   */
  async createCourse(req, res, next) {
    try {
      const course = await CourseService.createCourse(req.body, req.user);
      return created(res, course, 'Course draft created successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/courses:
   *   get:
   *     summary: List all courses (paginated)
   *     tags: [Courses]
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
   *         description: Paginated list of courses
   */
  async listCourses(req, res, next) {
    try {
      const result = await CourseService.listCourses(req.query);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/courses/{courseId}:
   *   get:
   *     summary: Get a course with nested chapters and exercises
   *     tags: [Courses]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Course with nested chapters and exercises
   *       404:
   *         description: Course not found
   */
  async getCourse(req, res, next) {
    try {
      const course = await CourseService.getCourseWithNested(req.params.courseId);
      return success(res, course);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/courses/{courseId}/syllabuses:
   *   get:
   *     summary: Get all syllabuses for a course
   *     tags: [Courses]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: List of syllabuses for the course
   *       404:
   *         description: Course not found
   */
  async getCourseSyllabuses(req, res, next) {
    try {
      const syllabuses = await SyllabusService.getSyllabusByCourseId(req.params.courseId);
      return success(res, syllabuses);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/courses/{courseId}/publish:
   *   put:
   *     summary: Publish a course (change status to published)
   *     tags: [Courses]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Course published
   *       400:
   *         description: Already published
   *       404:
   *         description: Course not found
   */
  async publishCourse(req, res, next) {
    try {
      const course = await CourseService.publishCourse(req.params.courseId);
      return success(res, course, 'Course published successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/courses/{courseId}:
   *   put:
   *     summary: Update course details (title, description, price, etc.)
   *     tags: [Courses]
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
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:       { type: string,  example: "Updated Course Title" }
   *               description: { type: string,  example: "Updated description" }
   *               price:       { type: number,  example: 59.99 }
   *               category:    { type: string,  example: "Web Development" }
   *               level:       { type: string,  enum: [beginner, intermediate, advanced], example: "advanced" }
   *               language:    { type: string,  example: "English" }
   *     responses:
   *       200:
   *         description: Course updated
   *       400:
   *         description: Validation error or not authorized
   *       404:
   *         description: Course not found
   */
  async updateCourse(req, res, next) {
    try {
      const course = await CourseService.updateCourse(req.params.courseId, req.body, req.user);
      return success(res, course, 'Course updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteCourse(req, res, next) {
    try {
      const result = await CourseService.deleteCourse(req.params.courseId);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CourseController;
