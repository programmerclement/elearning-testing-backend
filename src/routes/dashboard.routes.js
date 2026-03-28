'use strict';

const router     = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const auth       = require('../middlewares/auth.middleware');

router.get('/metrics',         auth, controller.getMetrics);
router.get('/lessons-history', auth, controller.getLessonsHistory);

module.exports = router;
