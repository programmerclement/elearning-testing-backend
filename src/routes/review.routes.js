'use strict';

const router = require('express').Router();
const controller = require('../controllers/review.controller');
const auth = require('../middlewares/auth.middleware');

// Create review
router.post('/', auth, controller.createReview);

// Get all reviews (for admin)
router.get('/', controller.getAllReviews);

// Get all reviews for a course
router.get('/course/:courseId', controller.getCourseReviews);

// Get user's review for a course
router.get('/course/:courseId/my-review', auth, controller.getUserCourseReview);

// Update review
router.put('/:reviewId', auth, controller.updateReview);

// Delete review
router.delete('/:reviewId', auth, controller.deleteReview);

module.exports = router;
