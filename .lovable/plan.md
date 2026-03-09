

# Fix Gemini API Model Name for Image Generation

## Problem
The edge function logs show the direct Gemini API returning **404** because `gemini-2.0-flash-exp` is no longer available. Every request falls back to Lovable AI, burning credits — the exact opposite of what we want.

## Fix
One-line change in `supabase/functions/generate-product-image/index.ts` (line 120):

Change the model from `gemini-2.0-flash-exp` to `gemini-2.5-flash-preview-05-20` in the Gemini API URL.

The REST API endpoint becomes:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent
```

This model supports `responseModalities: ["IMAGE", "TEXT"]` for native image generation via the Gemini API.

## After Fix
Will re-invoke the edge function with `batchSize: 1` to confirm:
- Direct Gemini API returns an image (no fallback to Lovable)
- Image uploads to storage successfully
- Product record updates with the URL

## Files Modified
- `supabase/functions/generate-product-image/index.ts` — line 120, model name update

