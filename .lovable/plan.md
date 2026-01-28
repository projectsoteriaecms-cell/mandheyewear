
# Product Images Manager Page

## Overview

Create a dedicated admin page for managing product images with a visual grid interface showing all products and their image upload status. This page will provide quick inline upload capabilities, making it easy to see which products need images and upload them efficiently.

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| `useAdminProducts` hook | Exists - fetches all products with image data |
| `useProductImageUpload` hook | Exists - handles single/bulk image uploads |
| `ProductImageUpload` component | Exists - drag-and-drop for single product |
| `BulkImageUploadDialog` | Exists - SKU-based bulk upload |
| Product schema | Has `image_url` (primary) and `additional_images` (array) |

---

## Implementation Plan

### Phase 1: Create the Product Images Manager Page

**New File: `src/pages/admin/ProductImages.tsx`**

A dedicated page with:
- Visual grid layout showing product thumbnails
- Upload status indicators (has images / missing images)
- Quick filter options (all, with images, without images)
- Search by product name or SKU
- Inline upload via click or drag-and-drop on each product card

### Phase 2: Create Product Image Card Component

**New File: `src/components/admin/products/ProductImageCard.tsx`**

A reusable card component for each product:
- Shows product thumbnail or placeholder icon
- Displays product name and SKU
- Shows image count badge (e.g., "3/5 images")
- Hover state reveals upload button
- Direct drag-and-drop zone for quick upload
- Click to open detailed image management modal

### Phase 3: Create Quick Image Upload Modal

**New File: `src/components/admin/products/QuickImageUploadModal.tsx`**

A focused modal for single product image management:
- Large preview of current images
- Drag-and-drop zone for new images
- Ability to set primary image
- Delete individual images
- Reorder additional images

### Phase 4: Add Route and Navigation

**Modify: `src/routes/admin.routes.tsx`**
- Add route for `/admin/products/images`

**Modify: `src/shared/components/admin/sidebar/nav-config.ts`**
- Add "Product Images" as child under Products navigation

---

## UI Design Details

### Grid Layout

```text
+--------------------------------------------------+
|  Product Images Manager                          |
|  "Manage product images for your catalog"        |
+--------------------------------------------------+
|                                                  |
| [Search...] [Filter: All ▼] [Sort: Name ▼]       |
|                                                  |
| Stats: 1,272 products | 45 with images | 1,227   |
|        missing images                            |
+--------------------------------------------------+
|                                                  |
| +--------+  +--------+  +--------+  +--------+   |
| | [img]  |  | [icon] |  | [img]  |  | [icon] |   |
| | Name   |  | Name   |  | Name   |  | Name   |   |
| | SKU    |  | SKU    |  | SKU    |  | SKU    |   |
| | 3/5    |  | 0/5    |  | 1/5    |  | 0/5    |   |
| +--------+  +--------+  +--------+  +--------+   |
|                                                  |
| +--------+  +--------+  +--------+  +--------+   |
| | ...    |  | ...    |  | ...    |  | ...    |   |
| +--------+  +--------+  +--------+  +--------+   |
|                                                  |
| [Show more]                                      |
+--------------------------------------------------+
```

### Product Image Card States

1. **No Images**: Gray placeholder icon, upload prompt visible
2. **Has Primary Only**: Shows primary thumbnail, badge "1/5"
3. **Has Multiple**: Shows primary thumbnail, badge "X/5"
4. **Full Set**: Green checkmark badge, all slots filled

### Upload Flow

1. Click card OR drag image onto card
2. Quick upload modal opens with product details
3. Drag-and-drop or click to select files
4. Images upload with progress indicator
5. Modal auto-closes on success (or stays open for more uploads)

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/admin/ProductImages.tsx` | Create | Main page with grid layout |
| `src/components/admin/products/ProductImageCard.tsx` | Create | Individual product card with upload zone |
| `src/components/admin/products/QuickImageUploadModal.tsx` | Create | Focused image management modal |
| `src/routes/admin.routes.tsx` | Modify | Add `/admin/products/images` route |
| `src/shared/components/admin/sidebar/nav-config.ts` | Modify | Add navigation item |

---

## Technical Considerations

### Performance Optimizations

- **Virtualized Grid**: Use pagination or infinite scroll for 1,200+ products
- **Lazy Image Loading**: Load thumbnails as they scroll into view
- **Batch Operations**: Allow selecting multiple products for bulk operations
- **Optimistic Updates**: Show upload progress immediately, revert on failure

### Image Stats Query

Efficiently calculate image statistics:
```text
- Products with image_url set: COUNT WHERE image_url IS NOT NULL
- Products with additional images: COUNT WHERE additional_images IS NOT NULL AND array_length > 0
- Total image slots used: SUM of (1 if image_url + array_length of additional_images)
```

### Filter and Search

- Real-time search filtering on product name and SKU
- Dropdown filter for image status:
  - All Products
  - Missing Primary Image
  - Missing Additional Images
  - Complete (5/5 images)

---

## Expected Outcome

| Metric | Before | After |
|--------|--------|-------|
| Time to find products without images | Manual table scroll | Instant filter |
| Time to upload single product image | Open edit dialog, switch tab | Single click |
| Visual overview of image coverage | None | Dashboard with stats |
| Bulk upload for multiple products | Navigate to separate dialog | Drag onto grid |

---

## Component Structure

```text
ProductImages.tsx (Page)
├── Header with stats
├── Search + Filter controls
├── Grid container
│   └── ProductImageCard.tsx (repeated)
│       ├── Thumbnail / Placeholder
│       ├── Product info
│       ├── Image count badge
│       └── Upload dropzone
└── QuickImageUploadModal.tsx
    ├── Product header
    ├── Primary image section
    ├── Additional images grid
    └── Upload dropzone
```
