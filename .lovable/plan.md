

# Plan: Enhanced Product Structure with Image Support

## Overview
This plan addresses product image management and CSV bulk upload improvements. Since CSV files cannot contain images directly, we'll implement a two-phase workflow: (1) upload product data via CSV, then (2) attach images individually or in bulk through the admin interface.

---

## Phase 1: Storage Setup for Product Images

### 1.1 Create Storage Bucket
Create a `product-images` storage bucket with public access for serving images on the storefront.

```sql
-- Create bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Allow authenticated admin users to upload
CREATE POLICY "Admin users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow public read access
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Allow admin users to delete images
CREATE POLICY "Admin users can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');
```

---

## Phase 2: Product Edit Dialog with Image Upload

### 2.1 Create EditProductDialog Component
A new dialog for editing existing products, including image management.

**File:** `src/components/admin/products/EditProductDialog.tsx`

**Features:**
- All fields from CreateProductDialog (editable)
- Primary image upload with preview
- Additional images upload (up to 4 images)
- Drag-and-drop image support
- Image deletion capability
- Image reordering

### 2.2 Create ProductImageUpload Component
Reusable image upload component for product images.

**File:** `src/components/admin/products/ProductImageUpload.tsx`

**Features:**
- Single/multiple image upload modes
- Preview thumbnails
- Progress indicator during upload
- Delete button on each image
- Accepts JPG, PNG, WebP formats
- Max file size validation (5MB per image)

---

## Phase 3: Enhanced Bulk Upload Workflow

### 3.1 Improve CSV Template
Expand the CSV template to include more fields:

```csv
name,sku,brand_line,price,cost_price,description,item_type,color,material,style,gender,frame_width,bridge_size,temple_length,category_slug,reorder_level,reorder_quantity,lead_time_days
```

### 3.2 Add Category Matching
Parse `category_slug` from CSV and match to existing categories.

### 3.3 Create Bulk Image Upload Dialog
After CSV import, allow bulk image assignment via SKU matching.

**File:** `src/components/admin/products/BulkImageUploadDialog.tsx`

**Workflow:**
1. Display list of products without images
2. Allow drag-drop of images named by SKU (e.g., `MH-RND-001.jpg`)
3. Auto-match image filenames to product SKUs
4. Preview matches before upload
5. Batch upload all matched images

---

## Phase 4: Update Products Page UI

### 4.1 Add Edit Action
Wire up the "Edit" dropdown action to open EditProductDialog.

### 4.2 Add Image Column Indicator
Show thumbnail or icon indicating whether product has images.

### 4.3 Add "Upload Images" Button
New button next to "Bulk Upload" for the bulk image upload workflow.

---

## Phase 5: Create Image Upload Hook

**File:** `src/hooks/admin/useProductImageUpload.ts`

```typescript
// Functions provided:
- uploadProductImage(productId: string, file: File, isPrimary: boolean)
- uploadMultipleImages(productId: string, files: File[])
- deleteProductImage(imageUrl: string)
- getImagePublicUrl(path: string)
```

---

## Implementation Order

| Step | Description | Priority |
|------|-------------|----------|
| 1 | Create storage bucket with RLS policies | High |
| 2 | Build useProductImageUpload hook | High |
| 3 | Build ProductImageUpload component | High |
| 4 | Build EditProductDialog with image support | High |
| 5 | Wire Edit action in Products page | High |
| 6 | Enhance CSV template with more fields | Medium |
| 7 | Build BulkImageUploadDialog | Medium |
| 8 | Add image status indicator to product table | Low |

---

## Technical Details

### Image Storage Path Convention
```
product-images/{product_id}/main.{ext}
product-images/{product_id}/additional-{index}.{ext}
```

### Database Updates on Image Upload
```typescript
// After uploading main image
await supabase
  .from('products')
  .update({ image_url: publicUrl })
  .eq('id', productId);

// After uploading additional images
await supabase
  .from('products')
  .update({ 
    additional_images: [...existingImages, newImageUrl] 
  })
  .eq('id', productId);
```

### CSV Enhanced Parser Changes
- Add parsing for: frame_width, bridge_size, temple_length, category_slug, reorder_level, reorder_quantity, lead_time_days
- Category slug lookup to get category_id
- Validation for dimension format (e.g., "140mm")

### Files to Create
1. `src/components/admin/products/EditProductDialog.tsx`
2. `src/components/admin/products/ProductImageUpload.tsx`
3. `src/components/admin/products/BulkImageUploadDialog.tsx`
4. `src/hooks/admin/useProductImageUpload.ts`

### Files to Modify
1. `src/pages/admin/Products.tsx` - Add edit dialog state, image upload button
2. `src/components/admin/products/BulkUploadDialog.tsx` - Enhanced CSV template
3. `src/hooks/admin/useAdminProducts.ts` - Add image-related mutations if needed

---

## User Workflow Summary

### Adding Products with Images (Manual)
1. Click "Add Product" → Fill form → Save
2. Click "Edit" on product row
3. Upload primary image and additional images
4. Save changes

### Adding Products with Images (Bulk)
1. Download enhanced CSV template
2. Fill in product data (no images in CSV)
3. Upload CSV → Products created without images
4. Click "Upload Images" button
5. Drag-drop images named by SKU
6. System auto-matches and uploads

