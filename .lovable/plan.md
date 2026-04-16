

# Build Rich Product Description Framework for Frames

## Problem
Out of 10,930 active frame products, **zero** have rich descriptions (200+ chars). Most have short stubs like "Gucci 468K Frame Gg1258O 005 M". Top eyewear platforms (FramesDirect, LensCrafters, Amazon) use structured, detailed descriptions that drive conversions.

## Description Framework (Learned from FramesDirect, LensCrafters, Gucci.com)

Based on research, here is the structured description template top platforms follow:

```text
┌─────────────────────────────────────────────────┐
│  1. HEADLINE SUMMARY (1-2 sentences)            │
│     "Elevate your optical style with the..."    │
│                                                 │
│  2. KEY FEATURES (bullet list)                  │
│     • Frame Shape: Cat-Eye                      │
│     • Frame Material: Acetate                   │
│     • Temple Material: Acetate                  │
│     • Hinge Type: Spring / Regular              │
│     • Prescription Compatible: Yes              │
│     • Progressive Eligible: Yes                 │
│                                                 │
│  3. MEASUREMENTS (structured)                   │
│     Lens Width: 53mm | Bridge: 19mm             │
│     Temple: 140mm | Frame Width: 135mm          │
│                                                 │
│  4. COLOR & FINISH DETAILS                      │
│     Front Color: Black                          │
│     Temple Color: Black with gold accents       │
│                                                 │
│  5. BRAND STORY (for known brands)              │
│     "Founded in Florence, Italy, in 1921..."    │
│                                                 │
│  6. WHAT'S INCLUDED                             │
│     Case, cleaning cloth, authenticity card      │
└─────────────────────────────────────────────────┘
```

## Plan

### 1. Add a `description_html` column to `products` table
A new nullable `text` column for rich HTML descriptions, keeping the existing plain `description` for backward compatibility and SEO meta tags.

### 2. Create an `enrich-product-descriptions` edge function
- Takes a product ID (or batch of IDs)
- Fetches product data + frame_attributes
- Uses Lovable AI (Gemini 2.5 Flash) to generate a rich, structured description following the framework above
- Scrapes the actual product from FramesDirect/LensCrafters by model code (e.g., GG1258O) using Firecrawl or direct fetch to get real specs
- Merges scraped data with existing DB data
- Saves the rich description as `description_html` and a clean summary as `description`

### 3. Start with 1 sample: Gucci GG1258O (ID: `044cd130-...`)
- Scrape the real FramesDirect page for GG1258O to extract: frame material, hinge type, measurements, color names, brand story
- Generate the rich description using AI
- Save to DB and verify on the frontend

### 4. Update the Product Detail Page (PDP)
- Render `description_html` using a new `ProductDescription` component with sections: Overview, Features, Measurements, Brand Story, What's Included
- Replace the current single `<p>` tag with a tabbed or accordion layout matching luxury eyewear sites
- Style with the existing Ink/Cream palette

### 5. Add admin UI for description management
- Add a "Description" tab in `EditProductDialog` with a rich text preview
- Add a "Generate Description" button that calls the edge function for a single product
- Add bulk enrichment option in the Products toolbar

### Technical Details

**Database migration:**
```sql
ALTER TABLE products ADD COLUMN description_html text;
```

**Edge function approach:**
- Input: product ID + optional `source_url` for scraping
- AI prompt includes the framework template above
- Output: structured HTML with semantic sections
- Rate-limited with the existing retry/backoff pattern

**Frontend component:** `ProductDescription.tsx`
- Renders sections: Overview, Specifications, Brand Heritage, What's Included
- Accordion on mobile, full display on desktop
- Falls back to plain `description` if `description_html` is null

**Files to create/modify:**
- `supabase/functions/enrich-product-descriptions/index.ts` (new)
- `src/components/product/ProductDescription.tsx` (new)
- `src/pages/ProductDetail.tsx` (update description rendering)
- `src/components/product/ProductSpecifications.tsx` (merge into new component)
- `src/modules/products/components/EditProductDialog.tsx` (add description tab)
- Database migration for `description_html` column

