-- Find and identify sunglasses in existing products

-- 1. Show all products with their names to identify sunglasses
SELECT
  id,
  sku,
  name,
  brand,
  price,
  is_prescription_compatible,
  item_type
FROM products
WHERE is_active = true
  AND item_type = 'frames'
ORDER BY brand, name;

-- 2. Try to identify sunglasses by name patterns
SELECT
  id,
  sku,
  name,
  brand,
  price
FROM products
WHERE is_active = true
  AND item_type = 'frames'
  AND (
    name ILIKE '%sunglasses%'
    OR name ILIKE '%sun%'
    OR name ILIKE '%non-prescription%'
    OR name ILIKE '%non prescription%'
  )
ORDER BY brand, name;

-- 3. Show products that might be non-prescription (if the field is populated)
SELECT
  id,
  sku,
  name,
  brand,
  is_prescription_compatible,
  price
FROM products
WHERE is_active = true
  AND item_type = 'frames'
  AND is_prescription_compatible = false
ORDER BY brand, name;

-- 4. Get a count summary
SELECT
  'Total frames' as type,
  COUNT(*) as count
FROM products
WHERE is_active = true AND item_type = 'frames'
UNION ALL
SELECT
  'Prescription compatible frames' as type,
  COUNT(*) as count
FROM products
WHERE is_active = true AND item_type = 'frames' AND is_prescription_compatible != false
UNION ALL
SELECT
  'Non-prescription frames (potential sunglasses)' as type,
  COUNT(*) as count
FROM products
WHERE is_active = true AND item_type = 'frames' AND is_prescription_compatible = false;
