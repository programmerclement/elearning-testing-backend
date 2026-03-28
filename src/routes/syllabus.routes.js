'use strict';

const router     = require('express').Router();
const controller = require('../controllers/syllabus.controller');
const auth       = require('../middlewares/auth.middleware');
const { uploadOutline } = require('../middlewares/upload.middleware');

router.post('/',                controller.createSyllabus);
router.get('/:id',              controller.getSyllabus);
router.post('/:id/outlines',    auth, uploadOutline.single('image'), controller.addOutline);

module.exports = router;
