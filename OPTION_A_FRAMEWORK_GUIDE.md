# Option A: Fast Framework for All Product Types

**Goal:** Create reusable infrastructure for accurate product attribute data across frames, accessories, and lenses.

---

## 🎯 What Option A Does

```
Step 1: Run SQL to populate frame_attributes from products table (3 min)
Step 2: Map existing data fields (measurements, brand, SKU, etc.)
Step 3: Estimate missing data (frame_shape, lens_height)
Step 4: Import CSV research data later to fill in accurate details
Step 5: Repeat framework for accessories and lenses
Result: 162 frames populated + framework for future products
```

---

## 📋 **3 Files You Now Have**

| File | Purpose |
|------|---------|
| `POPULATE_FRAME_ATTRIBUTES_OPTION_A.sql` | SQL script to populate frame_attributes |
| `FRAME_ATTRIBUTES_IMPORT_TEMPLATE.csv` | CSV template for your research data |
| `OPTION_A_FRAMEWORK_GUIDE.md` | This guide (framework documentation) |

---

## 🚀 **Execute Option A Now**

### **Step 1: Run the SQL (2 minutes)**

**Go to:** Supabase → SQL Editor → Create new query

**Copy entire content of:** `POPULATE_FRAME_ATTRIBUTES_OPTION_A.sql`

**Paste it all and click RUN**

**Expected output:**
```
Frame Attributes Population Report
- total_attributes: 162
- unique_products: 162
- with_measurements: 162
- with_shape: ~120 (rest are "unclassified")
- with_material: ~50
- with_color: ~40
```

---

### **Step 2: Verify the Data**

**Run this quick check:**

```sql
SELECT COUNT(*) as total_frame_attributes
FROM frame_attributes
WHERE product_id IN (
  SELECT id FROM products 
  WHERE item_type = 'frames' AND is_active = true
);
```

**Should return:** `162`

---

### **Step 3: Test Image Generation** (Optional now, do after CSV import)

Once frame_attributes is populated, the Supabase function should work:
1. Go to Admin Dashboard → Manage Product Images
2. Select 1-2 products
3. Click "Generate AI Images"
4. Check logs for success

---

## 📊 **Step 4: Import Your CSV Research Data (When Ready)**

Once you find your CSV file with the research you already did:

### **Option A1: Manual CSV Import**

1. Supabase → Table Editor → `frame_attributes`
2. Click **"Import data"**
3. Select your CSV file
4. Map columns (sku → match to product via sku lookup)
5. Import

### **Option A2: Smart SQL Import** (Recommended)

1. Create a temporary table:
```sql
CREATE TEMP TABLE temp_frame_research (
  sku TEXT,
  model_code TEXT,
  frame_shape TEXT,
  frame_material TEXT,
  color TEXT,
  notes TEXT
);
```

2. Import your CSV into the temp table via Supabase

3. Update frame_attributes with accurate data:
```sql
UPDATE frame_attributes fa
SET 
  model_code = COALESCE(tr.model_code, fa.model_code),
  frame_shape = COALESCE(tr.frame_shape, fa.frame_shape),
  frame_material = COALESCE(tr.frame_material, fa.frame_material),
  color = COALESCE(tr.color, fa.color),
  notes = COALESCE(tr.notes, fa.notes),
  updated_at = NOW()
FROM temp_frame_research tr
JOIN products p ON p.sku = tr.sku
WHERE fa.product_id = p.id;
```

---

## 🏗️ **Framework for Future Products**

This structure works for **all product types**:

### **For Frames (Current)**
```
frame_attributes (product_id, model_code, frame_shape, frame_material, color, lens_width, bridge_size, total_width, lens_height, temple_length)
```

### **For Accessories (Next)**
```
accessories_attributes (product_id, accessory_type, material, color, size, compatibility, notes)

accessory_type values: case, cloth, strap, chain, cleaner, repair-kit, stand, etc.
```

### **For Lenses (Next)**
```
lens_attributes (product_id, lens_type, material, coating, uv_protection, prescription_range, notes)

lens_type values: optical, contact-lens, solution, cleanser, etc.
```

---

## 📝 **CSV Format for Your Research Data**

When you find your CSV, format it like this:

```csv
sku,model_code,frame_shape,frame_material,color,notes
MH-253,TH1891,rectangular,acetate,dark-blue,Premium Tommy Hilfiger frame
MH-104,B1376,rectangular,acetate,havana,Burberry prescription frame
MH-320,B4406-U,oval,mixed-metal,black,Burberry sunglasses with UV
```

**Columns explanation:**
- `sku` — Product SKU (must match products.sku exactly)
- `model_code` — Brand model number (e.g., "RB3025", "VPR09Z")
- `frame_shape` — Shape type: round, rectangular, cat-eye, aviator, oval, wayfarer, etc.
- `frame_material` — Material: acetate, metal, titanium, mixed, etc.
- `color` — Frame color: black, havana, gold, silver, clear, tortoise, etc.
- `notes` — Any additional details (optional)

---

## ✅ **Timeline**

| Step | Time | Action |
|------|------|--------|
| 1 | 2 min | Run SQL script in Supabase |
| 2 | 1 min | Verify 162 records created |
| 3 | 5 min | Find your CSV research file |
| 4 | 5 min | Format CSV to match template |
| 5 | 5 min | Import CSV to frame_attributes |
| 6 | 2 min | Test image generation |
| **Total** | **20 min** | Complete infrastructure ready! |

---

## 🎓 **What Happens After Option A**

Once frame_attributes is populated:

✅ Image generation function finds products + their attributes
✅ Accurate product descriptions are generated
✅ Images are created with correct frame details
✅ Framework is ready for accessories and lenses
✅ Future CSV imports update data without script rewrites

---

## 🚀 **Start Now**

1. **Copy** the SQL from `POPULATE_FRAME_ATTRIBUTES_OPTION_A.sql`
2. **Paste** into Supabase SQL Editor
3. **Run** it
4. **Report** the results
5. **Find** your CSV research file
6. **Import** it using the CSV template

**Then we'll test image generation!**

---

## 💬 **Questions?**

- **CSV format unclear?** → See `FRAME_ATTRIBUTES_IMPORT_TEMPLATE.csv`
- **SQL won't run?** → Check table exists: `SELECT * FROM frame_attributes LIMIT 1;`
- **Need help finding CSV?** → Tell me where you saved your research data
- **Ready to test images?** → Let me know when CSV is imported

Let's go! 🎯
