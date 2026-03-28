'use strict';

const ChapterModel  = require('../models/chapter.model');
const CourseModel   = require('../models/course.model');
const ExerciseModel = require('../models/exercise.model');
const { notFound, badRequest } = require('../utils/response');
const { fileUrl }              = require('../utils/helpers');

const ChapterService = {
  async addChapter(courseId, body, file) {
    const course = await CourseModel.findById(courseId);
    if (!course) throw notFound('Course not found');

    const { title, description, video_url, duration, order_index } = body;
    if (!title) throw badRequest('Chapter title is required');

    const thumbnail = file ? fileUrl(file) : null;

    const id = await ChapterModel.create({
      course_id:   courseId,
      title,
      description,
      thumbnail,
      video_url:   video_url   || null,
      duration:    duration    ? parseInt(duration, 10) : null,
      order_index: order_index ? parseInt(order_index, 10) : null,
    });

    return ChapterModel.findById(id);
  },

  async getChapter(id) {
    const chapter = await ChapterModel.findById(id);
    if (!chapter) throw notFound('Chapter not found');
    return chapter;
  },

  async addExercise(chapterId, body) {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) throw notFound('Chapter not found');

    const { question, type, options, correct_answer, points, order_index } = body;
    if (!question) throw badRequest('Exercise question is required');

    const validTypes = ['checkbox', 'radio', 'text'];
    if (type && !validTypes.includes(type)) {
      throw badRequest(`Exercise type must be one of: ${validTypes.join(', ')}`);
    }

    if (type !== 'text' && (!options || !Array.isArray(options) || options.length === 0)) {
      throw badRequest('Options array is required for checkbox/radio exercise types');
    }

    const id = await ExerciseModel.create({
      chapter_id:     chapterId,
      question,
      type:           type || 'radio',
      options:        options || null,
      correct_answer: correct_answer || null,
      points:         points || 1,
      order_index:    order_index || null,
    });

    return ExerciseModel.findById(id);
  },

  async getExercisesByChapter(chapterId) {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) throw notFound('Chapter not found');
    return ExerciseModel.findByChapter(chapterId);
  },

  async markComplete(chapterId, user) {
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) throw notFound('Chapter not found');

    const ProgressModel = require('../models/progress.model');
    await ProgressModel.markComplete({
      user_id:    user.id,
      chapter_id: chapterId,
      course_id:  chapter.course_id,
    });
    const courseCompleted = await ProgressModel.checkAndFinalizeEnrollment(user.id, chapter.course_id);

    return { message: 'Chapter marked as completed', course_completed: courseCompleted };
  },
};

module.exports = ChapterService;
