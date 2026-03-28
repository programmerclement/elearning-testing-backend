'use strict';

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./config/swagger');

// ── Routes ──────────────────────────────────────────────────────────────────
const dashboardRoutes        = require('./routes/dashboard.routes');
const courseRoutes           = require('./routes/course.routes');
const chapterNestedRoutes    = require('./routes/chapter.routes');        // POST /api/courses/:courseId/chapters
const chapterStandaloneRoutes = require('./routes/chapterStandalone.routes'); // /api/chapters/:chapterId/...
const syllabusRoutes         = require('./routes/syllabus.routes');
const paymentRoutes          = require('./routes/payment.routes');

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
    customSiteTitle: 'E-Learning API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
    swaggerOptions: { persistAuthorization: true },
  })
);

// Expose raw spec as JSON (useful for Postman import)
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/courses/:courseId/chapters', chapterNestedRoutes);
app.use('/api/chapters',    chapterStandaloneRoutes);
app.use('/api/syllabuses',  syllabusRoutes);
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
