-- ============================================================
-- E-Learning Platform - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS elearning_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE elearning_db;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150)        NOT NULL,
  email        VARCHAR(191)        NOT NULL UNIQUE,
  password     VARCHAR(255)        NOT NULL,
  role         ENUM('student','instructor','admin') NOT NULL DEFAULT 'student',
  avatar       VARCHAR(500)        NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role  (role)
) ENGINE=InnoDB;

-- ============================================================
-- 2. COURSES (soft delete)
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  instructor_id  INT UNSIGNED        NOT NULL,
  title          VARCHAR(255)        NOT NULL,
  description    TEXT                NULL,
  thumbnail      VARCHAR(500)        NULL,
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  price          DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  category       VARCHAR(100)        NULL,
  level          ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  language       VARCHAR(50)         NOT NULL DEFAULT 'English',
  created_at     DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME            NULL,
  CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_courses_instructor (instructor_id),
  INDEX idx_courses_status     (status),
  INDEX idx_courses_deleted    (deleted_at)
) ENGINE=InnoDB;

-- ============================================================
-- 3. CHAPTERS (soft delete)
-- ============================================================
CREATE TABLE IF NOT EXISTS chapters (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id    INT UNSIGNED        NOT NULL,
  title        VARCHAR(255)        NOT NULL,
  description  TEXT                NULL,
  thumbnail    VARCHAR(500)        NULL,
  video_url    VARCHAR(500)        NULL,
  duration     INT                 NULL COMMENT 'Duration in minutes',
  order_index  INT                 NOT NULL DEFAULT 0,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at   DATETIME            NULL,
  CONSTRAINT fk_chapters_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_chapters_course  (course_id),
  INDEX idx_chapters_deleted (deleted_at),
  INDEX idx_chapters_order   (course_id, order_index)
) ENGINE=InnoDB;

-- ============================================================
-- 4. EXERCISES (options as JSON)
-- ============================================================
CREATE TABLE IF NOT EXISTS exercises (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chapter_id   INT UNSIGNED        NOT NULL,
  question     TEXT                NOT NULL,
  type         ENUM('checkbox','radio','text') NOT NULL DEFAULT 'radio',
  options      JSON                NULL COMMENT 'Array of {label, value, is_correct}',
  correct_answer TEXT              NULL COMMENT 'For text type exercises',
  points       INT                 NOT NULL DEFAULT 1,
  order_index  INT                 NOT NULL DEFAULT 0,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_exercises_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  INDEX idx_exercises_chapter (chapter_id)
) ENGINE=InnoDB;

-- ============================================================
-- 5. SYLLABUSES
-- ============================================================
CREATE TABLE IF NOT EXISTS syllabuses (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id    INT UNSIGNED        NOT NULL,
  title        VARCHAR(255)        NOT NULL,
  description  TEXT                NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_syllabuses_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_syllabuses_course (course_id)
) ENGINE=InnoDB;

-- ============================================================
-- 6. SYLLABUS_OUTLINES
-- ============================================================
CREATE TABLE IF NOT EXISTS syllabus_outlines (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  syllabus_id  INT UNSIGNED        NOT NULL,
  title        VARCHAR(255)        NOT NULL,
  description  TEXT                NULL,
  image        VARCHAR(500)        NULL,
  order_index  INT                 NOT NULL DEFAULT 0,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_outlines_syllabus FOREIGN KEY (syllabus_id) REFERENCES syllabuses(id) ON DELETE CASCADE,
  INDEX idx_outlines_syllabus (syllabus_id)
) ENGINE=InnoDB;

-- ============================================================
-- 7. INVOICES / PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED        NOT NULL,
  course_id       INT UNSIGNED        NOT NULL,
  subtotal        DECIMAL(10,2)       NOT NULL,
  service_fee     DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  vat             DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  total           DECIMAL(10,2)       NOT NULL,
  status          ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  payment_method  VARCHAR(50)         NULL,
  transaction_ref VARCHAR(255)        NULL,
  paid_at         DATETIME            NULL,
  created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_invoices_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_invoices_user   (user_id),
  INDEX idx_invoices_course (course_id),
  INDEX idx_invoices_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- 8. ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  course_id    INT UNSIGNED        NOT NULL,
  invoice_id   INT UNSIGNED        NULL,
  enrolled_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME            NULL,
  CONSTRAINT fk_enrollments_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
  UNIQUE KEY uq_enrollment (user_id, course_id),
  INDEX idx_enrollments_user   (user_id),
  INDEX idx_enrollments_course (course_id)
) ENGINE=InnoDB;

-- ============================================================
-- 9. USER_PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  chapter_id   INT UNSIGNED        NOT NULL,
  course_id    INT UNSIGNED        NOT NULL,
  completed    TINYINT(1)          NOT NULL DEFAULT 0,
  completed_at DATETIME            NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_progress_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_progress_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_course  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
  UNIQUE KEY uq_progress (user_id, chapter_id),
  INDEX idx_progress_user   (user_id),
  INDEX idx_progress_course (course_id)
) ENGINE=InnoDB;

-- ============================================================
-- 10. EXERCISE_ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS exercise_attempts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  exercise_id  INT UNSIGNED        NOT NULL,
  answer       TEXT                NULL,
  is_correct   TINYINT(1)          NULL,
  score        DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
  attempted_at DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attempts_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_attempts_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id)  ON DELETE CASCADE,
  INDEX idx_attempts_user     (user_id),
  INDEX idx_attempts_exercise (exercise_id)
) ENGINE=InnoDB;

-- ============================================================
-- 11. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED        NOT NULL,
  course_id    INT UNSIGNED        NOT NULL,
  rating       TINYINT UNSIGNED    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT                NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_reviews_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_review (user_id, course_id),
  INDEX idx_reviews_course (course_id),
  INDEX idx_reviews_rating (rating)
) ENGINE=InnoDB;
