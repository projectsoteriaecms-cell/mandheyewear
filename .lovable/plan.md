

## Add Category Dropdown Filter and Lower Batch Limits

### What Changes

**1. GenerateImagesDialog.tsx — Replace category checkboxes with a dropdown**
- Replace the multi-checkbox category selector with a single `Select` dropdown for choosing one product category (item_type) at a time
- Show the shot count next to each option: "Frames (6-shot gallery)" vs "Contact Lenses (1 shot)"
- Add an "All Categories" option as default

**2. GenerateImagesDialog.tsx — Lower batch limits**
- Change `BATCH_LIMITS` from `[10, 25, 50, 100, all]` to `[2, 5, 10, 25, 50, all]`
- Default to `10` instead of `50`

### Technical Details

**Category dropdown** replaces lines 417-446 (the checkbox list):
```typescript
const BATCH_LIMITS = [
  { value: "2", label: "2 products" },
  { value: "5", label: "5 products" },
  { value: "10", label: "10 products" },
  { value: "25", label: "25 products" },
  { value: "50", label: "50 products" },
  { value: "all", label: "All" },
];
```

- Single `Select` dropdown with options from `categoryCounts` (only categories with missing > 0)
- When a category is selected, `selectedTypes` is set to `[value]`; when "all" is chosen, all types are selected
- The cost estimation, time estimate, and batch logic remain the same — they already work off `selectedTypes`

### Files Changed
- `src/components/admin/products/GenerateImagesDialog.tsx` only

