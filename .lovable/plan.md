

# Enhanced Product Search — Style Categories & Multi-Parameter Matching

## Problem
The search currently only queries 3 fields (`name`, `brand`, `color`). When users click "Cat Eye", "Aviator", etc., or type specific parameters like SKU, material, or frame shape, no results are returned because those fields aren't included in the search query.

## Changes

### 1. Expand search query fields (SearchDialog.tsx)
Add `style`, `sku`, `material`, `description` to the `.or()` filter so users can find products by any relevant attribute:

```
.or(`name.ilike.%${term}%,brand.ilike.%${term}%,color.ilike.%${term}%,style.ilike.%${term}%,sku.ilike.%${term}%,material.ilike.%${term}%,description.ilike.%${term}%`)
```

### 2. Add style-based category chips (SearchDialog.tsx)
Expand the category filter chips to include popular frame shapes alongside the existing product-type categories:

```
Categories row: All | Eyeglasses | Sunglasses | Accessories
Styles row:     Cat Eye | Aviator | Round | Rectangle | Wayfarer | Oval
```

When a style chip is selected, filter by `style.ilike.%{style}%` in addition to any category filter. This replaces the current static "Popular" section with functional, filterable style chips.

### 3. Update Popular suggestions
Replace the static Popular terms with more diverse searchable terms that now actually work (since we're expanding the query fields):
- Frame styles: Aviator, Cat Eye, Round, Rectangle, Wayfarer
- Materials: Titanium, Acetate
- Brands pulled from common inventory

### 4. Align mobile search strip padding
Ensure the mobile SearchStrip bar has balanced left/right padding matching the page content.

## Files to modify
| File | Change |
|------|--------|
| `src/components/search/SearchDialog.tsx` | Expand `.or()` fields, add style filter chips row, update Popular terms |
| `src/components/navigation/SearchStrip.tsx` | Minor padding alignment if needed |

