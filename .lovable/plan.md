

## Structured Image Generation Dialog

### Problem
The current "Generate Missing Images" button fires off generation for all 3,000+ missing products indiscriminately. The user needs to select **what category** of products to generate for, with counts shown per category.

### Solution

**1. Update the `GenerateImagesDialog` component** to add a category/item-type selection step before generation starts:

- Show a list of item types with their missing-image counts (e.g., "Frames — 1,842 missing", "Contact Lenses — 312 missing", etc.)
- User selects one or more item types via checkboxes
- Optionally set a batch limit (e.g., "Generate first 50 only")
- Only then can they click "Start Generating"

The idle state becomes a configuration form:
```text
┌─────────────────────────────────────────┐
│ Generate Product Images                 │
│                                         │
│ Select product categories:              │
│ ☑ Frames (1,842)      → 6-shot gallery  │
│ ☐ Contact Lenses (312) → 1 shot        │
│ ☐ Lenses (198)          → 1 shot        │
│ ☐ Solutions (87)        → 1 shot        │
│ ☐ Accessories (45)      → 1 shot        │
│ ☐ Other (29)            → 1 shot        │
│                                         │
│ Batch limit: [50 ▾]                     │
│                                         │
│ Total: 1,842 products selected          │
│ Est. time: ~18 min                      │
│                                         │
│         [Cancel]  [Start Generating]    │
└─────────────────────────────────────────┘
```

**2. Update the edge function** (`supabase/functions/generate-product-image/index.ts`) to accept an `itemTypes` filter parameter and a `maxProducts` limit:

- Add `itemTypes?: string[]` and `maxProducts?: number` to the request body
- Filter the query: `.in("item_type", itemTypes)` when provided
- Apply `.limit(maxProducts)` when provided
- Return per-type breakdown in the response

**3. Update `ProductImages.tsx`** to pass per-category missing counts to the dialog by computing them from the products array.

### Technical Details

- **Dialog state**: Add `selectedTypes: string[]` and `batchLimit: number` state
- **Counts query**: Compute missing counts per item_type from the already-loaded `products` array (filter where `!p.image_url`)
- **Edge function body**: Send `{ batchSize: 1, itemTypes: ["contact_lenses"], maxProducts: 50 }` 
- **Remaining count**: Edge function adjusts remaining count to only count selected types
- **Batch limit options**: 10, 25, 50, 100, All

