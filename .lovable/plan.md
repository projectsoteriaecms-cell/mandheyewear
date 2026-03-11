

## Add Category Filter to Product Image Manager

### What
Add an item-type/category filter dropdown next to the existing image status filter on the Product Images page. This lets admins quickly narrow down to specific product types (Frames, Contact Lenses, Accessories, Solutions, Lenses, etc.) to manage their images.

### Changes

**`src/pages/admin/ProductImages.tsx`** — single file change:

1. Add `categoryFilter` state (`string`, default `"all"`)
2. Compute unique item types from the products list for the dropdown options
3. Add a new `Select` dropdown between the existing status filter and the view toggle, labeled "All Categories" by default, listing each item type with its product count
4. Apply the category filter in the `filteredProducts` memo — when not `"all"`, filter by `p.item_type === categoryFilter`
5. Show the active category in the results count badge when a category is selected

### UI Layout
The filter bar will go from:
`[Search] [Status Filter] [Grid/List] [Select]`
to:
`[Search] [Status Filter] [Category Filter] [Grid/List] [Select]`

The category dropdown options will be dynamically built from existing products, showing counts like:
- All Categories
- Frames (142)
- Contact Lenses (38)
- Accessories (25)
- Solutions (12)
- etc.

