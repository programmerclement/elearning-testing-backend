'use strict';

const router     = require('express').Router({ mergeParams: true });
const controller = require('../controllers/chapter.controller');
const auth       = require('../middlewares/auth.middleware');
const { uploadThumbnail } = require('../middlewares/upload.middleware');

// Routes mounted at /api/courses/:courseId/chapters
router.get('/', controller.getCourseChapters);
router.post('/', auth, uploadThumbnail.single('thumbnail'), controller.addChapter);

module.exports = router;
