'use strict';

const CourseModel = require('../models/course.model');
const { paginate, fileUrl } = require('../utils/helpers');
const { notFound, badRequest } = require('../utils/response');

const CourseService = {
  async createCourse(body, user) {
    const {
      title, description,
      price, subscription_price, category, level, language,
      duration_weeks, required_hours_per_week, education_level,
      target_audience, objectives, thumbnail, thumbnail_url
    } = body;
    
    if (!title) throw badRequest('Course title is required');

    const id = await CourseModel.create({
      instructor_id: user.id,
      title,
      description,
      price,
      subscription_price,
      category,
      level,
      language,
      duration_weeks,
      required_hours_per_week,
      education_level,
      target_audience,
      objectives,
      thumbnail,
      thumbnail_url
    });

    return CourseModel.findById(id);
  },

  async updateCourse(id, body, user) {
    const course = await CourseModel.findById(id);
    if (!course) throw notFound('Course not found');
    if (course.instructor_id !== user.id) throw badRequest('Not authorized to update this course');
    if (course.status === 'published') throw badRequest('Cannot update a published course');

    const {
      title, description,
      price, subscription_price, category, level, language,
      duration_weeks, required_hours_per_week, education_level,
      target_audience, objectives, thumbnail, thumbnail_url
    } = body;
    
    const affectedRows = await CourseModel.update(id, {
      title, description,
      price, subscription_price, category, level, language,
      duration_weeks, required_hours_per_week, education_level,
      target_audience, objectives, thumbnail, thumbnail_url
    });
    
    if (!affectedRows) throw badRequest('No fields to update');

    return CourseModel.findById(id);
  },

  async getCourseById(id) {
    const course = await CourseModel.findById(id);
    if (!course) throw notFound('Course not found');
    return course;
  },

  async getCourseWithNested(id) {
    const course = await CourseModel.findByIdWithNested(id);
    if (!course) throw notFound('Course not found');
    return course;
  },

  async publishCourse(id) {
    const course = await CourseModel.findById(id);
    if (!course) throw notFound('Course not found');
    if (course.status === 'published') throw badRequest('Course is already published');

    await CourseModel.updateStatus(id, 'published');
    return CourseModel.findById(id);
  },

  async listCourses(query) {
    const { page, limit, offset } = paginate(query, 10);
    const { status } = query;
    const [rows, total] = await Promise.all([
      CourseModel.list({ limit, offset, status }),
      CourseModel.count(status),
    ]);
    return {
      data: rows,
      pagination: { page, limit, total: Number(total), total_pages: Math.ceil(Number(total) / limit) },
    };
  },

  async deleteCourse(id) {
    const affected = await CourseModel.softDelete(id);
    if (!affected) throw notFound('Course not found');
    return { message: 'Course deleted successfully' };
  },

  async getEnrollmentsByCourseId(id) {
    const course = await CourseModel.findById(id);
    if (!course) throw notFound('Course not found');
    const enrollments = await CourseModel.getEnrollmentsByCourseId(id);
    return enrollments;
  },
};

module.exports = CourseService;
