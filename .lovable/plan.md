

## Test Reference-Photo-Guided Generation for M&H Kids 8130-C6

### What we're doing
Use your two uploaded reference photos of the real M&H Kids 8130-C6 frame to regenerate the 6-shot gallery using image-to-image editing instead of text-only. This will validate whether the PDCA reference workflow produces accurate results.

### Steps

**Step 1: Upload reference photos to storage**
- Copy the two uploaded images (`IMG_3496-2.jpeg` and `IMG_3495-2.jpeg`) into the `product-images` storage bucket under the test product's folder as `ref-1.jpeg` and `ref-2.jpeg`

**Step 2: Regenerate gallery with references**
- Call the `generate-product-image` edge function for product `b94b4d62-0da2-402c-b389-fa552254447f` with `referenceImageUrls` pointing to the two uploaded reference photos
- The edge function will use `editImage()` (image-to-image) instead of `generateImage()` (text-only), sending the real frame photo with each shot prompt
- This overwrites the existing inaccurate AI-generated images

**Step 3: Visual verification**
- Open the product page in the browser to compare the new gallery against the real frame
- Check that the translucent frosted gray color, rectangular shape, and rubber temple bands are preserved across all 6 shots

### No code changes needed
The edge function already supports `referenceImageUrls`. This is a runtime test using the existing infrastructure.

