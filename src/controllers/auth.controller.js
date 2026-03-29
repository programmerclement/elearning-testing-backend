'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const { name, email, password, role = 'student' } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return errorResponse(res, 'Name, email, and password are required', 400);
      }

      if (password.length < 6) {
        return errorResponse(res, 'Password must be at least 6 characters', 400);
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return errorResponse(res, 'Email already registered', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role === 'student' ? 'student' : role,
      });

      // Fetch created user
      const user = await User.findById(result.insertId);

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return successResponse(res, {
        message: 'User registered successfully',
        data: {
          user,
          token,
        },
      }, 201);
    } catch (error) {
      console.error('Register error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return errorResponse(res, 'Email and password are required', 400);
      }

      // Find user with password
      const user = await User.findByEmailForAuth(email);
      if (!user) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return successResponse(res, {
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, {
        message: 'Profile fetched',
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res) {
    try {
      const { name, avatar } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (avatar) updates.avatar = avatar;

      await User.update(req.user.id, updates);
      const updatedUser = await User.findById(req.user.id);

      return successResponse(res, {
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Logout (frontend removes token)
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    // Token is removed on client side
    return successResponse(res, {
      message: 'Logged out successfully',
    });
  }

  /**
   * Verify token
   * POST /api/auth/verify
   */
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return errorResponse(res, 'No token provided', 401);
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, {
        message: 'Token valid',
        data: user,
      });
    } catch (error) {
      return errorResponse(res, 'Invalid token', 401);
    }
  }
}

module.exports = AuthController;
