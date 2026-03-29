'use strict';

const router = require('express').Router();
const controller = require('../controllers/progress.controller');
const auth = require('../middlewares/auth.middleware');

// Mark chapter as completed
router.post('/', auth, controller.markChapterComplete);

// Get progress for a specific course
router.get('/:courseId', auth, controller.getCourseProgress);

// Get all courses progress for user
router.get('/', auth, controller.getAllCoursesProgress);

// Check if chapter is completed
router.get('/chapter/:chapterId/status', auth, controller.checkChapterCompletion);

module.exports = router;
