

# Product Image List Sorting by Item Type

## Overview

Add priority-based sorting to the Product Images Manager so products are displayed in this order:
1. **Frames** (highest priority)
2. **Contact Lenses**
3. **Lenses**
4. **Others** (solutions, medications, accessories, cleanser, packaging, other)

---

## Implementation

### File to Modify

`src/pages/admin/ProductImages.tsx`

### Changes

Add a sorting function within the `filteredProducts` useMemo that orders products by item type priority:

```typescript
// Priority order for item types
const ITEM_TYPE_PRIORITY: Record<string, number> = {
  frames: 1,
  contact_lenses: 2,
  lenses: 3,
  solutions: 4,
  medications: 5,
  accessories: 6,
  cleanser: 7,
  packaging: 8,
  other: 9,
};

// In the filteredProducts useMemo, after filtering:
result = result.sort((a, b) => {
  const priorityA = ITEM_TYPE_PRIORITY[a.item_type || 'other'] || 99;
  const priorityB = ITEM_TYPE_PRIORITY[b.item_type || 'other'] || 99;
  return priorityA - priorityB;
});
```

---

## Technical Details

- The sorting happens after search and filter operations, ensuring the priority order is always maintained
- Products without an `item_type` default to lowest priority (treated as "other")
- Secondary sorting by name can be added for products with the same item type if needed

---

## Summary

| Change | Description |
|--------|-------------|
| Add priority constant | Define `ITEM_TYPE_PRIORITY` mapping |
| Update `filteredProducts` | Sort by item type priority after filtering |

This ensures frames always appear first, followed by contact lenses, then regular lenses, with all other product types at the end.

