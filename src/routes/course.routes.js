'use strict';

const router     = require('express').Router();
const controller = require('../controllers/course.controller');
const exerciseController = require('../controllers/exercise.controller');
const auth       = require('../middlewares/auth.middleware');

// Specific routes FIRST
router.get('/admin/all-enrollments', controller.getAllEnrollments);
router.get('/:courseId/syllabuses', controller.getCourseSyllabuses);
router.get('/:courseId/enrollments', controller.getCourseEnrollments);
router.get('/:courseId/all-attempts', auth, exerciseController.getAttemptsByCourse);
router.get('/:courseId/exercise-attempts', auth, exerciseController.getStudentAttempts);
router.post('/exercises/:exerciseId/attempt', auth, exerciseController.recordAttempt);

// Generic CRUD routes
router.get('/',                    controller.listCourses);
router.get('/:courseId',           controller.getCourse);

// Protected routes
router.post('/',                   auth, controller.createCourse);
router.put('/:courseId',           auth, controller.updateCourse);
router.put('/:courseId/publish',   auth, controller.publishCourse);
router.delete('/:courseId',        auth, controller.deleteCourse);

module.exports = router;
