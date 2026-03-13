

## Fix Face Measurement: Update Model and CORS Headers

### Problem
The `analyze-face` edge function is already using the Lovable AI gateway (not direct Gemini), but it's using `google/gemini-2.5-flash` which may be failing on image analysis. Two fixes needed:

1. **Switch model** to `google/gemini-2.5-pro` — the top-tier vision model, best for image+text analysis (the current `gemini-2.5-flash` may struggle with image analysis accuracy). We keep the Lovable AI gateway as-is since it's already the correct approach.
2. **Fix CORS headers** — missing the newer Supabase client headers, same pattern fixed in the other functions.

### Changes

**`supabase/functions/analyze-face/index.ts`**
- Line 6: Update `Access-Control-Allow-Headers` to include full Supabase client headers
- Line 56: Change model from `google/gemini-2.5-flash` to `google/gemini-2.5-pro` for stronger vision capabilities
- This is already going through Lovable AI gateway, so no architectural change needed

### Files Changed
- `supabase/functions/analyze-face/index.ts` — model upgrade + CORS fix

No database changes. Auto-deployed.

