'use strict';

const SyllabusModel = require('../models/syllabus.model');
const CourseModel   = require('../models/course.model');
const { notFound, badRequest } = require('../utils/response');
const { fileUrl }              = require('../utils/helpers');

const SyllabusService = {
  async createSyllabus(body) {
    const { course_id, title, description } = body;
    if (!course_id) throw badRequest('course_id is required');
    if (!title)     throw badRequest('Syllabus title is required');

    const course = await CourseModel.findById(course_id);
    if (!course) throw notFound('Course not found');

    const id = await SyllabusModel.create({ course_id, title, description });
    return SyllabusModel.findById(id);
  },

  async getSyllabusByCourseId(courseId) {
    const course = await CourseModel.findById(courseId);
    if (!course) throw notFound('Course not found');
    
    const syllabuses = await SyllabusModel.findByCourseId(courseId);
    
    // Fetch outlines for each syllabus
    const syllabusesWithOutlines = await Promise.all(
      syllabuses.map(async (syllabus) => {
        const fullSyllabus = await SyllabusModel.findByIdWithOutlines(syllabus.id);
        return fullSyllabus;
      })
    );
    
    return syllabusesWithOutlines;
  },

  async getSyllabus(id) {
    const syllabus = await SyllabusModel.findByIdWithOutlines(id);
    if (!syllabus) throw notFound('Syllabus not found');
    return syllabus;
  },

  async addOutline(syllabusId, body, file) {
    const syllabus = await SyllabusModel.findById(syllabusId);
    if (!syllabus) throw notFound('Syllabus not found');

    const { title, description, order_index } = body;
    if (!title) throw badRequest('Outline title is required');

    const image = file ? fileUrl(file) : null;

    const id = await SyllabusModel.addOutline({
      syllabus_id: syllabusId,
      title,
      description,
      image,
      order_index: order_index ? parseInt(order_index, 10) : null,
    });

    return SyllabusModel.findByIdWithOutlines(syllabusId);
  },

  async updateSyllabus(id, body) {
    const syllabus = await SyllabusModel.findById(id);
    if (!syllabus) throw notFound('Syllabus not found');

    const { title, description } = body;
    await SyllabusModel.update(id, { title, description });
    return SyllabusModel.findByIdWithOutlines(id);
  },

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
