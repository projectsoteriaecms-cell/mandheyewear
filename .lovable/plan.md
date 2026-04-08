

## Auto-Extract Frame Measurements for All Products

### Current State
- **101 products** already have measurements (lens_width, bridge_size, temple_length)
- **~2,000 products** have the `XX-XX-XXX` pattern in their names (e.g., "55-19-145") — these can be extracted instantly via regex
- **~10,800 frames** total are missing measurements
- An enrichment edge function already exists but needs a fix: it currently only processes try-on-eligible products (those with images). We need it to process ALL frame products.

### What This Plan Does

1. **Fix the edge function** to process all frame products missing measurements (not just those with images), and increase the batch size limit
2. **Run it in batches** to extract measurements from product names using regex first, then AI fallback for ambiguous names
3. **Also extract `frame_shape` and `frame_material`** from product names via the AI path (e.g., "Cat Eye", "Aviator", "Titanium", "Acetate")

### Technical Changes

**File: `supabase/functions/enrich-frame-measurements/index.ts`**
- Remove the `.not("image_url", "is", null)` filter so ALL frame products get processed
- Add a `mode` parameter: `"all"` processes all frames, `"tryon_only"` keeps current behavior
- Increase default batch_size to 200 for regex-heavy runs
- Add regex pattern for space-separated measurements (e.g., `55 47 17 140` seen in Julia Backer products)
- Extract `frame_material` via AI alongside shape

**No UI changes needed** — you can trigger enrichment via the existing admin tools or we can run it directly after deployment.

### Expected Results
- ~2,000 products enriched instantly via regex (no AI credits used)
- Remaining products attempted via AI fallback in subsequent batches
- Total coverage goes from 101 → potentially 2,000+ products with full measurements

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/enrich-frame-measurements/index.ts` | Remove image filter, add broader regex patterns, extract material |

