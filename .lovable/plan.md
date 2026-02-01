
# Virtual Try-On Quality Verification Plan

## Problem Analysis
Currently, the Virtual Try-On feature only sends **text descriptions** (frame name, color, style) to the AI. The frame's actual image URL is passed but **not used** in the prompt. This means:

- The AI is generating glasses based solely on text, leading to potential mismatches
- Users may see glasses that don't match the exact frame they selected
- No verification that the generated image matches the product

## Solution Overview
Implement a **multi-image reference system** that sends both the user's photo AND the actual frame image to the AI, ensuring visual consistency. Additionally, add a **quality indicator** in the UI to build user confidence.

## Implementation Steps

### 1. Enhanced Edge Function with Frame Image Reference
Update the `virtual-try-on` edge function to:
- Accept and download the frame's product image
- Send BOTH images (user photo + frame reference) to the AI
- Update the prompt to explicitly instruct the AI to replicate the exact frame appearance

**Key prompt enhancement:**
```
"Here is the exact eyeglasses frame to apply to the user's face. 
You MUST replicate this exact frame design - same shape, color, 
material appearance, and style. Do not create a different design."
```

### 2. Convert Frame Image URL to Base64
The edge function will:
- Fetch the frame image from the product's `imageUrl`
- Convert it to base64 for the AI API
- Handle cases where no image URL exists (fallback to text-only mode)

### 3. Updated AI Prompt Structure
New multi-image prompt that:
- First image: The reference frame (what glasses to apply)
- Second image: The user's face photo
- Clear instructions to match the frame exactly
- Emphasis on preserving frame shape, color, and design details

### 4. UI Quality Indicator
Add a subtle "Verified Match" badge in the `TryOnResult` component when:
- A frame reference image was successfully used
- This builds user confidence that the result matches their selection

### 5. Show Reference Frame in Result
Display a small thumbnail of the selected frame alongside the try-on result so users can easily compare the generated glasses with the original product image.

---

## Technical Details

### Edge Function Changes (`supabase/functions/virtual-try-on/index.ts`)
- Add `fetchFrameImageAsBase64()` helper function
- Modify prompt to include two-image context
- Update Gemini API call structure for multi-image input
- Add `usedFrameReference: boolean` flag in response

### Frontend Changes
- `TryOnResult.tsx`: Add frame reference thumbnail for comparison
- `TryOnResult.tsx`: Add "AI Generated with Frame Reference" indicator
- `useVirtualTryOn.ts`: Pass through the `usedFrameReference` flag

### Fallback Behavior
If frame image URL is missing or fails to load:
- Continue with text-only generation (current behavior)
- Show indicator that frame reference wasn't available
- Suggest user that results may vary

---

## Expected Outcome
- AI will see the actual frame design and replicate it precisely
- Users can compare the generated result with the original frame thumbnail
- Confidence badge indicates when frame matching was verified
- Reduced inconsistencies between selected frame and generated result
