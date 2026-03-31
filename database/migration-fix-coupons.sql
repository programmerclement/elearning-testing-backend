-- Fix Coupons Table Schema to Match Application Code
-- This migrates from old schema (discount_value, is_deleted, expiry_date)
-- to new schema (discount_percentage, is_active, expires_at)

-- Check if old columns exist and drop them if new columns don't exist
SET @old_col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'coupons' AND COLUMN_NAME = 'discount_value');
SET @new_col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'coupons' AND COLUMN_NAME = 'discount_percentage');

-- Drop old coupons table and recreate with correct schema
DROP TABLE IF EXISTS coupon_usage;
DROP TABLE IF EXISTS coupons;

-- Create coupons table with correct schema
CREATE TABLE IF NOT EXISTS coupons (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code                  VARCHAR(50)         NOT NULL UNIQUE,
  discount_percentage   DECIMAL(5,2)        NOT NULL COMMENT 'Discount percentage (0-100)',
  max_uses              INT UNSIGNED        NULL COMMENT 'NULL = unlimited',
  max_uses_per_user     INT UNSIGNED        NOT NULL DEFAULT 1,
  expires_at            DATETIME            NULL COMMENT 'NULL = no expiration',
  description           TEXT                NULL,
  is_active             TINYINT(1)          NOT NULL DEFAULT 1,
  created_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupons_code    (code),
  INDEX idx_coupons_active  (is_active),
  INDEX idx_coupons_expiry  (expires_at)
) ENGINE=InnoDB;

-- Create coupon_usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id             INT UNSIGNED        NOT NULL,
  user_id               INT UNSIGNED        NOT NULL,
  order_id              INT UNSIGNED        NULL,
  created_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usage_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  INDEX idx_coupon_usage_coupon (coupon_id),
  INDEX idx_coupon_usage_user   (user_id),
  INDEX idx_coupon_usage_order  (order_id)
) ENGINE=InnoDB;

-- Insert sample coupons
INSERT INTO coupons (id, code, discount_percentage, is_active, expires_at, max_uses, created_at, updated_at) VALUES
  (1, 'SAVE10', 10, 1, DATE_ADD(NOW(), INTERVAL 30 DAY), NULL, NOW(), NOW()),
  (2, 'EARLY20', 20, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), NULL, NOW(), NOW()),
  (3, 'WELCOME15', 15, 1, DATE_ADD(NOW(), INTERVAL 90 DAY), NULL, NOW(), NOW()),
  (4, 'SUMMER30', 30, 1, DATE_ADD(NOW(), INTERVAL 60 DAY), NULL, NOW(), NOW()),
  (5, 'VIPO5', 5, 1, DATE_ADD(NOW(), INTERVAL 120 DAY), 100, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  discount_percentage = VALUES(discount_percentage),
  is_active = VALUES(is_active),
  expires_at = VALUES(expires_at);
