

# Switch Image Generation to Direct Gemini API (Lovable AI as Fallback Only)

## Problem
The edge function currently routes all image generation through the Lovable AI gateway (`ai.gateway.lovable.dev`), consuming Lovable credits. You already have a `GEMINI_API_KEY` secret configured.

## Changes

### File: `supabase/functions/generate-product-image/index.ts`

Rewrite the `generateImage` function to:

1. **Primary**: Call Google Gemini API directly at `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent` using `GEMINI_API_KEY`
   - Request body uses Gemini's native format: `{ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE", "TEXT"] } }`
   - Extract base64 image from `response.candidates[0].content.parts[].inlineData`

2. **Fallback** (on 429/5xx from Gemini): Fall back to Lovable AI gateway using `LOVABLE_API_KEY` with the current OpenAI-compatible format

3. **Update main handler**: Read both `GEMINI_API_KEY` and `LOVABLE_API_KEY`, pass both to `generateImage`. Only fail if neither key is available.

### No other files need changes
The admin UI and dialog remain the same.

## Key Details
- The Gemini native image generation response format differs from the Lovable gateway — the image comes back as `inlineData.data` (base64) + `inlineData.mimeType` in the `parts` array
- Same retry/backoff logic applies, but primary path hits Google directly at zero Lovable credit cost
- Fallback ensures generation still works if the Gemini API key hits quota limits

