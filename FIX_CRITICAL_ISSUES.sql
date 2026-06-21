-- M&H EYEWEAR CRITICAL FIXES
-- Run these in Supabase SQL Editor to fix user feedback issues

-- ==========================================
-- ISSUE #2: Fix Eye Exam Price Mismatch
-- Current: ₦25,000 online (wrong)
-- Should be: ₦20,000 (actual store price)
-- ==========================================

-- First, check current prices
SELECT id, name, price, item_type, created_at
FROM products
WHERE item_type = 'services'
  AND (name ILIKE '%exam%' OR name ILIKE '%comprehensive%')
ORDER BY created_at DESC
LIMIT 10;

-- Update eye exam prices
UPDATE products
SET price = 20000
WHERE item_type = 'services'
  AND name ILIKE '%Comprehensive%Exam%';

-- Verify the update
SELECT id, name, price, item_type
FROM products
WHERE item_type = 'services'
  AND name ILIKE '%exam%'
ORDER BY name;

-- ==========================================
-- ISSUE #1: Diagnose Empty Categories
-- Check what products we actually have
-- ==========================================

SELECT
  CASE
    WHEN item_type = 'frames' AND is_prescription_compatible != false THEN 'Eyeglasses (Rx)'
    WHEN item_type = 'frames' AND is_prescription_compatible = false THEN 'Sunglasses'
    WHEN item_type = 'accessories' THEN 'Accessories'
    WHEN item_type = 'services' THEN 'Services'
    ELSE 'Other'
  END as category,
  COUNT(*) as product_count,
  COUNT(DISTINCT sku) as unique_skus
FROM products
WHERE is_active = true
GROUP BY category
ORDER BY product_count DESC;

-- Check specifically for sunglasses
SELECT COUNT(*) as sunglasses_count
FROM products
WHERE is_active = true
  AND item_type = 'frames'
  AND is_prescription_compatible = false;

-- Check for accessories
SELECT COUNT(*) as accessories_count
FROM products
WHERE is_active = true
  AND item_type = 'accessories';

-- If sunglasses/accessories are 0, we need to add products
-- Show all products by type to understand distribution
SELECT
  item_type,
  is_prescription_compatible,
  COUNT(*) as count
FROM products
WHERE is_active = true
GROUP BY item_type, is_prescription_compatible
ORDER BY item_type, is_prescription_compatible;

-- ==========================================
-- Issue Summary Dashboard
-- ==========================================

-- How many products have images?
SELECT
  COUNT(*) as total_products,
  COUNT(CASE WHEN primary_image_url IS NOT NULL THEN 1 END) as with_images,
  COUNT(CASE WHEN primary_image_url IS NULL THEN 1 END) as missing_images
FROM products
WHERE is_active = true;

-- Price distribution
SELECT
  'Sunglasses' as type,
  MIN(price) as min_price,
  MAX(price) as max_price,
  ROUND(AVG(price)) as avg_price,
  COUNT(*) as count
FROM products
WHERE is_active = true AND item_type = 'frames' AND is_prescription_compatible = false
UNION ALL
SELECT
  'Eyeglasses' as type,
  MIN(price) as min_price,
  MAX(price) as max_price,
  ROUND(AVG(price)) as avg_price,
  COUNT(*) as count
FROM products
WHERE is_active = true AND item_type = 'frames' AND is_prescription_compatible != false
UNION ALL
SELECT
  'Services' as type,
  MIN(price) as min_price,
  MAX(price) as max_price,
  ROUND(AVG(price)) as avg_price,
  COUNT(*) as count
FROM products
WHERE is_active = true AND item_type = 'services'
ORDER BY type;
