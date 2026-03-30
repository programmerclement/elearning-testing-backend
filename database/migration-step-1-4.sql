-- ============================================================
-- Migration: Add Step 1-4 Course Builder Fields
-- ============================================================

USE elearning_db;

-- ============================================================
-- 1. UPDATE COURSES table - Add Step 1 fields
-- ============================================================
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS duration_weeks INT UNSIGNED NULL COMMENT 'Total duration in weeks',
ADD COLUMN IF NOT EXISTS required_hours_per_week INT UNSIGNED NULL COMMENT 'Required study hours per week',
ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10,2) NULL COMMENT 'Subscription-based pricing',
ADD COLUMN IF NOT EXISTS education_level VARCHAR(50) NULL COMMENT 'Education level (e.g., beginner, intermediate, advanced)',
ADD COLUMN IF NOT EXISTS target_audience TEXT NULL COMMENT 'Target student audience description',
ADD COLUMN IF NOT EXISTS objectives TEXT NULL COMMENT 'Course objectives and learning outcomes';

-- ============================================================
-- 2. UPDATE CHAPTERS table - Add Step 2 fields
-- ============================================================
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255) NULL COMMENT 'Chapter subtitle',
ADD COLUMN IF NOT EXISTS intro_message TEXT NULL COMMENT 'Introduction/Rules in rich text',
ADD COLUMN IF NOT EXISTS attachments JSON NULL COMMENT 'Array of attachment files',
ADD COLUMN IF NOT EXISTS week_number INT UNSIGNED NULL COMMENT 'Week number in course';

-- ============================================================
-- 3. INVOICES table - Ensure discount columns exist
-- ============================================================
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER vat,
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) NULL AFTER discount;

-- ============================================================
-- 4. Create FOLLOWERS table (if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS followers (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  follower_id  INT UNSIGNED        NOT NULL,
  following_id INT UNSIGNED        NOT NULL,
  created_at   DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_followers_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_followers_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_follow (follower_id, following_id),
  INDEX idx_followers_follower  (follower_id),
  INDEX idx_followers_following (following_id)
) ENGINE=InnoDB;

-- ============================================================
-- 5. Ensure proper indexes for performance
-- ============================================================
ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_courses_category (category);
ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_courses_education_level (education_level);
ALTER TABLE chapters ADD INDEX IF NOT EXISTS idx_chapters_week (week_number);
ALTER TABLE invoices ADD INDEX IF NOT EXISTS idx_invoices_coupon (coupon_code);

-- ============================================================
-- Information about what was changed:
-- ============================================================
-- COURSES table additions (Step 1):
--   - duration_weeks: Total weeks for the course
--   - required_hours_per_week: Study commitment
--   - subscription_price: Pricing model
--   - education_level: Target level
--   - target_audience: Who this course is for
--   - objectives: What students will learn

-- CHAPTERS table additions (Step 2):
--   - subtitle: Chapter subtitle
--   - intro_message: Rich text introduction
--   - attachments: JSON array of files
--   - week_number: Week mapping

-- INVOICES table additions (Step 3):
--   - discount: Applied discount amount
--   - coupon_code: Coupon code used

-- NEW FOLLOWERS table:
--   - For follow system

