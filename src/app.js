'use strict';

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./config/swagger');

// ── Routes ──────────────────────────────────────────────────────────────────
const authRoutes             = require('./routes/auth.routes');
const dashboardRoutes        = require('./routes/dashboard.routes');
const instructorRoutes       = require('./routes/instructor.routes');
const courseRoutes           = require('./routes/course.routes');
const chapterNestedRoutes    = require('./routes/chapter.routes');        // POST /api/courses/:courseId/chapters
const chapterStandaloneRoutes = require('./routes/chapterStandalone.routes'); // /api/chapters/:chapterId/...
const exerciseRoutes         = require('./routes/exercise.routes');
const syllabusRoutes         = require('./routes/syllabus.routes');
const couponRoutes           = require('./routes/coupon.routes');
const paymentRoutes          = require('./routes/payment.routes');
const reviewRoutes           = require('./routes/review.routes');
const progressRoutes         = require('./routes/progress.routes');
const followersRoutes        = require('./routes/followers.routes');
const userRoutes             = require('./routes/user.routes');

// ── Middlewares ──────────────────────────────────────────────────────────────
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static File Serving (uploaded files) ────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Swagger Documentation ────────────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Academia API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
    swaggerOptions: { persistAuthorization: true },
  })
);

// Expose raw spec as JSON (useful for Postman import)
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/instructor',  instructorRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/courses/:courseId/chapters', chapterNestedRoutes);
app.use('/api/chapters',    chapterStandaloneRoutes);
app.use('/api/exercises',   exerciseRoutes);
app.use('/api/syllabuses',  syllabusRoutes);
app.use('/api/coupons',     couponRoutes);
app.use('/api/reviews',     reviewRoutes);
app.use('/api/progress',    progressRoutes);
app.use('/api/followers',   followersRoutes);
app.use('/api/users',       userRoutes);
app.use('/api',             paymentRoutes);   // mounts /api/invoices/preview + /api/payments

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, error: { message: 'Route not found' } })
);

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
