-- ════════════════════════════════════════════════════════════════════════════
-- FRAME ATTRIBUTES POPULATION — CORRECTED FOR ACTUAL SCHEMA
-- ════════════════════════════════════════════════════════════════════════════
--
-- This script populates frame_attributes using the ACTUAL schema:
-- - Separate front_color and temple_color
-- - Prescription fields (PD, sphere, progressive compatible)
-- - Enhanced attributes (size_label, best_for_faces, best_for_occasions, AR overlay, clip-on)
--
-- Step 1: Populate with existing products data
-- Step 2: Import CSV to fill in missing details (colors, prescription, enhanced data)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO frame_attributes (
  product_id,
  model_code,
  frame_shape,
  frame_material,
  front_color,
  temple_color,
  lens_width,
  bridge_size,
  total_width,
  lens_height,
  temple_length,
  pd_range_min,
  pd_range_max,
  rx_sph_min,
  rx_sph_max,
  progressive_compatible,
  has_clip_on,
  size_label,
  best_for_faces,
  best_for_occasions,
  ar_overlay_url,
  created_at
)
SELECT
  p.id,

  -- MODEL_CODE: Extract from SKU (e.g., "MH-573" → "573")
  COALESCE(
    SUBSTRING(p.sku, 4),  -- Take everything after "MH-"
    p.sku
  ) as model_code,

  -- FRAME_SHAPE: Extract from product name or use placeholder
  CASE
    WHEN p.name ILIKE '%round%' THEN 'round'
    WHEN p.name ILIKE '%cat-eye%' OR p.name ILIKE '%cat eye%' THEN 'cat-eye'
    WHEN p.name ILIKE '%aviator%' THEN 'aviator'
    WHEN p.name ILIKE '%wayfarer%' THEN 'wayfarer'
    WHEN p.name ILIKE '%oval%' THEN 'oval'
    WHEN p.name ILIKE '%rectangular%' OR p.name ILIKE '%rect%' THEN 'rectangular'
    ELSE 'unclassified'  -- To be verified later
  END as frame_shape,

  -- FRAME_MATERIAL: Use existing material field
  COALESCE(
    NULLIF(p.material, ''),
    'unknown'  -- To be filled from CSV
  ) as frame_material,

  -- FRONT_COLOR: Use product color field
  COALESCE(
    NULLIF(p.color, ''),
    CASE
      WHEN p.name ILIKE '%black%' THEN 'black'
      WHEN p.name ILIKE '%havana%' OR p.name ILIKE '%tortoise%' THEN 'havana'
      WHEN p.name ILIKE '%gold%' THEN 'gold'
      WHEN p.name ILIKE '%silver%' THEN 'silver'
      WHEN p.name ILIKE '%clear%' THEN 'clear'
      WHEN p.name ILIKE '%brown%' THEN 'brown'
      ELSE NULL  -- To be filled from CSV
    END
  ) as front_color,

  -- TEMPLE_COLOR: Usually same as front for single-color frames, NULL if unknown
  NULL as temple_color,  -- To be filled from CSV with research data

  -- LENS_WIDTH: Convert from "54mm" to numeric integer
  CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS INTEGER) as lens_width,

  -- BRIDGE_SIZE: Convert from "17mm" to numeric integer
  CAST(REGEXP_REPLACE(p.bridge_size, '[^0-9]', '', 'g') AS INTEGER) as bridge_size,

  -- TOTAL_WIDTH: Calculate from lens_width + bridge_size + average ear bridge (~25mm)
  (CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS INTEGER) +
   CAST(REGEXP_REPLACE(p.bridge_size, '[^0-9]', '', 'g') AS INTEGER) + 25) as total_width,

  -- LENS_HEIGHT: Estimate based on frame_width and shape
  CASE
    WHEN p.name ILIKE '%round%' THEN
      CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS INTEGER)  -- Round: height = width
    WHEN p.name ILIKE '%cat-eye%' OR p.name ILIKE '%cat eye%' THEN
      CAST((CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS INTEGER) * 0.80)::NUMERIC AS INTEGER)  -- Cat-eye: 80% of width
    ELSE
      CAST((CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS INTEGER) * 0.75)::NUMERIC AS INTEGER)  -- Default: 75% of width
  END as lens_height,

  -- TEMPLE_LENGTH: Convert from "140mm" to numeric integer
  CAST(REGEXP_REPLACE(p.temple_length, '[^0-9]', '', 'g') AS INTEGER) as temple_length,

  -- PD_RANGE_MIN: Minimum pupillary distance (standard: 55mm for most)
  55 as pd_range_min,  -- To be verified/updated from CSV

  -- PD_RANGE_MAX: Maximum pupillary distance (standard: 74mm for most)
  74 as pd_range_max,  -- To be verified/updated from CSV

  -- RX_SPH_MIN: Minimum sphere prescription (standard: -6.00)
  -6.00::NUMERIC as rx_sph_min,  -- To be verified/updated from CSV

  -- RX_SPH_MAX: Maximum sphere prescription (standard: +6.00)
  6.00::NUMERIC as rx_sph_max,  -- To be verified/updated from CSV

  -- PROGRESSIVE_COMPATIBLE: Most frames are compatible, verify from CSV
  CASE
    WHEN p.name ILIKE '%progressive%' THEN true
    WHEN p.is_prescription_compatible = true THEN true
    ELSE NULL  -- To be verified from CSV
  END as progressive_compatible,

  -- HAS_CLIP_ON: Usually false unless specified, verify from CSV
  false as has_clip_on,  -- To be verified from CSV

  -- SIZE_LABEL: Categorize by total width
  CASE
    WHEN (CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS INTEGER) +
          CAST(REGEXP_REPLACE(p.bridge_size, '[^0-9]', '', 'g') AS INTEGER) + 25) < 130 THEN 'small'
    WHEN (CAST(REGEXP_REPLACE(p.frame_width, '[^0-9]', '', 'g') AS INTEGER) +
          CAST(REGEXP_REPLACE(p.bridge_size, '[^0-9]', '', 'g') AS INTEGER) + 25) BETWEEN 130 AND 150 THEN 'medium'
    ELSE 'large'
  END as size_label,

  -- BEST_FOR_FACES: To be filled from CSV research
  NULL as best_for_faces,

  -- BEST_FOR_OCCASIONS: To be filled from CSV research
  NULL as best_for_occasions,

  -- AR_OVERLAY_URL: Reference to AR try-on image (if exists)
  NULL as ar_overlay_url,

  NOW() as created_at

