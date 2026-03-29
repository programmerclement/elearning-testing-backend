'use strict';

const router     = require('express').Router();
const controller = require('../controllers/syllabus.controller');
const auth       = require('../middlewares/auth.middleware');
const { uploadOutline } = require('../middlewares/upload.middleware');

// Create
router.post('/',                     auth, controller.createSyllabus);

// Outlines CRUD
router.post('/:id/outlines',        auth, uploadOutline.single('image'), controller.addOutline);
router.put('/outlines/:outlineId',  auth, controller.updateOutline);
router.delete('/outlines/:outlineId', auth, controller.deleteOutline);

// Syllabus CRUD
router.get('/:id',                 controller.getSyllabus);
router.put('/:id',                  auth, controller.updateSyllabus);
router.delete('/:id',               auth, controller.deleteSyllabus);

module.exports = router;
