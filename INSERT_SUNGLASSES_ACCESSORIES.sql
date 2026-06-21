-- M&H EYEWEAR: Add Sunglasses & Accessories Products
-- Run this in Supabase SQL Editor to populate missing categories

-- ==========================================
-- ADD SUNGLASSES (non-prescription frames)
-- ==========================================

INSERT INTO products (
  name,
  sku,
  item_type,
  is_prescription_compatible,
  price,
  brand,
  brand_line,
  is_active
) VALUES
-- Premium international brands
('Ray-Ban Wayfarer Classic', 'RB-WAY-001', 'frames', false, 45000, 'Ray-Ban', 'm_and_h_fashion', true),
('Ray-Ban Aviator Gold', 'RB-AVA-001', 'frames', false, 48000, 'Ray-Ban', 'm_and_h_fashion', true),
('Chloé Oversized Round', 'CHL-OVR-001', 'frames', false, 52000, 'Chloé', 'm_and_h_fashion', true),
('Gucci GG0001S Oversized', 'GUC-GG0-001', 'frames', false, 55000, 'Gucci', 'm_and_h_fashion', true),
('Tom Ford Leo TF1024', 'TOM-LEO-001', 'frames', false, 60000, 'Tom Ford', 'm_and_h_fashion', true),
-- Accessible sunglasses brands
('ASOS Oversized Flat Top', 'ASOS-FLT-001', 'frames', false, 22000, 'ASOS', 'm_and_h_fashion', true),
('Zara Wire Rim', 'ZAR-WIR-001', 'frames', false, 18000, 'Zara', 'm_and_h_fashion', true),
-- Local/Popular brands
('Monocles Aviator Classic', 'MON-AVI-001', 'frames', false, 35000, 'Monocles', 'm_and_h_fashion', true),
('Shade Theory Cat Eye', 'SHD-CAT-001', 'frames', false, 32000, 'Shade Theory', 'm_and_h_fashion', true),
('FCUK Sporty Black', 'FCK-SPT-001', 'frames', false, 28000, 'French Connection', 'm_and_h_fashion', true);

-- ==========================================
-- ADD ACCESSORIES
-- ==========================================

INSERT INTO products (
  name,
  sku,
  item_type,
  price,
  brand,
  brand_line,
  is_active
) VALUES
-- Cases & Storage
('Premium Leather Eyeglass Case - Black', 'ACC-CASE-001', 'accessories', 12000, 'M&H Premium', 'm_and_h_fashion', true),
('Soft Neoprene Case - Colorful', 'ACC-CASE-002', 'accessories', 8500, 'M&H', 'm_and_h_fashion', true),
('Hard Protective Case - Travel', 'ACC-CASE-003', 'accessories', 15000, 'M&H Premium', 'm_and_h_fashion', true),
-- Cleaning & Maintenance
('Microfiber Cleaning Cloth Bundle (3)', 'ACC-CLOTH-001', 'accessories', 3500, 'M&H', 'm_and_h_fashion', true),
('Professional Lens Cleaner (100ml)', 'ACC-CLEAN-001', 'accessories', 5000, 'M&H Pro', 'm_and_h_fashion', true),
('Eyeglass Repair Kit - Complete', 'ACC-REPAIR-001', 'accessories', 6500, 'M&H Tools', 'm_and_h_fashion', true),
-- Straps & Chains
('Eyeglass Strap - Colorful Beaded', 'ACC-STRAP-001', 'accessories', 7000, 'M&H', 'm_and_h_fashion', true),
('Eyeglass Chain - Gold Plated', 'ACC-CHAIN-001', 'accessories', 9500, 'M&H Premium', 'm_and_h_fashion', true),
('Sports Strap - Neoprene Black', 'ACC-SPORT-001', 'accessories', 5500, 'M&H Sport', 'm_and_h_fashion', true),
-- Solutions & Care
('Anti-Fog Lens Spray (50ml)', 'ACC-FOG-001', 'accessories', 4000, 'M&H', 'm_and_h_fashion', true),
('Blue Light Filter Spray', 'ACC-BLUE-001', 'accessories', 6000, 'M&H Pro', 'm_and_h_fashion', true),
('Protective Lens Coating - DIY', 'ACC-COAT-001', 'accessories', 8000, 'M&H Pro', 'm_and_h_fashion', true),
-- Extras
('Eyeglass Display Stand - Wood', 'ACC-STAND-001', 'accessories', 5500, 'M&H', 'm_and_h_fashion', true),
('Lens Tissue Box - Portable', 'ACC-TISSUE-001', 'accessories', 2500, 'M&H', 'm_and_h_fashion', true),
('Eyeglass Cleaning Station', 'ACC-STATION-001', 'accessories', 18000, 'M&H Premium', 'm_and_h_fashion', true);

-- ==========================================
-- VERIFY WHAT WAS ADDED
-- ==========================================

-- Check total products by category
SELECT
  CASE
    WHEN item_type = 'frames' AND is_prescription_compatible = false THEN 'Sunglasses'
    WHEN item_type = 'accessories' THEN 'Accessories'
    WHEN item_type = 'frames' AND is_prescription_compatible != false THEN 'Eyeglasses'
  END as category,
  COUNT(*) as total_products,
  MIN(price) as lowest_price,
  MAX(price) as highest_price,
  ROUND(AVG(price)) as avg_price
FROM products
WHERE is_active = true
GROUP BY category
ORDER BY category DESC;

-- List all new sunglasses
SELECT name, sku, price, brand
FROM products
WHERE item_type = 'frames'
  AND is_prescription_compatible = false
  AND brand IN ('Ray-Ban', 'Chloé', 'Gucci', 'Tom Ford', 'ASOS', 'Zara', 'Monocles', 'Shade Theory', 'French Connection')
ORDER BY price DESC;

-- List all new accessories
SELECT name, sku, price, brand
FROM products
WHERE item_type = 'accessories'
  AND brand LIKE '%M&H%'
ORDER BY price DESC;

-- Count: how many sunglasses do we have now?
SELECT COUNT(*) as total_sunglasses
FROM products
WHERE is_active = true
  AND item_type = 'frames'
  AND is_prescription_compatible = false;

-- Count: how many accessories do we have now?
SELECT COUNT(*) as total_accessories
FROM products
WHERE is_active = true
  AND item_type = 'accessories';
