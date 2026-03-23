

## Add Brand Type Filter to Product Images Manager

### Problem
You cannot distinguish between house brand products (M&H Kids, M&H, etc.) and known/common brands (Gucci, Ray-Ban, FREIGEIST) in the Product Images page. You want to filter by brand type so you can separately manage which products to generate images for.

### Solution
Add a **Brand Type** filter dropdown to the ImageFilterBar with options:
- **All Brands** (default)
- **Known Brands** — products whose brand matches the `LUXURY_BRANDS` list (can use text-to-image AI)
- **House Brands** — everything else (M&H Kids, M&H, unbranded — requires reference photos)
- **No Brand Set** — products with null/empty brand field

This reuses the existing `isKnownBrand()` function from `brand-classification.ts`.

### Technical Changes

**1. `src/pages/admin/product-images/ImageFilterBar.tsx`**
- Add a new `brandTypeFilter` prop with values `"all" | "known" | "house" | "no_brand"`
- Render a new Select dropdown labeled "Brand Type" between the status and category filters

**2. `src/pages/admin/ProductImages.tsx`**
- Add `brandTypeFilter` state
- Apply filtering logic in the `filteredProducts` memo:
  - `"known"` — `isKnownBrand(p.brand) === true`
  - `"house"` — `p.brand && !isKnownBrand(p.brand)`
  - `"no_brand"` — `!p.brand`
- Pass through to ImageFilterBar

**3. `src/pages/admin/product-images/index.ts`**
- No new exports needed; ImageFilterBar already exported

### Files Modified
1. `src/pages/admin/product-images/ImageFilterBar.tsx` — Add brand type dropdown
2. `src/pages/admin/ProductImages.tsx` — Add brand type state and filtering logic

