'use strict';

const router     = require('express').Router();
const controller = require('../controllers/syllabus.controller');
const auth       = require('../middlewares/auth.middleware');
const { uploadOutline } = require('../middlewares/upload.middleware');

// List syllabuses
router.get('/',                     controller.listSyllabuses);

// Create syllabus (standalone)
router.post('/',                     auth, controller.createSyllabus);

// Get single syllabus
router.get('/:id',                 controller.getSyllabus);

// Update syllabus
router.put('/:id',                  auth, controller.updateSyllabus);

// Delete syllabus
router.delete('/:id',               auth, controller.deleteSyllabus);

// Add outline to syllabus
router.post('/:id/outlines',        auth, uploadOutline.single('thumbnail'), controller.addOutline);

// Update outline
router.put('/outlines/:outlineId',  auth, controller.updateOutline);

// Delete outline
router.delete('/outlines/:outlineId', auth, controller.deleteOutline);

module.exports = router;
