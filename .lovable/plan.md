

## PDCA-Guided Single Product Image Generation Workflow

### Problem
Currently, the Product Images page allows bulk selection and generation, but lacks a focused, step-by-step workflow for generating images for a **single specific product**. The user wants to:
1. Filter to frames, then pick **one** product by brand/SKU
2. Upload reference image(s) first
3. Review and fine-tune prompts per shot before generating
4. Generate one shot at a time with review between each

### Solution
Enhance the `QuickImageUploadModal` into a guided PDCA workflow with clear steps:

**Step 1 — PLAN**: Show product details + reference requirements. Upload reference photo(s).  
**Step 2 — CHECK**: Auto-generated prompts displayed for each shot. Admin reviews/edits each prompt. Reference image shown alongside each prompt for comparison.  
**Step 3 — DO**: Generate one shot at a time. After each shot generates, show the result next to the reference for comparison before proceeding to the next.  
**Step 4 — ACT**: Review full gallery. Option to regenerate any shot with a refined prompt.

### Technical Changes

**File 1: `src/modules/products/components/QuickImageUploadModal.tsx`**
- Add a `step` state: `"upload" | "review" | "generate" | "finalize"`
- **Upload step**: Current upload zone + reference requirement gate. "Continue to Prompts" button once references are met.
- **Review step**: Show all 6 shot prompts expanded with the reference thumbnail visible. Each prompt is editable. "Start Generation" button proceeds to next step.
- **Generate step**: Sequential generation with a progress indicator (1/6, 2/6...). After each shot completes, show the generated image next to the reference. Pause between shots — user clicks "Next Shot" or "Regenerate" (with prompt edit).
- **Finalize step**: Full gallery grid. Each image can be regenerated individually. "Done" closes the modal.
- Add a step indicator bar at the top (Plan → Check → Do → Act)

**File 2: `src/modules/products/components/PromptEditorPanel.tsx`**
- Add a `referenceImageUrl` prop to display the reference thumbnail next to each prompt
- Add a `comparisonImageUrl` prop for the generate step — shows the generated result beside the reference
- Support a "paused" mode where after generating one shot, it waits for user confirmation before proceeding

**File 3: `src/pages/admin/ProductImages.tsx`**
- No structural changes needed; the modal already receives the selected product

### UX Flow
```text
┌─────────────────────────────────────────────┐
│  PLAN          CHECK         DO        ACT  │
│  [●]───────────[ ]──────────[ ]────────[ ]  │
├─────────────────────────────────────────────┤
│                                             │
│  Step 1 (PLAN): Upload reference photos     │
│  ┌──────────┐                               │
│  │ ref.jpg  │  ← uploaded reference         │
│  └──────────┘                               │
│  [Continue to Prompts →]                    │
│                                             │
│  Step 2 (CHECK): Review/edit prompts        │
│  Hero (3/4 View)     [Edit prompt...]       │
│  Front View          [Edit prompt...]       │
│  ...                                        │
│  [Start Generation →]                       │
│                                             │
│  Step 3 (DO): Generate one at a time        │
│  Generating: Hero (1/6)                     │
│  ┌──────────┐  ┌──────────┐                 │
│  │ Reference│  │ Generated│                 │
│  └──────────┘  └──────────┘                 │
│  [Next Shot] [Regenerate with edit]         │
│                                             │
│  Step 4 (ACT): Review full gallery          │
│  [grid of 6 images]                         │
│  Click any to regenerate with prompt edit   │
│  [Done]                                     │
└─────────────────────────────────────────────┘
```

### Files Modified
1. `src/modules/products/components/QuickImageUploadModal.tsx` — Add PDCA step flow with step indicator, sequential generation with pause-between-shots, reference comparison view
2. `src/modules/products/components/PromptEditorPanel.tsx` — Add reference image display, comparison mode, pause-and-confirm support