FROM products p
LEFT JOIN frame_attributes fa ON p.id = fa.product_id
WHERE p.item_type = 'frames'
  AND p.is_active = true
  AND fa.id IS NULL  -- Only insert for products without frame_attributes
ORDER BY p.brand, p.name;

-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICATION: Check population results
-- ════════════════════════════════════════════════════════════════════════════

SELECT
  'Frame Attributes Population Report' as report,
  COUNT(*) as total_created,
  COUNT(DISTINCT product_id) as unique_products,
  COUNT(CASE WHEN lens_width > 0 THEN 1 END) as with_measurements,
  COUNT(CASE WHEN frame_shape != 'unclassified' THEN 1 END) as with_shape,
  COUNT(CASE WHEN frame_material != 'unknown' THEN 1 END) as with_material,
  COUNT(CASE WHEN front_color IS NOT NULL THEN 1 END) as with_front_color,
  COUNT(CASE WHEN temple_color IS NOT NULL THEN 1 END) as with_temple_color,
  COUNT(CASE WHEN progressive_compatible IS NOT NULL THEN 1 END) as with_progressive_info
FROM frame_attributes
WHERE product_id IN (SELECT id FROM products WHERE item_type = 'frames' AND is_active = true);

-- ════════════════════════════════════════════════════════════════════════════
-- SAMPLE: Show 15 populated records
-- ════════════════════════════════════════════════════════════════════════════

SELECT
  p.sku,
  p.brand,
  fa.model_code,
  fa.frame_shape,
  fa.frame_material,
  fa.front_color,
  fa.lens_width || 'mm' as lens_width,
  fa.bridge_size || 'mm' as bridge_size,
  fa.total_width || 'mm' as total_width,
  fa.temple_length || 'mm' as temple_length,
  fa.size_label,
  fa.progressive_compatible,
  fa.has_clip_on
FROM frame_attributes fa
JOIN products p ON fa.product_id = p.id
WHERE p.item_type = 'frames' AND p.is_active = true
LIMIT 15;

-- ════════════════════════════════════════════════════════════════════════════
-- NOTES FOR CSV IMPORT (When you find your research data)
-- ════════════════════════════════════════════════════════════════════════════
--
-- Your CSV should have these columns to enhance the data:
-- - sku (must match products.sku exactly)
-- - frame_shape (round, rectangular, cat-eye, aviator, oval, wayfarer)
-- - frame_material (acetate, metal, titanium, mixed, etc.)
-- - front_color (primary frame color)
-- - temple_color (optional, if different from front)
-- - best_for_faces (oval, round, square, heart, oblong, diamond, etc.)
-- - best_for_occasions (casual, formal, sport, fashion, professional, etc.)
-- - pd_range_min (minimum pupillary distance, e.g., 55)
-- - pd_range_max (maximum pupillary distance, e.g., 74)
-- - size_label (small, medium, large)
-- - progressive_compatible (true/false)
-- - has_clip_on (true/false)
--
-- Example CSV row:
-- MH-573,rectangular,metal,black,black,square,formal,55,74,medium,true,false
--
-- ════════════════════════════════════════════════════════════════════════════
