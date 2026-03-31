'use strict';

const router     = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const { verifyToken, allowRoles } = require('../middlewares/auth.middleware');

/**
 * Instructor-specific routes
 * All routes require instructor role
 */

// Get all students enrolled in instructor's courses
router.get('/students', verifyToken, allowRoles('instructor'), controller.getInstructorStudents);

module.exports = router;
