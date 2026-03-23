

## Fix Reference Image Flow for LA MARTINA MAV718 COL.01

### Problem
Two issues prevent the reference-based generation from working properly in the Product Images manager:

1. **Frame attributes not flattened**: The `useAdminProducts` hook returns `frame_attributes` as a nested object (e.g., `product.frame_attributes[0].model_code`), but the `QuickImageUploadModal` expects `model_code`, `frame_shape`, `frame_material` as top-level properties. This means prompts lack critical metadata like model code and frame shape.

2. **Product data not mapped to modal props**: The `ProductImages.tsx` page passes the raw product to the modal without extracting frame attribute fields, so the prompt builder can't use them.

### Solution

**File 1: `src/pages/admin/ProductImages.tsx`**
- When setting `selectedProduct`, flatten `frame_attributes` into top-level fields before passing to the `QuickImageUploadModal`
- Extract `model_code`, `frame_shape`, `frame_material`, `front_color` from the nested `frame_attributes` array

**File 2: `src/modules/products/components/ProductImageCard.tsx`** (if needed)
- Ensure the PDCA badge correctly reflects readiness for LA MARTINA (Known Brand with 1 image = "Ready for AI (ref)")

### What happens after
You navigate to Product Images, filter by Known Brands, find "La Martina Frame MAV718 51 20 145 COL.01", click it, and the QuickImageUploadModal opens showing:
- The uploaded reference photo visible in the image grid
- "Generate from Reference" button enabled (since it has 1 reference, meeting the Known Brand minimum of 1)
- Click "Generate from Reference" to create the remaining 5 gallery shots using that reference image

### Technical Detail
The flattening logic:
```typescript
const fa = Array.isArray(p.frame_attributes) ? p.frame_attributes[0] : p.frame_attributes;
const flattened = {
  ...p,
  model_code: fa?.model_code,
  frame_shape: fa?.frame_shape,
  frame_material: fa?.frame_material,
};
```

### Files Modified
1. `src/pages/admin/ProductImages.tsx` — Flatten frame_attributes when passing product to modal

