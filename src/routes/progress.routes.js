'use strict';

const router = require('express').Router();
const controller = require('../controllers/progress.controller');
const auth = require('../middlewares/auth.middleware');

// GET all courses progress - MUST be before /:courseId
router.get('/', auth, controller.getAllCoursesProgress);

// Specific nested route
router.get('/chapter/:chapterId/status', auth, controller.checkChapterCompletion);

// POST mark chapter complete
router.post('/', auth, controller.markChapterComplete);

// GET single course progress
router.get('/:courseId', auth, controller.getCourseProgress);

module.exports = router;
