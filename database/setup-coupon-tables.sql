-- ============================================================
-- E-LEARNING DATABASE SETUP
-- Quick Setup for Coupon Tables
-- ============================================================

-- Make sure database exists
CREATE DATABASE IF NOT EXISTS elearning_db;
USE elearning_db;

-- ============================================================
-- 1. USERS TABLE (if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. COUPONS TABLE
-- ============================================================
DROP TABLE IF EXISTS coupon_usage;  -- Drop dependent table first

DROP TABLE IF EXISTS coupons;

CREATE TABLE coupons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage DECIMAL(5,2) NOT NULL COMMENT 'Discount percentage (0-100)',
  max_uses INT UNSIGNED NULL COMMENT 'NULL = unlimited',
  max_uses_per_user INT UNSIGNED NOT NULL DEFAULT 1,
  expires_at DATETIME NULL COMMENT 'NULL = no expiration',
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupons_code (code),
  INDEX idx_coupons_active (is_active),
  INDEX idx_coupons_expiry (expires_at)
) ENGINE=InnoDB;

-- ============================================================
-- 3. COUPON_USAGE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  order_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_coupon_usage_coupon (coupon_id),
  INDEX idx_coupon_usage_user (user_id),
  INDEX idx_coupon_usage_order (order_id)
) ENGINE=InnoDB;

-- ============================================================
-- 4. INSERT SAMPLE COUPONS
-- ============================================================
INSERT INTO coupons (code, discount_percentage, is_active, expires_at, max_uses) VALUES
  ('SAVE10', 10, 1, DATE_ADD(NOW(), INTERVAL 30 DAY), NULL),
  ('EARLY20', 20, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), NULL),
  ('WELCOME15', 15, 1, DATE_ADD(NOW(), INTERVAL 90 DAY), NULL),
  ('SUMMER30', 30, 1, DATE_ADD(NOW(), INTERVAL 60 DAY), NULL),
  ('VIPO5', 5, 1, DATE_ADD(NOW(), INTERVAL 120 DAY), 100),
  ('EXPIRED', 50, 0, DATE_SUB(NOW(), INTERVAL 1 DAY), NULL),
  ('LIMITED', 25, 1, DATE_ADD(NOW(), INTERVAL 14 DAY), 5)
ON DUPLICATE KEY UPDATE 
  discount_percentage = VALUES(discount_percentage),
  is_active = VALUES(is_active),
  expires_at = VALUES(expires_at);

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Check tables created
SELECT 'VERIFICATION' as '====';
SELECT 'Coupons Table:' as '';
SHOW CREATE TABLE coupons\G

SELECT 'Coupon Usage Table:' as '';
SHOW CREATE TABLE coupon_usage\G

SELECT 'Sample Coupons:' as '';
SELECT id, code, discount_percentage, is_active, expires_at FROM coupons;

-- ============================================================
-- ✓ Setup Complete!
-- ============================================================
