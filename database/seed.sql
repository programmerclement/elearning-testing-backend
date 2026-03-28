-- ============================================================
-- E-Learning Platform - Seed Data
-- ============================================================

USE elearning_db;

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (id, name, email, password, role, avatar) VALUES
  (1, 'Alice Instructor', 'alice@elearn.com', '$2b$10$hashedpassword1', 'instructor', '/uploads/avatars/alice.jpg'),
  (2, 'Bob Student',      'bob@elearn.com',   '$2b$10$hashedpassword2', 'student',    '/uploads/avatars/bob.jpg'),
  (3, 'Carol Student',    'carol@elearn.com', '$2b$10$hashedpassword3', 'student',    NULL),
  (4, 'Dave Admin',       'dave@elearn.com',  '$2b$10$hashedpassword4', 'admin',      NULL),
  (5, 'Eve Student',      'eve@elearn.com',   '$2b$10$hashedpassword5', 'student',    NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================================
-- COURSES
-- ============================================================
INSERT INTO courses (id, instructor_id, title, description, thumbnail, status, price, category, level, language) VALUES
  (1, 1, 'Complete Node.js & Express Backend Development',
     'Master backend development with Node.js, Express, MySQL and REST APIs.',
     '/uploads/thumbnails/nodejs-course.jpg', 'published', 49.99, 'Web Development', 'intermediate', 'English'),
  (2, 1, 'React.js for Beginners',
     'Learn React from scratch with hooks, state management and real projects.',
     '/uploads/thumbnails/reactjs-course.jpg', 'published', 39.99, 'Web Development', 'beginner', 'English'),
  (3, 1, 'Advanced MySQL & Database Design',
     'Deep dive into MySQL, query optimization, indexing, and database design patterns.',
     '/uploads/thumbnails/mysql-course.jpg', 'draft', 59.99, 'Database', 'advanced', 'English')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- CHAPTERS
-- ============================================================
INSERT INTO chapters (id, course_id, title, description, thumbnail, video_url, duration, order_index) VALUES
  (1, 1, 'Introduction to Node.js',   'History and ecosystem of Node.js.',       '/uploads/chapters/ch1.jpg', NULL,     30, 1),
  (2, 1, 'Express Framework Basics',  'Routing, middleware, and request cycle.', '/uploads/chapters/ch2.jpg', NULL,     45, 2),
  (3, 1, 'Connecting to MySQL',       'Using mysql2 and raw SQL queries.',       '/uploads/chapters/ch3.jpg', NULL,     60, 3),
  (4, 2, 'Setting up React',          'Create React App and project structure.',  NULL,                        NULL,     25, 1),
  (5, 2, 'Components and JSX',        'Building UI with components.',             NULL,                        NULL,     40, 2),
  (6, 3, 'Relational Database Basics','Tables, keys, and normalization.',         NULL,                        NULL,     50, 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- EXERCISES
-- ============================================================
INSERT INTO exercises (id, chapter_id, question, type, options, correct_answer, points, order_index) VALUES
  (1, 1, 'What is Node.js?', 'radio',
     '[{"label":"A browser","value":"a","is_correct":false},{"label":"A JavaScript runtime","value":"b","is_correct":true},{"label":"A database","value":"c","is_correct":false}]',
     NULL, 2, 1),
  (2, 1, 'Which of these are Node.js built-in modules?', 'checkbox',
     '[{"label":"fs","value":"fs","is_correct":true},{"label":"http","value":"http","is_correct":true},{"label":"jquery","value":"jquery","is_correct":false}]',
     NULL, 3, 2),
  (3, 2, 'What method is used to define a GET route in Express?', 'text',
     NULL, 'app.get()', 2, 1),
  (4, 4, 'What command creates a new React app?', 'radio',
     '[{"label":"npm create react","value":"a","is_correct":false},{"label":"npx create-react-app myapp","value":"b","is_correct":true},{"label":"node new-react","value":"c","is_correct":false}]',
     NULL, 2, 1)
ON DUPLICATE KEY UPDATE question = VALUES(question);

-- ============================================================
-- SYLLABUSES
-- ============================================================
INSERT INTO syllabuses (id, course_id, title, description) VALUES
  (1, 1, 'Node.js Backend Syllabus', 'Complete curriculum for Node.js backend development.'),
  (2, 2, 'React.js Syllabus',        'Step-by-step React learning path.')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- SYLLABUS_OUTLINES
-- ============================================================
INSERT INTO syllabus_outlines (id, syllabus_id, title, description, image, order_index) VALUES
  (1, 1, 'Week 1: Node.js Fundamentals', 'Core concepts, modules, and async programming.',     NULL, 1),
  (2, 1, 'Week 2: Express & REST APIs',  'Building REST APIs with Express and middleware.',     NULL, 2),
  (3, 1, 'Week 3: MySQL Integration',    'Database design, raw SQL, and data modeling.',        NULL, 3),
  (4, 2, 'Week 1: React Basics',         'Components, JSX, props, and state management.',       NULL, 1),
  (5, 2, 'Week 2: Hooks & Effects',      'useState, useEffect, and custom hooks deep-dive.',    NULL, 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- INVOICES
-- ============================================================
INSERT INTO invoices (id, user_id, course_id, subtotal, service_fee, vat, total, status, payment_method, transaction_ref, paid_at) VALUES
  (1, 2, 1, 49.99, 2.50, 7.50, 59.99, 'paid', 'credit_card', 'TXN-001-ABC', '2025-01-10 10:00:00'),
  (2, 3, 1, 49.99, 2.50, 7.50, 59.99, 'paid', 'paypal',      'TXN-002-DEF', '2025-01-15 14:30:00'),
  (3, 5, 2, 39.99, 2.00, 6.00, 47.99, 'paid', 'credit_card', 'TXN-003-GHI', '2025-02-01 09:00:00'),
  (4, 2, 2, 39.99, 2.00, 6.00, 47.99, 'paid', 'paypal',      'TXN-004-JKL', '2025-02-05 11:00:00')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
INSERT INTO enrollments (id, user_id, course_id, invoice_id, enrolled_at, completed_at) VALUES
  (1, 2, 1, 1, '2025-01-10 10:01:00', NULL),
  (2, 3, 1, 2, '2025-01-15 14:31:00', '2025-03-01 00:00:00'),
  (3, 5, 2, 3, '2025-02-01 09:01:00', NULL),
  (4, 2, 2, 4, '2025-02-05 11:01:00', NULL)
ON DUPLICATE KEY UPDATE enrolled_at = VALUES(enrolled_at);

-- ============================================================
-- USER_PROGRESS
-- ============================================================
INSERT INTO user_progress (id, user_id, chapter_id, course_id, completed, completed_at) VALUES
  (1, 2, 1, 1, 1, '2025-01-12 10:00:00'),
  (2, 2, 2, 1, 1, '2025-01-14 10:00:00'),
  (3, 2, 3, 1, 0, NULL),
  (4, 3, 1, 1, 1, '2025-01-16 09:00:00'),
  (5, 3, 2, 1, 1, '2025-01-20 09:00:00'),
  (6, 3, 3, 1, 1, '2025-02-01 09:00:00')
ON DUPLICATE KEY UPDATE completed = VALUES(completed);

-- ============================================================
-- EXERCISE_ATTEMPTS
-- ============================================================
INSERT INTO exercise_attempts (id, user_id, exercise_id, answer, is_correct, score, attempted_at) VALUES
  (1, 2, 1, 'b', 1, 2.00, '2025-01-12 10:30:00'),
  (2, 2, 2, 'fs,http', 1, 3.00, '2025-01-12 10:35:00'),
  (3, 3, 1, 'a', 0, 0.00, '2025-01-16 09:30:00'),
  (4, 3, 2, 'fs,http', 1, 3.00, '2025-01-16 09:35:00')
ON DUPLICATE KEY UPDATE answer = VALUES(answer);

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (id, user_id, course_id, rating, comment) VALUES
  (1, 2, 1, 5, 'Excellent course! Very detailed and practical.'),
  (2, 3, 1, 4, 'Great content. Could use more real-world projects.'),
  (3, 5, 2, 5, 'Perfect for beginners. Highly recommended!'),
  (4, 2, 2, 4, 'Good introduction to React. Well structured.')
ON DUPLICATE KEY UPDATE rating = VALUES(rating);
