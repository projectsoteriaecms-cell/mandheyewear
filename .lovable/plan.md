
# Fix Virtual Try-On Edge Function

## Problem Identified

The edge function is failing with a 500 error due to two issues with the Gemini API call:

| Issue | Current (Broken) | Required (Fixed) |
|-------|------------------|------------------|
| Model endpoint | `gemini-2.0-flash-exp` | `gemini-2.0-flash-exp-image-generation` |
| Response modalities | `["image", "text"]` (lowercase) | `["TEXT", "IMAGE"]` (uppercase) |

## Solution

Update the Gemini API call in `supabase/functions/virtual-try-on/index.ts`:

### Change 1: Fix Model Endpoint (Line 79)
```typescript
// FROM:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`

// TO:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`
```

### Change 2: Fix Response Modalities Case (Line 102)
```typescript
// FROM:
responseModalities: ["image", "text"],

// TO:
responseModalities: ["TEXT", "IMAGE"],
```

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/virtual-try-on/index.ts` | Update model name and fix modalities case |

## Technical Details

- The `gemini-2.0-flash-exp` model is a general-purpose model that doesn't support image generation output
- The `gemini-2.0-flash-exp-image-generation` model is specifically designed to generate images based on prompts and input images
- The `responseModalities` parameter requires uppercase values (`"TEXT"`, `"IMAGE"`) per the Gemini API specification
- Your existing `GEMINI_API_KEY` will continue to work with the corrected endpoint

## After Implementation

The edge function will be automatically deployed. You can then test the Virtual Try-On feature by:
1. Going to `/try-on`
2. Uploading a photo
3. Selecting a frame with an image
4. Clicking "Try This Frame"
