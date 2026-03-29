'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password, role? }
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', AuthController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyToken, AuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 * @body    { name?, avatar? }
 */
router.put('/profile', verifyToken, AuthController.updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (token removed on client)
 * @access  Private
 */
router.post('/logout', verifyToken, AuthController.logout);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify JWT token validity
 * @access  Public
 * @headers { Authorization: Bearer <token> }
 */
router.post('/verify', AuthController.verifyToken);

module.exports = router;
