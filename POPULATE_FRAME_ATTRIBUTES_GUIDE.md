# Frame Attributes Population Guide

**Goal:** Populate `frame_attributes` for all 162 products so image generation works with accurate product data.

---

## 📋 What is frame_attributes?

The `frame_attributes` table stores detailed measurements and characteristics for eyewear frames. The image generation function uses this data to create accurate product descriptions and spec diagrams.

**Required fields:**
- `product_id` (UUID) — links to products table
- `model_code` (text) — brand model number (e.g., "RB3025", "VPR09Z")
- `frame_shape` (text) — shape type (round, rectangular, cat-eye, aviator, etc.)
- `frame_material` (text) — material (acetate, metal, titanium, mixed, etc.)
- `color` (text) — frame color (black, gold, tortoise, clear, etc.)
- `lens_width` (numeric) — lens width in mm
- `bridge_size` (numeric) — bridge width in mm
- `total_width` (numeric) — total frame width in mm
- `lens_height` (numeric) — lens height in mm
- `temple_length` (numeric) — temple arm length in mm

**Optional fields:**
- `reference_image_url` (text) — link to reference photo
- `notes` (text) — additional notes

---

## ✅ Step 1: Check Current Frame_Attributes Schema

**Go to:** Supabase → Table Editor → `frame_attributes`

**Click:** Definition tab

**Check:**
- ✅ Columns exist: product_id, model_code, frame_shape, frame_material, color, lens_width, bridge_size, total_width, lens_height, temple_length
- ✅ Data types are correct (uuid, text, numeric)
- ✅ Foreign key constraint: product_id → products.id

**If columns are missing**, you'll need to add them. Show me the Definition and I'll create a migration.

---

## 📊 Step 2: Understand Your Products Data

First, let's see what information is already in the products table:

**Run this query in Supabase SQL Editor:**

```sql
SELECT 
  id,
  sku,
  name,
  brand,
  style,
  color,
  frame_shape,
  frame_material,
  gender,
  item_type
FROM products
WHERE item_type = 'frames'
  AND is_active = true
ORDER BY brand, name
LIMIT 20;
```

**Report back:**
- What columns have data?
- What columns are NULL?
- What's the format of the data (e.g., color: "black", "tortoise", "clear")?

---

## 🔧 Step 3: Populate frame_attributes (Method A: Smart SQL)

Once we know what data exists in products, we'll create a smart INSERT that:

1. Extracts frame information from products table
2. Generates reasonable estimates for measurements (if not available)
3. Creates frame_attributes records for each product

**Template SQL** (we'll customize based on your data):

```sql
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
  temple_length
)
SELECT
  p.id,
  COALESCE(p.model_code, SUBSTR(p.sku, 1, 10)) as model_code,
  COALESCE(p.frame_shape, 'rectangular') as frame_shape,
  COALESCE(p.frame_material, 'acetate') as frame_material,
  COALESCE(p.color, 'black') as color,
  -- Estimated measurements based on frame shape (you can customize these)
  CASE
    WHEN p.frame_shape = 'round' THEN 48
    WHEN p.frame_shape = 'cat-eye' THEN 50
    WHEN p.frame_shape = 'aviator' THEN 55
    ELSE 52
  END as lens_width,
  CASE
    WHEN p.frame_shape = 'round' THEN 20
    WHEN p.frame_shape = 'cat-eye' THEN 20
    WHEN p.frame_shape = 'aviator' THEN 21
    ELSE 18
  END as bridge_size,
  CASE
    WHEN p.frame_shape = 'round' THEN 140
    WHEN p.frame_shape = 'cat-eye' THEN 145
    WHEN p.frame_shape = 'aviator' THEN 150
    ELSE 145
  END as total_width,
  CASE
    WHEN p.frame_shape = 'round' THEN 48
    WHEN p.frame_shape = 'cat-eye' THEN 42
    WHEN p.frame_shape = 'aviator' THEN 38
    ELSE 40
  END as lens_height,
  CASE
    WHEN p.frame_shape = 'round' THEN 130
    WHEN p.frame_shape = 'cat-eye' THEN 135
    WHEN p.frame_shape = 'aviator' THEN 145
    ELSE 140
  END as temple_length
FROM products p
LEFT JOIN frame_attributes fa ON p.id = fa.product_id
WHERE p.item_type = 'frames'
  AND p.is_active = true
  AND fa.id IS NULL  -- Only insert for products without frame_attributes
ORDER BY p.brand, p.name;
```

---

## 🎯 Step 4: Populate frame_attributes (Method B: Manual with SKU Parser)

If you have a CSV with actual measurements, we can import them:

**Create a CSV file** `frame_attributes_import.csv`:

```csv
sku,model_code,frame_shape,frame_material,color,lens_width,bridge_size,total_width,lens_height,temple_length
MH-253,TH1891,rectangular,acetate,dark-blue,52,18,145,40,140
MH-320,B4406-U,oval,mixed,black,50,20,140,38,138
MH-104,B1376,rectangular,acetate,havana,54,17,145,42,140
```

Then import via:
- Supabase Dashboard → Table Editor → frame_attributes
- Click **"Import data"**
- Select your CSV
- Map columns

---

## 📝 Step 5: Verify Population

**After inserting, run this to verify:**

```sql
SELECT 
  COUNT(*) as total_frame_attributes,
  COUNT(DISTINCT product_id) as products_with_attributes,
  COUNT(CASE WHEN lens_width IS NOT NULL THEN 1 END) as with_measurements,
  COUNT(CASE WHEN frame_shape IS NOT NULL THEN 1 END) as with_shape,
  COUNT(CASE WHEN color IS NOT NULL THEN 1 END) as with_color
FROM frame_attributes;
```

**Expected result:**
```
total_frame_attributes: 162
products_with_attributes: 162
with_measurements: 162
with_shape: 162
with_color: 162
```

---

## 🚀 Step 6: Test Image Generation Again

Once frame_attributes is populated:

1. Go to Admin Dashboard → Manage Product Images
2. Select 1-2 products
3. Click "Generate AI Images"
4. Check Supabase logs for success

**Expected behavior:**
- ✅ Processed: 1
- ✅ Succeeded: 1
- ✅ Failed: 0
- ✅ Images generated with accurate product descriptions

---

## 🎓 What Happens Next

With frame_attributes populated, the image generation function will:

1. ✅ Find the product AND its frame attributes
2. ✅ Build accurate product descriptions (brand + model + color + material + shape)
3. ✅ Generate 5 lifestyle/studio shots
4. ✅ Create accurate spec diagrams using measurements
5. ✅ Upload all images to Supabase storage
6. ✅ Save image URLs to products table

---

## 📋 Action Plan

**Do this now:**

1. Check the `frame_attributes` Definition tab
   - Screenshot the column list
   - Verify all columns exist

2. Run the LIMIT 20 query above
   - Screenshot the results
   - Tell me what data is available in products table

3. Tell me:
   - Do you have actual measurements for any products?
   - Should we use estimated measurements or can you provide real ones?
   - Do you have a CSV with frame data?

Then I'll provide the exact SQL to populate everything correctly!

---

## 💡 Pro Tips

- **For luxury brands** (Ray-Ban, Gucci, etc.): Look up actual measurements from manufacturer specs
- **For house brands** (Macruona, M&H): Use industry standard sizes (52-18-145 is very common)
- **For sunglasses**: Same measurement ranges as eyeglasses
- **Batch operations**: Populate all 162 at once using SQL INSERT SELECT (1 minute)

Let's get this done right! 🎯
