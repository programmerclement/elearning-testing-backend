'use strict';

const router = require('express').Router();
const controller = require('../controllers/exercise.controller');

/**
 * Exercise routes
 */

// Get all exercises (for admin)
router.get('/', controller.getAllExercises);

module.exports = router;
