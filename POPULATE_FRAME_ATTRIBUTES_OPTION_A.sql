-- ════════════════════════════════════════════════════════════════════════════
-- FRAME ATTRIBUTES POPULATION — OPTION A (Fast, Reusable Framework)
-- ════════════════════════════════════════════════════════════════════════════
--
-- This script populates frame_attributes from existing products data.
-- It's designed as a FRAMEWORK that can be adapted for:
-- - Frames (current)
-- - Accessories (future)
-- - Lenses (future)
--
-- Step 1: Run this to create frame_attributes from products data
-- Step 2: Later, import CSV data to fill in missing details
-- Step 3: Use this as template for other product types
-- ════════════════════════════════════════════════════════════════════════════

-- BEFORE RUNNING: Make sure frame_attributes table exists with these columns:
-- - id (uuid, primary key)
-- - product_id (uuid, foreign key to products.id)
-- - model_code (text)
-- - frame_shape (text)
-- - frame_material (text)
-- - color (text)
-- - lens_width (numeric)
-- - bridge_size (numeric)
-- - total_width (numeric)
-- - lens_height (numeric)
-- - temple_length (numeric)
-- - notes (text, optional)
-- - created_at (timestamp)
-- - updated_at (timestamp)

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 1: Create frame_attributes records from products data
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO frame_attributes (
  product_id,
  model_code,
  frame_shape,
  frame_material,
  color,
  lens_width,
  bridge_size,
  total_width,
  lens_height,
  temple_length,
  notes,
  created_at,
  updated_at
)
SELECT
  p.id,
  -- MODEL_CODE: Extract from SKU (e.g., "MH-573" → "0164" from name or full SKU)
  COALESCE(
    SUBSTRING(p.sku, 4),  -- Take everything after "MH-"
    p.sku
  ) as model_code,

  -- FRAME_SHAPE: Extract from product name or use placeholder
  -- This will be filled in by frame-identifier-researcher skill later
  CASE
    WHEN p.name ILIKE '%round%' THEN 'round'
    WHEN p.name ILIKE '%cat-eye%' OR p.name ILIKE '%cat eye%' THEN 'cat-eye'
    WHEN p.name ILIKE '%aviator%' THEN 'aviator'
    WHEN p.name ILIKE '%wayfarer%' THEN 'wayfarer'
    WHEN p.name ILIKE '%oval%' THEN 'oval'
    WHEN p.name ILIKE '%rectangular%' OR p.name ILIKE '%rect%' THEN 'rectangular'
    ELSE 'unclassified'  -- To be filled later
  END as frame_shape,

  -- FRAME_MATERIAL: Use existing material field or placeholder
  COALESCE(
    NULLIF(p.material, ''),
    'unspecified'  -- To be filled later
  ) as frame_material,

  -- COLOR: Use existing color field or extract from name
  COALESCE(
    NULLIF(p.color, ''),
    CASE
      WHEN p.name ILIKE '%black%' THEN 'black'
      WHEN p.name ILIKE '%havana%' OR p.name ILIKE '%tortoise%' THEN 'havana'
      WHEN p.name ILIKE '%gold%' THEN 'gold'
      WHEN p.name ILIKE '%silver%' THEN 'silver'
      WHEN p.name ILIKE '%clear%' THEN 'clear'
      WHEN p.name ILIKE '%brown%' THEN 'brown'
      ELSE 'unspecified'  -- To be filled later
    END
  ) as color,

  -- LENS_WIDTH: Convert from "54mm" to numeric 54
  CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS NUMERIC) as lens_width,

  -- BRIDGE_SIZE: Convert from "17mm" to numeric 17
  CAST(REGEXP_REPLACE(p.bridge_size, '[^0-9]', '', 'g') AS NUMERIC) as bridge_size,

  -- TOTAL_WIDTH: Calculate from lens_width + bridge_size + (average temple start ~25mm)
  CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS NUMERIC) +
  CAST(REGEXP_REPLACE(p.bridge_size, '[^0-9]', '', 'g') AS NUMERIC) + 25 as total_width,

  -- LENS_HEIGHT: Estimate based on frame_width
  -- Standard ratio: lens_height ≈ lens_width * 0.75 (varies by shape)
  CASE
    WHEN p.name ILIKE '%round%' THEN
      CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS NUMERIC)  -- Round = height = width
    WHEN p.name ILIKE '%cat-eye%' OR p.name ILIKE '%cat eye%' THEN
      CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS NUMERIC) * 0.80  -- Cat-eye taller
    ELSE
      CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS NUMERIC) * 0.75  -- Default: 75% of width
  END as lens_height,

  -- TEMPLE_LENGTH: Convert from "140mm" to numeric 140
  CAST(REGEXP_REPLACE(p.temple_length, '[^0-9]', '', 'g') AS NUMERIC) as temple_length,

  -- NOTES: Track data source for auditing
  'Populated from products table. Frame shape, material, and color to be verified by frame-identifier-researcher.' as notes,

  NOW() as created_at,
  NOW() as updated_at

