

## Inline Virtual Try-On: One-Click VTO from Any Product Page

### Current State
Right now, every "Virtual Try-On" button (on ProductCard, ProductDetail, AddToCartSection) simply navigates to `/try-on?product={id}`. The user must then upload a photo on the TryOn page before generating. There is no stored VTO photo on the user profile.

### What We'll Build
A modal-based inline VTO experience: logged-in users who have a saved selfie on their profile can click "Virtual Try-On" on any product and instantly get an AI-generated try-on result — no page navigation, no re-uploading.

### How It Works

```text
User clicks "Virtual Try-On" on any product
  ├─ Not logged in → redirect to /login
  ├─ Logged in, no saved photo → navigate to /try-on?product={id} (current behavior)
  └─ Logged in, has saved VTO photo →
       Open inline modal → auto-generate try-on → show result
       Actions: Add to Cart, Wishlist, Share, Try Different Photo
```

### Implementation

**1. Add `vto_photo_url` to profiles table**
- New nullable text column on `profiles` to store the user's preferred VTO selfie (a Supabase Storage URL)
- Migration: `ALTER TABLE profiles ADD COLUMN vto_photo_url text;`

**2. Photo persistence on the TryOn page**
- When a user uploads a photo on `/try-on`, offer a "Save as my try-on photo" toggle
- Uploads the image to `product-images` bucket under `vto-photos/{userId}.webp`
- Saves the public URL to `profiles.vto_photo_url`
- Also allow saving from the dashboard profile section

**3. New `InlineTryOnModal` component**
- File: `src/components/try-on/InlineTryOnModal.tsx`
- Props: `productId`, `open`, `onOpenChange`
- Fetches the product details, loads the user's `vto_photo_url` from profile
- Calls `useVirtualTryOn.generateTryOn()` automatically on open
- Shows: loading spinner → result image → action buttons (Add to Cart, Wishlist, Close)
- Fallback link: "Use a different photo →" navigates to `/try-on?product={id}`

**4. New `useInlineTryOn` hook**
- File: `src/modules/personalization/hooks/useInlineTryOn.ts`
- Checks auth status + profile `vto_photo_url`
- Returns `{ canInlineTryOn, savedPhotoUrl, triggerTryOn }` 
- `triggerTryOn(productId)` opens the modal if photo exists, otherwise navigates to `/try-on`

**5. Update all VTO button locations**
- `ProductCard.tsx` — replace `navigate('/try-on?product=...')` with `triggerTryOn(product.id)`
- `ProductDetail.tsx` — same for both desktop and mobile VTO buttons
- `AddToCartSection.tsx` — same
- `ProductListCard.tsx` — same
- Each renders the `<InlineTryOnModal />` conditionally

### Files Modified
1. **Migration** — Add `vto_photo_url` column to profiles
2. `src/components/try-on/InlineTryOnModal.tsx` (new) — Modal with auto-generate VTO
3. `src/modules/personalization/hooks/useInlineTryOn.ts` (new) — Hook for inline VTO logic
4. `src/pages/TryOn.tsx` — Add "Save as my try-on photo" option after upload
5. `src/modules/storefront/components/eyewear/ProductCard.tsx` — Use inline VTO
6. `src/pages/ProductDetail.tsx` — Use inline VTO
7. `src/components/product/AddToCartSection.tsx` — Use inline VTO
8. `src/modules/storefront/components/eyewear/ProductListCard.tsx` — Use inline VTO

### User Flow Summary
- **New users / no photo**: Same as today — navigate to /try-on page
- **Returning users with saved photo**: Click VTO button → modal opens → AI generates instantly → result appears in 5-10 seconds → Add to Cart right there
- **Want to change photo**: Link in modal takes them to full /try-on page, or they can update from dashboard

