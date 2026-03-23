

## PDCA Image Quality Gate for House Brand Products

### Problem
The AI image generator creates frames from text descriptions alone. For well-known brands (Ray-Ban, Gucci), this works reasonably well because the AI has training data. For house brands like **M&H Kids**, the AI invents a completely wrong frame. There is no validation step to catch this.

### Solution
Implement a **minimum 2 reference photo requirement** for products that lack online visual data (house brands). The system will:
- **Block** AI gallery generation until at least 2 real photos are uploaded
- **Use those photos as reference** when generating the remaining gallery shots (image-to-image editing instead of text-to-image)
- Show clear status indicators so admins know which products are ready for AI generation vs need manual photos first

### How It Works

```text
Product without images
        │
        ▼
  Is it a known luxury brand?
   ┌─────┴──────┐
   YES          NO (house brand)
   │             │
   ▼             ▼
 AI generates   "Upload at least 2
 from text      reference photos first"
 (existing       │
  flow)          ▼
              2+ photos uploaded
                 │
                 ▼
              AI generates remaining
              gallery shots using
              reference photos
              (image-to-image editing)
```

### Technical Changes

**1. Edge function: `supabase/functions/generate-product-image/index.ts`**
- Accept optional `referenceImageUrls: string[]` parameter
- When reference images are provided, switch from text-to-image to image-to-image mode: send the reference photo with each shot prompt so the AI re-renders the real frame at different angles
- When no references and brand is NOT in the `LUXURY_BRANDS` set, return an error: "House brand requires at least 2 reference photos"
- Keep existing text-only flow for luxury/known brands

**2. UI: `src/modules/products/components/QuickImageUploadModal.tsx`**
- Add a visual quality gate: if product brand is not a known luxury brand and has fewer than 2 uploaded images, show a message explaining that 2+ reference photos are needed
- Disable the "Regenerate with AI" button until the requirement is met
- When 2+ photos exist, change button to "Generate Gallery from References" which passes the uploaded images to the edge function

**3. Bulk generation: `src/modules/products/components/GenerateImagesDialog.tsx`**
- In bulk mode, automatically skip house brand products that don't have 2+ reference photos
- Show a count of "skipped (needs reference photos)" alongside the existing progress stats

### PDCA Status Indicators

In the Product Image Manager, each product card will show one of:
- **Ready for AI** — Known brand, can generate from text
- **Needs Photos (0/2)** — House brand, no references uploaded yet
- **Needs Photos (1/2)** — House brand, needs 1 more reference
- **Ready for AI (ref)** — House brand with 2+ references, can generate from those
- **Complete** — Full gallery already exists

### Files Modified
1. `supabase/functions/generate-product-image/index.ts` — Add reference image support and house brand gate
2. `src/modules/products/components/QuickImageUploadModal.tsx` — Add quality gate UI and reference-based generation button
3. `src/modules/products/components/GenerateImagesDialog.tsx` — Skip house brands without references in bulk mode
4. `src/modules/products/components/ProductImageCard.tsx` — Add PDCA status badge

