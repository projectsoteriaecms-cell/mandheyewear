

## Remove M&H Packaging Images from Known-Brand Products

### Problem
95 known-brand products (Gucci, Carrera, Polaroid, etc.) still have a packaging/case image as the last entry in their `additional_images` array. This packaging image was AI-generated with "M&H Opticals" branding, which is wrong for these brands. Additionally, 36 products have their `image_url` pointing to an AI-generated shot instead of the original uploaded photo (`main.*`).

### Scope
- **95 products** with 5 additional images → need the last image (packaging) removed
- **36 products** with `image_url` not pointing to `main.*` → need primary image fixed
- **133 products** with 4 additional images → already cleaned (previous batch), no action needed

### Solution: Edge function for bulk cleanup

**Create `supabase/functions/cleanup-brand-packaging/index.ts`**

A one-time cleanup edge function that:

1. **Fetches** all known-brand, m_and_h_fashion frame products with 5+ additional images
2. **Removes** the last entry from `additional_images` (the packaging shot)
3. **Deletes** the removed image file from storage
4. **Fixes primary image**: For any product where `image_url` does not contain `/main.`, find the `main.*` URL in `additional_images`, move it to `image_url`, and remove it from the array
5. Returns a summary of changes made

**Update `src/modules/products/components/BulkPackagingFixButton.tsx`**

Repurpose or add a second button "Remove M&H Packaging" that calls this new edge function instead of regenerating images. This gives you a one-click cleanup from the admin dashboard without waiting for AI credits.

### What this achieves
- Immediately removes all incorrect M&H-branded packaging images from known-brand products
- Ensures the original reference photo is always the hero/primary image
- No AI credits needed — this is purely a data and storage cleanup
- Products go from 6 gallery images to 5 (or 5 to 4), losing only the incorrect packaging shot
- When AI credits are restored, the "Fix Brand Packaging" button can regenerate correct brand-specific packaging

