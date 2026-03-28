'use strict';

/**
 * Chapter-level routes (standalone /api/chapters/:chapterId/...)
 * Separate from the nested course-chapter creation route.
 */
const router     = require('express').Router();
const controller = require('../controllers/chapter.controller');
const auth       = require('../middlewares/auth.middleware');

// GET single chapter
router.get('/:chapterId', controller.getChapter);

// Exercise sub-routes
router.get('/:chapterId/exercises', controller.getExercises);
router.post('/:chapterId/exercises', auth, controller.addExercise);

// Progress
router.post('/:chapterId/complete', auth, controller.markComplete);

module.exports = router;
