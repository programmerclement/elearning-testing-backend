'use strict';

const router     = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const { verifyToken, allowRoles } = require('../middlewares/auth.middleware');

// Legacy endpoints (kept for backward compatibility)
router.get('/metrics',         verifyToken, controller.getMetrics);
router.get('/lessons-history', verifyToken, controller.getLessonsHistory);

// Role-based dashboard endpoints
router.get('/student',     verifyToken, allowRoles('student'), controller.getStudentDashboard);
router.get('/instructor',  verifyToken, allowRoles('instructor'), controller.getInstructorDashboard);
router.get('/admin',       verifyToken, allowRoles('admin'), controller.getAdminDashboard);

module.exports = router;
