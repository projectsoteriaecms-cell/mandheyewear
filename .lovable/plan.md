

## Break Down M&H Stock Units by Item Type on Dashboard

### Problem
The M&H section shows 291K total stock units as one number. Most of that is lenses (~290K). You need to see where those units actually sit: Frames, Lenses, Contact Lenses, Accessories.

### Changes

**1. Update `useInventoryStats` hook** (`src/modules/inventory/hooks/useInventoryOverview.ts`)

- Fetch inventory with product `item_type` included: change the select to include `product:products(is_active, item_type, brand_line)` alongside `branch:branches(is_mh_location)`
- After filtering M&H items, compute per-type stock units:
  - `frames` — sum of quantity_on_hand where item_type = 'frames'
  - `lenses` — item_type = 'lenses'
  - `contactLenses` — item_type = 'contact_lenses'
  - `accessories` — item_type in ('accessories', 'solutions', 'cleanser', 'other', 'medications')
- Return these as `mh.byType: { frames, lenses, contactLenses, accessories }` in the stats object

**2. Update `InventoryStats` type** (`src/modules/inventory/types/index.ts`)

- Add `byType` to the `mh` object:
```typescript
byType: {
  frames: number;
  lenses: number;
  contactLenses: number;
  accessories: number;
};
```

**3. Update Dashboard UI** (`src/pages/admin/Dashboard.tsx`)

- Replace the single "M&H Stock Units" card with 4 item-type cards in the M&H section:
  - **Frames** — `stats.mh.byType.frames` units
  - **Lenses** — `stats.mh.byType.lenses` units
  - **Contact Lenses** — `stats.mh.byType.contactLenses` units
  - **Accessories** — `stats.mh.byType.accessories` units
- Keep the existing Featured Online, Low Stock, and With Images cards in the M&H section (second row if needed)
- The total M&H stock can remain visible as a description or be removed since the breakdown replaces it

### Result
The M&H section will show exactly where the 291K units sit (expect ~290K in Lenses, ~200 in Frames, etc.), making the data immediately actionable.