FROM products p
LEFT JOIN frame_attributes fa ON p.id = fa.product_id
WHERE p.item_type = 'frames'
  AND p.is_active = true
  AND fa.id IS NULL  -- Only insert for products without frame_attributes
ORDER BY p.brand, p.name;

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 2: Verify population was successful
-- ════════════════════════════════════════════════════════════════════════════

SELECT
  'Frame Attributes Population Report' as report_title,
  COUNT(*) as total_attributes,
  COUNT(DISTINCT product_id) as unique_products,
  COUNT(CASE WHEN lens_width > 0 THEN 1 END) as with_measurements,
  COUNT(CASE WHEN frame_shape != 'unclassified' THEN 1 END) as with_shape,
  COUNT(CASE WHEN frame_material != 'unspecified' THEN 1 END) as with_material,
  COUNT(CASE WHEN color != 'unspecified' THEN 1 END) as with_color
FROM frame_attributes
WHERE product_id IN (SELECT id FROM products WHERE item_type = 'frames' AND is_active = true);

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 3: Sample of populated data
-- ════════════════════════════════════════════════════════════════════════════

SELECT
  fa.product_id,
  p.sku,
  p.brand,
  fa.model_code,
  fa.frame_shape,
  fa.frame_material,
  fa.color,
  fa.lens_width || 'mm' as lens_width,
  fa.bridge_size || 'mm' as bridge_size,
  fa.total_width || 'mm' as total_width,
  fa.lens_height || 'mm' as lens_height,
  fa.temple_length || 'mm' as temple_length,
  fa.notes
FROM frame_attributes fa
JOIN products p ON fa.product_id = p.id
WHERE p.item_type = 'frames' AND p.is_active = true
LIMIT 20;

-- ════════════════════════════════════════════════════════════════════════════
-- FRAMEWORK: How to adapt this for other product types
-- ════════════════════════════════════════════════════════════════════════════
--
-- ACCESSORIES:
-- ┌─ Create accessories_attributes table with:
-- │  - product_id, accessory_type, material, color, size, compatibility, notes
-- │
-- └─ Template SQL:
--    INSERT INTO accessories_attributes (product_id, accessory_type, ...)
--    SELECT p.id, 'case' as accessory_type, ... FROM products p
--    WHERE p.item_type = 'accessories' AND p.is_active = true
--
-- LENSES:
-- ┌─ Create lens_attributes table with:
-- │  - product_id, lens_type, material, coating, uv_protection, prescription_range, notes
-- │
-- └─ Template SQL:
--    INSERT INTO lens_attributes (product_id, lens_type, ...)
--    SELECT p.id, 'optical' as lens_type, ... FROM products p
--    WHERE p.item_type = 'lenses' AND p.is_active = true
--
-- IMPORT WORKFLOW:
-- 1. Create CSV with columns: sku, model_code, frame_shape, frame_material, color, notes
-- 2. Import into temp_frame_attributes_import
-- 3. JOIN with products and UPDATE frame_attributes
-- 4. Example:
--    UPDATE frame_attributes fa
--    SET frame_shape = ti.frame_shape,
--        frame_material = ti.frame_material,
--        color = ti.color,
--        notes = ti.notes
--    FROM temp_frame_attributes_import ti
--    JOIN products p ON p.sku = ti.sku
--    WHERE fa.product_id = p.id
--    AND ti.frame_shape IS NOT NULL;
--
-- ════════════════════════════════════════════════════════════════════════════
