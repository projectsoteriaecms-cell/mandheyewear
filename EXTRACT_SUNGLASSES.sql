-- EXTRACT & SEPARATE SUNGLASSES FROM EYEGLASSES
-- Products with "SUN" in the name are actually sunglasses
-- We'll mark them as non-prescription (sunglasses)

-- ==========================================
-- STEP 1: IDENTIFY SUNGLASSES
-- (Preview which products will be separated)
-- ==========================================

SELECT
  id,
  sku,
  name,
  brand,
  price,
  is_prescription_compatible
FROM products
WHERE is_active = true
  AND item_type = 'frames'
  AND name ILIKE '%SUN%'
ORDER BY brand, name;

-- Count how many sunglasses we found
SELECT COUNT(*) as sunglasses_found
FROM products
WHERE is_active = true
  AND item_type = 'frames'
  AND name ILIKE '%SUN%';

-- ==========================================
-- STEP 2: SEPARATE THE SUNGLASSES
-- Mark all "SUN" products as non-prescription
-- ==========================================

UPDATE products
SET is_prescription_compatible = false
WHERE is_active = true
  AND item_type = 'frames'
  AND name ILIKE '%SUN%';

-- ==========================================
-- STEP 3: VERIFY THE SEPARATION WORKED
-- ==========================================

-- Check category distribution AFTER separation
SELECT
  CASE
    WHEN item_type = 'frames' AND is_prescription_compatible = false THEN 'Sunglasses'
    WHEN item_type = 'frames' AND is_prescription_compatible != false THEN 'Eyeglasses'
  END as category,
  COUNT(*) as product_count
FROM products
WHERE is_active = true AND item_type = 'frames'
GROUP BY category
ORDER BY category DESC;

-- List all separated sunglasses
SELECT
  sku,
  name,
  brand,
  price
FROM products
WHERE is_active = true
  AND item_type = 'frames'
  AND is_prescription_compatible = false
ORDER BY brand, name;

-- List remaining eyeglasses
SELECT COUNT(*) as remaining_eyeglasses
FROM products
WHERE is_active = true
  AND item_type = 'frames'
  AND is_prescription_compatible != false;
