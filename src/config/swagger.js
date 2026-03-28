'use strict';

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Learning & Course Management API',
      version: '1.0.0',
      description:
        'Complete production-ready backend API for an E-Learning platform. ' +
        'Covers authentication, course creation, chapters, exercises, syllabuses, payments, and user progress.',
      contact: { name: 'API Support', email: 'support@elearn.com' },
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 3000}`, description: 'Local Development' },
    ],
    tags: [
      { name: 'Dashboard',  description: 'Metrics and lesson history' },
      { name: 'Courses',    description: 'Course CRUD and publish flow' },
      { name: 'Chapters',   description: 'Chapter management with file upload' },
      { name: 'Exercises',  description: 'Exercise / quiz management' },
      { name: 'Syllabuses', description: 'Syllabus and outlines management' },
      { name: 'Payments',   description: 'Invoice preview and payment processing' },
      { name: 'Progress',   description: 'User lesson progress tracking' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
