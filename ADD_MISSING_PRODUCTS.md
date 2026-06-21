# How to Add Sunglasses & Accessories to Inventory

Your database currently has:
- ✅ 162 Eyeglasses (frames with prescription compatibility)
- ❌ 0 Sunglasses (non-prescription frames)
- ❌ 0 Accessories (straps, cases, cleaners, etc.)

This guide shows how to add them.

---

## Option 1: Manual Entry in Supabase Dashboard

### Add Sunglasses

1. Go to **Supabase Dashboard** → Your project → **Table Editor**
2. Click on **products** table
3. Click **Insert row** (or **+ New row**)
4. Fill in:
   ```
   name: "Ray-Ban Wayfarer (Sunglasses)"
   sku: "RB-WAY-001"
   item_type: "frames"
   is_prescription_compatible: false  ← This makes it a sunglasses
   price: 45000
   brand: "Ray-Ban"
   brand_line: "m_and_h_fashion"
   is_active: true
   ```
5. Repeat for more sunglasses brands:
   - Chloé sunglasses
   - Gucci sunglasses
   - Tom Ford sunglasses
   - Local brands: Monocles, Shade Theory, etc.

### Add Accessories

1. Click **Insert row** again
2. Fill in:
   ```
   name: "Premium Eyeglass Case"
   sku: "ACC-CASE-001"
   item_type: "accessories"  ← Note: not "frames"
   price: 8500
   brand: "M&H"
   brand_line: "m_and_h_fashion"
   is_active: true
   ```
3. Examples of accessories to add:
   - Eyeglass cases (hard, soft)
   - Cleaning cloths
   - Straps/chains
   - Repair kits
   - Lens cleaner solution

---

## Option 2: Bulk Import via SQL

If you have a CSV or list, run this SQL template:

```sql
-- Add sunglasses
INSERT INTO products (
  name, sku, item_type, is_prescription_compatible, 
  price, brand, brand_line, is_active
) VALUES 
('Ray-Ban Wayfarer', 'RB-WAY-001', 'frames', false, 45000, 'Ray-Ban', 'm_and_h_fashion', true),
('Chloé Oversized', 'CHL-OVR-001', 'frames', false, 52000, 'Chloé', 'm_and_h_fashion', true),
('Gucci GG0001', 'GUC-GG0-001', 'frames', false, 55000, 'Gucci', 'm_and_h_fashion', true),
('Tom Ford Leo', 'TOM-LEO-001', 'frames', false, 60000, 'Tom Ford', 'm_and_h_fashion', true),
('Monocles Aviator', 'MON-AVI-001', 'frames', false, 35000, 'Monocles', 'm_and_h_fashion', true);

-- Add accessories
INSERT INTO products (
  name, sku, item_type, price, brand, brand_line, is_active
) VALUES
('Premium Eyeglass Case', 'ACC-CASE-001', 'accessories', 8500, 'M&H', 'm_and_h_fashion', true),
('Microfiber Cleaning Cloth', 'ACC-CLOTH-001', 'accessories', 2500, 'M&H', 'm_and_h_fashion', true),
('Eyeglass Strap (Colorful)', 'ACC-STRAP-001', 'accessories', 5000, 'M&H', 'm_and_h_fashion', true),
('Lens Cleaner Solution (100ml)', 'ACC-SOL-001', 'accessories', 3500, 'M&H', 'm_and_h_fashion', true),
('Eyeglass Repair Kit', 'ACC-REPAIR-001', 'accessories', 4500, 'M&H', 'm_and_h_fashion', true);
```

---

## Option 3: Bulk Upload via CSV File

1. Create a CSV file with this format:

```csv
name,sku,item_type,is_prescription_compatible,price,brand,brand_line,is_active
Ray-Ban Wayfarer,RB-WAY-001,frames,false,45000,Ray-Ban,m_and_h_fashion,true
Chloé Oversized,CHL-OVR-001,frames,false,52000,Chloé,m_and_h_fashion,true
Premium Eyeglass Case,ACC-CASE-001,accessories,,8500,M&H,m_and_h_fashion,true
```

2. Go to **Supabase Dashboard** → **products** table
3. Click **Import data** 
4. Select your CSV
5. Map the columns
6. Click **Import**

---

## Minimum Recommended Products

**Sunglasses** (at least 5 brands):
- Ray-Ban (classic)
- Chloé (luxury)
- Gucci (high-end)
- Tom Ford (premium)
- Monocles (local)

**Accessories** (at least 5 types):
- Hard eyeglass cases
- Cleaning cloths
- Straps/chains
- Lens cleaner
- Repair kits

---

## Verify Products Were Added

Run this query in Supabase SQL Editor:

```sql
SELECT
  CASE
    WHEN item_type = 'frames' AND is_prescription_compatible = false THEN 'Sunglasses'
    WHEN item_type = 'accessories' THEN 'Accessories'
    WHEN item_type = 'frames' AND is_prescription_compatible != false THEN 'Eyeglasses'
  END as category,
  COUNT(*) as product_count
FROM products
WHERE is_active = true
GROUP BY category
ORDER BY category;
```

Should show:
```
Accessories: 5
Eyeglasses: 162
Sunglasses: 5
```

---

## Update Shop Filter

Once products are added, the shop page filter should automatically show the new categories!

**If it doesn't, check:**
- File: `src/modules/storefront/components/Filters.tsx`
- Look for category logic
- Might need to clear browser cache or rebuild

---

## Images for Sunglasses

For better UX, add product images:

1. Get image URLs for each sunglasses/accessory
2. Update products table:
   ```sql
   UPDATE products
   SET primary_image_url = 'https://...' 
   WHERE sku = 'RB-WAY-001';
   ```

3. Or use the Supabase dashboard to upload images directly

---

## Timeline

- **Quick start** (30 min): Add 10 products manually via dashboard
- **Complete** (1-2 hrs): Add 20+ products with images via SQL or CSV

Let me know when you've added products and I'll verify the shop page shows them correctly!
