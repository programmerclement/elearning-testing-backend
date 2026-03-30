-- ============================================================
-- E-Learning Platform - COMPREHENSIVE SEED DATA (Upgraded)
-- ============================================================

USE elearning_db;

-- ============================================================
-- USERS (Enhanced)
-- ============================================================
INSERT INTO users (id, name, email, password, role, avatar) VALUES
  (1, 'Alice Instructor', 'alice@elearn.com', '$2b$10$tZb4J7u8qW8qQ2L5mZx9P.vK3K8Y2m1N9o8P7q6r5s4t3', 'instructor', '/uploads/avatars/alice.jpg'),
  (2, 'Bob Student',      'bob@elearn.com',   '$2b$10$tZb4J7u8qW8qQ2L5mZx9P.vK3K8Y2m1N9o8P7q6r5s4t3', 'student',    '/uploads/avatars/bob.jpg'),
  (3, 'Carol Student',    'carol@elearn.com', '$2b$10$tZb4J7u8qW8qQ2L5mZx9P.vK3K8Y2m1N9o8P7q6r5s4t3', 'student',    NULL),
  (4, 'Dave Admin',       'dave@elearn.com',  '$2b$10$tZb4J7u8qW8qQ2L5mZx9P.vK3K8Y2m1N9o8P7q6r5s4t3', 'admin',      NULL),
  (5, 'Eve Student',      'eve@elearn.com',   '$2b$10$tZb4J7u8qW8qQ2L5mZx9P.vK3K8Y2m1N9o8P7q6r5s4t3', 'student',    NULL),
  (6, 'Frank Instructor', 'frank@elearn.com', '$2b$10$tZb4J7u8qW8qQ2L5mZx9P.vK3K8Y2m1N9o8P7q6r5s4t3', 'instructor', NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================================
-- COURSES (Enhanced with new fields)
-- ============================================================
INSERT INTO courses (
  id, instructor_id, title, subtitle, description, intro_message,
  thumbnail, thumbnail_url, price, subscription_price,
  duration_weeks, required_hours_per_week, education_level,
  target_audience, objectives, category, level, language, status,
  attachments, review_status
) VALUES
  (1, 1, 
   'Complete Node.js & Express Backend Development',
   'Master server-side JavaScript with production-ready patterns',
   'Master backend development with Node.js, Express, MySQL and REST APIs. Build scalable, secure production applications.',
   'Welcome! This comprehensive course covers everything you need to become a professional backend developer.',
   '/uploads/thumbnails/nodejs-course.jpg',
   'https://cdn.example.com/nodejs-thumb.jpg',
   49.99, 29.99,
   12, 8, 'Intermediate Professional',
   'Developers with JavaScript basics, career changers',
   '["Build RESTful APIs", "Master async/await patterns", "MySQL database design", "Authentication & authorization"]',
   'Web Development', 'intermediate', 'English', 'published',
   '["node-basics-guide.pdf", "project-starter-kit.zip"]',
   'approved'),

  (2, 1,
   'React.js for Beginners',
   'Start your journey with modern frontend development',
   'Learn React from scratch with hooks, state management and real projects.',
   'Welcome to React! Learn the most in-demand frontend library step by step.',
   '/uploads/thumbnails/reactjs-course.jpg',
   'https://cdn.example.com/react-thumb.jpg',
   39.99, 19.99,
   10, 6, 'Beginner Friendly',
   'Complete beginners, career changers',
   '["React fundamentals", "Hooks and state management", "Component composition", "Real-world projects"]',
   'Web Development', 'beginner', 'English', 'published',
   '["react-cheatsheet.pdf"]',
   'approved'),

  (3, 1,
   'Advanced MySQL & Database Design',
   'Expert-level database architecture and optimization',
   'Deep dive into MySQL, query optimization, indexing, and database design patterns.',
   'Advanced database concepts for professionals.',
   '/uploads/thumbnails/mysql-course.jpg',
   'https://cdn.example.com/mysql-thumb.jpg',
   59.99, 39.99,
   14, 10, 'Advanced Professional',
   'Backend developers, database administrators',
   '["Query optimization", "Indexing strategies", "Replication & backup", "Performance tuning"]',
   'Database', 'advanced', 'English', 'draft',
   NULL,
   'pending'),

  (4, 6,
   'Python for Data Analysis',
   'Analyze and visualize data with Python',
   'Learn data analysis using Pandas, NumPy, and Matplotlib.',
   'Transform your data into insights with Python.',
   NULL,
   NULL,
   44.99, 24.99,
   11, 7, 'Intermediate',
   'Data enthusiasts, analysts',
   '["Pandas mastery", "NumPy operations", "Data visualization", "Statistical analysis"]',
   'Data Science', 'intermediate', 'English', 'published',
   '["data-science-toolkit.zip"]',
   'approved')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- CHAPTERS (Enhanced with new fields)
-- ============================================================
INSERT INTO chapters (
  id, course_id, title, subtitle, description, intro_message,
  week_number, duration, order_index, attachments, thumbnail, video_url
) VALUES
  (1, 1, 'Introduction to Node.js', 'Foundations and Setup',
   'History and ecosystem of Node.js. Setting up your development environment.',
   'In this chapter, you will learn the fundamentals of Node.js',
   1, 30, 1, '["setup-guide.pdf"]', '/uploads/chapters/ch1.jpg', NULL),

  (2, 1, 'Express Framework Basics', 'Web Server Fundamentals',
   'Routing, middleware, and request cycle.',
   'Understand how Express simplifies web server creation.',
   2, 45, 2, NULL, '/uploads/chapters/ch2.jpg', NULL),

  (3, 1, 'Connecting to MySQL', 'Database Integration',
   'Using mysql2 and raw SQL queries. Transaction handling.',
   'Learn to work with databases from your Node.js applications.',
   3, 60, 3, '["db-examples.sql"]', '/uploads/chapters/ch3.jpg', NULL),

  (4, 1, 'Authentication & Security', 'Building Secure APIs',
   'JWT tokens, password hashing, and API authentication.',
   'Master security best practices.',
   4, 50, 4, NULL, NULL, NULL),

  (5, 2, 'Setting up React', 'Project Initialization',
   'Create React App and project structure.',
   'Get your React development environment ready.',
   1, 25, 1, NULL, NULL, NULL),

  (6, 2, 'Components and JSX', 'Building with React',
   'Building UI with components. JSX syntax and best practices.',
   'Components are the heart of React.',
   2, 40, 2, NULL, NULL, NULL),

  (7, 2, 'Hooks Deep Dive', 'Modern React Patterns',
   'useState, useEffect, useContext, and custom hooks.',
   'Hooks let you use state and other React features without classes.',
   3, 55, 3, '["hooks-reference.md"]', NULL, NULL),

  (8, 3, 'Relational Database Basics', 'Data Design Fundamentals',
   'Tables, keys, normalization and schema design.',
   'Understand the foundation of relational databases.',
   1, 50, 1, NULL, NULL, NULL),

  (9, 3, 'Advanced Query Optimization', 'Performance at Scale',
   'Indexing, query analysis, and execution plans.',
   'Learn to write efficient, scalable queries.',
   2, 70, 2, '["optimization-techniques.pdf"]', NULL, NULL),

  (10, 4, 'Python Basics for Data Analysis', 'Getting Started',
   'Python syntax, libraries, and environment setup.',
   'Begin your data analysis journey.',
   1, 40, 1, NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- EXERCISES (Enhanced with correct_answer and points)
-- ============================================================
INSERT INTO exercises (
  id, chapter_id, question, type, options, correct_answer, points, order_index
) VALUES
  (1, 1, 'What is Node.js?', 'radio',
   '[{"label":"A browser","value":"a","is_correct":false},{"label":"A JavaScript runtime","value":"b","is_correct":true},{"label":"A database","value":"c","is_correct":false}]',
   NULL, 2, 1),

  (2, 1, 'Which of these are Node.js built-in modules?', 'checkbox',
   '[{"label":"fs","value":"fs","is_correct":true},{"label":"http","value":"http","is_correct":true},{"label":"jquery","value":"jquery","is_correct":false},{"label":"path","value":"path","is_correct":true}]',
   NULL, 5, 2),

  (3, 2, 'What method is used to define a GET route in Express?', 'text',
   NULL, 'app.get()', 3, 1),

  (4, 2, 'What is middleware in Express?', 'radio',
   '[{"label":"A database layer","value":"a","is_correct":false},{"label":"Functions that process requests","value":"b","is_correct":true},{"label":"A template engine","value":"c","is_correct":false}]',
   NULL, 2, 2),

  (5, 4, 'Why use JWT for authentication?', 'checkbox',
   '[{"label":"Stateless authentication","value":"a","is_correct":true},{"label":"Can be used across domains","value":"b","is_correct":true},{"label":"Stores all data on server","value":"c","is_correct":false}]',
   NULL, 4, 1),

  (6, 5, 'What command creates a new React app?', 'radio',
   '[{"label":"npm create react","value":"a","is_correct":false},{"label":"npx create-react-app myapp","value":"b","is_correct":true},{"label":"node new-react","value":"c","is_correct":false}]',
   NULL, 2, 1),

  (7, 6, 'What does JSX stand for?', 'text',
   NULL, 'JavaScript XML', 2, 1),

  (8, 6, 'Which is the correct way to pass props to a component?', 'radio',
   '[{"label":"<Component prop=value />","value":"a","is_correct":true},{"label":"<Component prop: value />","value":"b","is_correct":false},{"label":"<Component [prop]=value />","value":"c","is_correct":false}]',
   NULL, 2, 2),

  (9, 7, 'useState returns...', 'radio',
   '[{"label":"A single value","value":"a","is_correct":false},{"label":"An array with state and setState function","value":"b","is_correct":true},{"label":"A promise","value":"c","is_correct":false}]',
   NULL, 3, 1),

  (10, 8, 'What does normalization achieve?', 'checkbox',
   '[{"label":"Reduces data redundancy","value":"a","is_correct":true},{"label":"Improves data integrity","value":"b","is_correct":true},{"label":"Increases storage space","value":"c","is_correct":false}]',
   NULL, 4, 1)
ON DUPLICATE KEY UPDATE question = VALUES(question);

-- ============================================================
-- COUPONS (NEW TABLE)
-- ============================================================
INSERT INTO coupons (id, code, discount_percentage, is_active, expires_at) VALUES
  (1, 'SAVE10', 10, 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
  (2, 'EARLY20', 20, 1, DATE_ADD(NOW(), INTERVAL 7 DAY)),
  (3, 'EXPIRED50', 50, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (4, 'WELCOME15', 15, 1, DATE_ADD(NOW(), INTERVAL 90 DAY)),
  (5, 'SUMMER30', 30, 1, DATE_ADD(NOW(), INTERVAL 60 DAY))
ON DUPLICATE KEY UPDATE code = VALUES(code);

-- ============================================================
-- STANDALONE SYLLABUSES (NEW - No course dependency)
-- ============================================================
INSERT INTO syllabuses (
  id, title, description, category, subscription_price,
  education_level, target_audience, objectives, status
) VALUES
  (1, 'Complete Full-Stack Development Bootcamp', 
   'Master frontend, backend, and database development.',
   'Web Development', 199.99,
   'Intermediate Professional',
   'Career changers, intermediate developers',
   '["Full-stack fundamentals", "Modern web technologies", "Deployment & DevOps"]',
   'published'),

  (2, 'Data Science Specialization',
   'Comprehensive data science curriculum for professionals.',
   'Data Science', 249.99,
   'Advanced Professional',
   'Analysts, researchers, data professionals',
   '["Statistical analysis", "Machine learning", "Data visualization", "Big data"]',
   'published'),

  (3, 'Cloud Architecture Mastery',
   'Learn to design scalable cloud systems.',
   'Cloud & DevOps', 299.99,
   'Advanced Professional',
   'Infrastructure engineers, architects',
   '["AWS/Azure fundamentals", "Microservices", "Containerization", "CI/CD"]',
   'draft')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- SYLLABUS_OUTLINES (Enhanced)
-- ============================================================
INSERT INTO syllabus_outlines (
  id, syllabus_id, title, description, abstract, thumbnail, order_index
) VALUES
  (1, 1, 'Foundation: Core Web Concepts',
   'Comprehensive overview of modern web development fundamentals.',
   'Learn HTML, CSS, JavaScript, and web standards.',
   NULL, 1),

  (2, 1, 'Backend Mastery: APIs and Databases',
   'Build robust backend systems with Node.js and databases.',
   'Master server-side development.',
   NULL, 2),

  (3, 1, 'Frontend Frameworks: React & Beyond',
   'Modern frontend development with React and state management.',
   'Create interactive user interfaces.',
   NULL, 3),

  (4, 1, 'Deployment & Production',
   'Deploy applications to production environments.',
   'Master DevOps and continuous deployment.',
   NULL, 4),

  (5, 2, 'Statistical Foundations',
   'Essential statistics for data science.',
   'Probability, distributions, hypothesis testing.',
   NULL, 1),

  (6, 2, 'Machine Learning Algorithms',
   'Supervised and unsupervised learning techniques.',
   'Build predictive models.',
   NULL, 2),

  (7, 3, 'Cloud Platform Fundamentals',
   'AWS and Azure core services.',
   'Compute, storage, networking essentials.',
   NULL, 1),

  (8, 3, 'Advanced Microservices',
   'Microservice architecture and patterns.',
   'Design distributed systems.',
   NULL, 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- INVOICES (Enhanced with discount and coupon fields)
-- ============================================================
INSERT INTO invoices (
  id, user_id, course_id, subtotal, service_fee, vat, discount,
  coupon_code, total, transaction_reference, status, payment_method, paid_at
) VALUES
  (1, 2, 1, 49.99, 2.50, 7.74, 0, NULL, 59.99, 'TXN-20250110-12345', 'paid', 'credit_card', '2025-01-10 10:00:00'),
  (2, 3, 1, 49.99, 2.50, 7.74, 5.00, 'SAVE10', 54.99, 'TXN-20250115-23456', 'paid', 'paypal', '2025-01-15 14:30:00'),
  (3, 5, 2, 39.99, 2.00, 6.15, 0, NULL, 47.99, 'TXN-20250201-34567', 'paid', 'credit_card', '2025-02-01 09:00:00'),
  (4, 2, 2, 39.99, 2.00, 6.15, 8.00, 'WELCOME15', 39.99, 'TXN-20250205-45678', 'paid', 'paypal', '2025-02-05 11:00:00'),
  (5, 6, 3, 59.99, 3.00, 9.35, 12.00, 'EARLY20', 59.99, 'TXN-20250210-56789', 'paid', 'credit_card', '2025-02-10 15:00:00')
ON DUPLICATE KEY UPDATE subtotal = VALUES(subtotal);

-- ============================================================
-- ENROLLMENTS (Enhanced with completion percentage)
-- ============================================================
INSERT INTO enrollments (
  id, user_id, course_id, invoice_id, enrolled_at, completed_at, completion_percentage
) VALUES
  (1, 2, 1, 1, '2025-01-10 10:01:00', NULL, 75),
  (2, 3, 1, 2, '2025-01-15 14:31:00', '2025-03-01 00:00:00', 100),
  (3, 5, 2, 3, '2025-02-01 09:01:00', NULL, 45),
  (4, 2, 2, 4, '2025-02-05 11:01:00', NULL, 90),
  (5, 6, 3, 5, '2025-02-10 15:01:00', NULL, 30)
ON DUPLICATE KEY UPDATE completion_percentage = VALUES(completion_percentage);

-- ============================================================
-- FOLLOWERS (NEW TABLE)
-- ============================================================
INSERT INTO followers (id, follower_id, following_id, created_at) VALUES
  (1, 2, 1, NOW()),
  (2, 3, 1, NOW()),
  (3, 5, 1, NOW()),
  (4, 2, 6, NOW()),
  (5, 3, 6, NOW())
ON DUPLICATE KEY UPDATE created_at = VALUES(created_at);

-- ============================================================
-- USER_PROGRESS
-- ============================================================
INSERT INTO user_progress (
  id, user_id, chapter_id, course_id, completed, completed_at, created_at, updated_at
) VALUES
  (1, 2, 1, 1, 1, '2025-01-12 10:00:00', NOW(), NOW()),
  (2, 2, 2, 1, 1, '2025-01-14 10:00:00', NOW(), NOW()),
  (3, 2, 3, 1, 0, NULL, NOW(), NOW()),
  (4, 2, 4, 1, 0, NULL, NOW(), NOW()),
  (5, 3, 1, 1, 1, '2025-01-16 09:00:00', NOW(), NOW()),
  (6, 3, 2, 1, 1, '2025-01-20 09:00:00', NOW(), NOW()),
  (7, 3, 3, 1, 1, '2025-02-01 09:00:00', NOW(), NOW()),
  (8, 3, 4, 1, 1, '2025-02-10 09:00:00', NOW(), NOW()),
  (9, 5, 5, 2, 1, '2025-02-03 10:00:00', NOW(), NOW()),
  (10, 5, 6, 2, 0, NULL, NOW(), NOW()),
  (11, 6, 8, 3, 1, '2025-02-12 14:00:00', NOW(), NOW()),
  (12, 6, 9, 3, 0, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE completed = VALUES(completed);

-- ============================================================
-- EXERCISE_ATTEMPTS
-- ============================================================
INSERT INTO exercise_attempts (
  id, user_id, exercise_id, answer, is_correct, score, attempted_at
) VALUES
  (1, 2, 1, 'b', 1, 2.00, '2025-01-12 10:30:00'),
  (2, 2, 2, 'fs,http,path', 1, 5.00, '2025-01-12 10:35:00'),
  (3, 2, 3, 'app.get()', 1, 3.00, '2025-01-14 14:00:00'),
  (4, 3, 1, 'a', 0, 0.00, '2025-01-16 09:30:00'),
  (5, 3, 2, 'fs,http', 1, 5.00, '2025-01-16 09:35:00'),
  (6, 3, 3, 'app.get()', 1, 3.00, '2025-01-20 10:00:00'),
  (7, 3, 4, 'b', 1, 2.00, '2025-01-20 10:05:00'),
  (8, 5, 6, 'b', 1, 2.00, '2025-02-03 11:00:00'),
  (9, 5, 7, 'JavaScript XML', 1, 2.00, '2025-02-05 11:00:00'),
  (10, 6, 10, 'a,b', 1, 4.00, '2025-02-12 14:30:00')
ON DUPLICATE KEY UPDATE answer = VALUES(answer);

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (id, user_id, course_id, rating, comment, created_at) VALUES
  (1, 2, 1, 5, 'Excellent course! Very detailed and practical. Loved the real-world examples.', NOW()),
  (2, 3, 1, 5, 'Outstanding! Completed all chapters and already implementing concepts at work.', NOW()),
  (3, 5, 2, 4, 'Great introduction to React. Could use more advanced examples.', NOW()),
  (4, 2, 2, 5, 'Perfect for beginners. Well structured and easy to follow.', NOW()),
  (5, 6, 3, 5, 'Professional content. This course elevated my database design skills significantly.', NOW())
ON DUPLICATE KEY UPDATE rating = VALUES(rating);

-- ============================================================
-- COURSE_ANALYTICS (NEW TABLE)
-- ============================================================
INSERT INTO course_analytics (
  id, course_id, total_students, total_completed, average_rating, total_profit, updated_at
) VALUES
  (1, 1, 3, 1, 4.7, 164.97, NOW()),
  (2, 2, 2, 0, 4.5, 95.98, NOW()),
  (3, 3, 1, 0, 5.0, 59.99, NOW()),
  (4, 4, 0, 0, 0.0, 0.00, NOW())
ON DUPLICATE KEY UPDATE total_students = VALUES(total_students);

COMMIT;
