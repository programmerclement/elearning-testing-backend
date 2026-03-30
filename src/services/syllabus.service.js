'use strict';

const SyllabusModel = require('../models/syllabus.model');
const CourseModel   = require('../models/course.model');
const { notFound, badRequest } = require('../utils/response');
const { fileUrl, paginate } = require('../utils/helpers');

const SyllabusService = {
  /**
   * Create standalone syllabus (no course dependency)
   */
  async createSyllabus(body) {
    const {
      title, description, category, subscription_price,
      education_level, target_audience, objectives, status
    } = body;
    
    if (!title) throw badRequest('Syllabus title is required');

    const id = await SyllabusModel.create({
      title,
      description,
      category,
      subscription_price,
      education_level,
      target_audience,
      objectives,
      status: status || 'draft'
    });

    return SyllabusModel.findById(id);
  },

  /**
   * Get all syllabuses with pagination
   */
  async listSyllabuses(query = {}) {
    const { page = 1, limit = 10, status } = query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const [rows, total] = await Promise.all([
      SyllabusModel.findAll({ limit: parseInt(limit), offset, status }),
      SyllabusModel.count(status)
    ]);

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  },

  /**
   * Get single syllabus with outlines
   */
  async getSyllabus(id) {
    const syllabus = await SyllabusModel.findByIdWithOutlines(id);
    if (!syllabus) throw notFound('Syllabus not found');
    return syllabus;
  },

  /**
   * Get syllabus by course (for backwards compatibility)
   */
  async getSyllabusByCourseId(courseId) {
    const course = await CourseModel.findById(courseId);
    if (!course) throw notFound('Course not found');
    
    // This method is deprecated - syllabuses are now standalone
    // Return empty array for backwards compatibility
    return [];
  },

  /**
   * Add outline to syllabus
   */
  async addOutline(syllabusId, body, file) {
    const syllabus = await SyllabusModel.findById(syllabusId);
    if (!syllabus) throw notFound('Syllabus not found');

    const { title, description, abstract, order_index } = body;
    if (!title) throw badRequest('Outline title is required');

    const thumbnail = file ? fileUrl(file) : null;

    const id = await SyllabusModel.addOutline({
      syllabus_id: syllabusId,
      title,
      description,
      abstract,
      thumbnail,
      order_index: order_index ? parseInt(order_index, 10) : null,
    });

    return SyllabusModel.findByIdWithOutlines(syllabusId);
  },

  /**
   * Update syllabus
   */
  async updateSyllabus(id, body) {
    const syllabus = await SyllabusModel.findById(id);
    if (!syllabus) throw notFound('Syllabus not found');

    const {
      title, description, category, subscription_price,
      education_level, target_audience, objectives, status
    } = body;

    await SyllabusModel.update(id, {
      title, description, category, subscription_price,
      education_level, target_audience, objectives, status
    });

    return SyllabusModel.findByIdWithOutlines(id);
  },

  /**
   * Delete syllabus
   */
  async deleteSyllabus(id) {
    const syllabus = await SyllabusModel.findById(id);
    if (!syllabus) throw notFound('Syllabus not found');

    await SyllabusModel.delete(id);
    return { message: 'Syllabus deleted successfully' };
  },

  async updateOutline(outlineId, body) {
    const { title, description, order_index } = body;
    await SyllabusModel.updateOutline(outlineId, { title, description, order_index });
    return SyllabusModel.findOutlineById(outlineId);
  },

  async deleteOutline(outlineId) {
    await SyllabusModel.deleteOutline(outlineId);
    return { message: 'Outline deleted successfully' };
  },
};

module.exports = SyllabusService;
