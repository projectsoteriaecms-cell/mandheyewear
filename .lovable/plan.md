

## Add Product Search in PDCA Modal to Pull Existing Reference Images

### Problem
Currently, to use a reference image in the PDCA workflow, you must manually upload it. But many products already have a primary image uploaded. You want to search by brand name, SKU, or product name (e.g., "La Martina Mav718") directly within the modal and pull that product's existing primary image as the reference — avoiding the need to download from elsewhere and re-upload.

### Solution
Add a **search bar** in the PLAN step (Step 1) of the `QuickImageUploadModal` alongside the existing drag-and-drop upload zone. The search queries the loaded products list by name, SKU, or brand. When the user finds the right product and it already has a primary image, they can click "Use as Reference" to automatically set that image as the reference for generation.

### Technical Changes

**File 1: `src/modules/products/components/QuickImageUploadModal.tsx`**
- Add a search input field in the PLAN step, above or beside the upload drop zone
- Add state: `referenceSearch` string and a filtered results list derived from the `useAdminProducts` hook data
- Show a compact dropdown/list of matching products (thumbnail + name + SKU) when the user types
- Each result with an existing `image_url` shows a "Use as Reference" button
- Clicking "Use as Reference" copies that product's `image_url` to the current product as its primary image (via `supabase.from('products').update({ image_url })`) and refreshes queries
- If the product being edited already IS the searched product, just confirm the existing image is the reference
- Add the `useAdminProducts` hook import to access the full product list for search

**File 2: `src/pages/admin/ProductImages.tsx`** (minor)
- Pass the products list as a prop to `QuickImageUploadModal` so the modal can search without a separate query (optional optimization — can also query internally)

### UX Flow
```text
Step 1 — PLAN
┌──────────────────────────────────────┐
│ Search product by name, SKU or brand │
│ [La Martina Mav718____________]      │
│                                      │
│  ┌─────┐ La Martina 100K Mav718      │
│  │ img │ SKU: LA-MARTINA-MAV718-COL01│
│  └─────┘ [Use as Reference]          │
│                                      │
│ ─── OR upload new reference ───      │
│                                      │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │
│  │  Drag & drop images here   │     │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │
└──────────────────────────────────────┘
```

### Files Modified
1. `src/modules/products/components/QuickImageUploadModal.tsx` — Add search input, product result list, and "Use as Reference" action in PLAN step

