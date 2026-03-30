-- ============================================================
-- E-Learning Platform - Database Migrations
-- Adds new fields and tables for advanced features
-- ============================================================

USE elearning_db;

-- ============================================================
-- 1. ALTER courses TABLE
-- ============================================================
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255) NULL AFTER title;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS intro_message TEXT NULL AFTER description;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_weeks INT NULL AFTER intro_message;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS required_hours_per_week INT NULL AFTER duration_weeks;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS education_level VARCHAR(100) NULL AFTER required_hours_per_week;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_audience TEXT NULL AFTER education_level;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS objectives TEXT NULL AFTER target_audience;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500) NULL AFTER thumbnail;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS attachments JSON NULL AFTER thumbnail_url;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS review_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER attachments;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10,2) NULL DEFAULT 0.00 AFTER price;

-- ============================================================
-- 2. ALTER chapters TABLE
-- ============================================================
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255) NULL AFTER title;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS intro_message TEXT NULL AFTER description;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS week_number INT NULL AFTER intro_message;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS attachments JSON NULL AFTER week_number;

-- ============================================================
-- 3. ALTER exercises TABLE
-- ============================================================
-- These fields already exist in schema, but ensure they're there
ALTER TABLE exercises MODIFY COLUMN correct_answer TEXT NULL COMMENT 'For text type exercises';
ALTER TABLE exercises MODIFY COLUMN points INT NOT NULL DEFAULT 1;

-- ============================================================
-- 4. ALTER invoices TABLE
-- ============================================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0.00 AFTER total;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100) NULL AFTER discount;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(255) NULL AFTER coupon_code;
-- service_fee and vat already exist

-- ============================================================
-- 5. CREATE coupons TABLE (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code              VARCHAR(100)        NOT NULL UNIQUE,
  discount_percentage INT                 NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
  is_active         TINYINT(1)          NOT NULL DEFAULT 1,
  expires_at        DATETIME            NULL,
  created_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupons_code (code),
  INDEX idx_coupons_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- 6. REDESIGN syllabuses TABLE
-- Drop foreign key if exists to make standalone
-- ============================================================
ALTER TABLE syllabuses DROP FOREIGN KEY IF EXISTS fk_syllabuses_course;
ALTER TABLE syllabuses DROP COLUMN IF EXISTS course_id;
ALTER TABLE syllabuses ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL AFTER title;
ALTER TABLE syllabuses ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10,2) DEFAULT 0.00 AFTER category;
ALTER TABLE syllabuses ADD COLUMN IF NOT EXISTS education_level VARCHAR(100) NULL AFTER subscription_price;
ALTER TABLE syllabuses ADD COLUMN IF NOT EXISTS target_audience TEXT NULL AFTER education_level;
ALTER TABLE syllabuses ADD COLUMN IF NOT EXISTS objectives TEXT NULL AFTER target_audience;
ALTER TABLE syllabuses ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'draft' AFTER objectives;

-- ============================================================
-- 7. UPDATE syllabus_outlines TABLE
-- ============================================================
-- Rename image to thumbnail if image exists, otherwise just add thumbnail
ALTER TABLE syllabus_outlines ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500) NULL AFTER order_index;
-- Drop the old image column if it exists (safe to do if already migrated)
ALTER TABLE syllabus_outlines DROP COLUMN IF EXISTS image;
ALTER TABLE syllabus_outlines ADD COLUMN IF NOT EXISTS abstract TEXT NULL AFTER title;

-- ============================================================
-- 8. ADD follower tracking for reviews/rating
-- ============================================================
CREATE TABLE IF NOT EXISTS followers (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  follower_id  INT UNSIGNED        NOT NULL,
  following_id INT UNSIGNED        NOT NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_followers_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_followers_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_follow (follower_id, following_id),
  INDEX idx_followers_following (following_id)
) ENGINE=InnoDB;

-- ============================================================
-- 9. ADD course analytics table
-- ============================================================
CREATE TABLE IF NOT EXISTS course_analytics (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id       INT UNSIGNED        NOT NULL,
  total_students  INT                 NOT NULL DEFAULT 0,
  total_completed INT                 NOT NULL DEFAULT 0,
  average_rating  DECIMAL(2,1)        NOT NULL DEFAULT 0.0,
  total_profit    DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  updated_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_analytics_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_analytics_course (course_id)
) ENGINE=InnoDB;

-- ============================================================
-- 10. ALTER enrollments to track completion metrics
-- ============================================================
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS completion_percentage INT DEFAULT 0 AFTER completed_at;

COMMIT;
