

## Modular Per-Product Image Generation

### Concept
Replace the bulk category-based approach with a **product-selection model**. Users pick specific products from the grid/list, then generate images for just those selections in small, efficient batches:

- **1 frame = 1 batch** (6 shots: hero + 5 gallery)
- **6 non-frame products = 1 batch** (1 shot each)

This keeps API calls small and lets the admin control exactly what gets generated.

### Changes

**1. ProductImages.tsx — Add multi-select mode**
- Add `selectedIds: Set<string>` state and a "Select" toggle button in the toolbar
- When selection mode is on, clicking a product card toggles it into the set (checkbox overlay)
- Show a floating action bar at the bottom: "Generate Images for X selected" button
- Pass `selectedIds` to the generate dialog instead of category counts

**2. ProductImageCard.tsx — Selection overlay**
- Accept `selectable` and `selected` props
- When `selectable`, show a checkbox in the top-left corner; clicking toggles selection instead of opening the upload modal

**3. ProductImageListView.tsx — Row selection**
- Add checkboxes per row + "Select All" header checkbox
- Pass selection state up via callbacks

**4. GenerateImagesDialog.tsx — Rework for selected products**
- Accept `selectedProductIds: string[]` instead of (or alongside) `categoryCounts`
- When product IDs are provided, show a summary: "1 frame (6 shots) + 4 accessories (4 shots) = 10 API calls"
- No category checkboxes needed — the selection was already made in the grid
- Send product IDs to the edge function one at a time, processing sequentially
- Keep the live ticker, auto-pause, and error export

**5. Edge function — No changes needed**
- Already supports `productId` for single-product generation
- The dialog will loop through selected IDs, calling the edge function once per product (same as current single-regenerate flow)

### UI Flow

```text
┌─ Product Images Manager ────────────────────────┐
│ [Search...] [Filter ▾] [Grid|List] [✓ Select]   │
│                                                   │
│  ☑ GU-001   ☑ GU-002   ☐ RB-003   ☑ SOL-041    │
│  (frame)    (frame)    (frame)    (solution)     │
│                                                   │
│ ╔═══════════════════════════════════════════════╗ │
│ ║ 3 selected · 2 frames (12 shots) +           ║ │
│ ║ 1 solution (1 shot) = 13 API calls            ║ │
│ ║                    [Generate Selected]         ║ │
│ ╚═══════════════════════════════════════════════╝ │
└───────────────────────────────────────────────────┘
```

### Technical Details

- **Selection state**: `useState<Set<string>>` in ProductImages.tsx, toggled via card/row clicks
- **Batch processing**: Dialog iterates `selectedProductIds`, calling `supabase.functions.invoke("generate-product-image", { body: { productId } })` for each — reusing the existing single-product path
- **Efficiency**: No new edge function logic needed; the modular single-product endpoint already handles frames (6-shot) and non-frames (1-shot) correctly
- **The "Generate Missing Images" button** remains for bulk runs but the primary workflow becomes select-then-generate
- **Select All visible**: A "Select All" checkbox selects all currently filtered/visible products (respects search + filter)

