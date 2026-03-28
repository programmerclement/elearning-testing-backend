'use strict';

const router     = require('express').Router();
const controller = require('../controllers/course.controller');
const auth       = require('../middlewares/auth.middleware');

// Public
router.get('/',           controller.listCourses);
router.get('/:courseId',  controller.getCourse);

// Protected
router.post('/',                     auth, controller.createCourse);
router.put('/:courseId/publish',     auth, controller.publishCourse);
router.delete('/:courseId',          auth, controller.deleteCourse);

module.exports = router;
