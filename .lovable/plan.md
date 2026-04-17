

# Fix Virtual Try-On UX Flow

## The Problem (you're right)
Current `/try-on` page forces this awkward dance:
1. Upload photo (top-left)
2. Scroll **down** to pick a frame
3. Click "Try This Frame"
4. Scroll back **up** to see result (top-right)
5. Repeat for every frame

Two big issues: (a) the result lives far from the action, (b) the layout treats it like a static dashboard instead of a guided flow.

## New UX: Progressive Single-Column Flow with Sticky Result

Replace the side-by-side grid + bottom picker with a **vertical, step-driven layout** where the result panel becomes the focal point as soon as a photo exists.

### Step 1 — Upload (full width, centered)
- Compact PhotoUpload card. Once uploaded, it collapses to a small thumbnail with "Change photo" link. No more giant left column sitting empty.

### Step 2 — Sticky Try-On Stage (appears after upload)
A two-pane sticky module that **pins to the top of the viewport** while the user scrolls frames:
- **Left:** Result preview (the carousel / live result / loading state)
- **Right (desktop) / below (mobile):** Currently selected frame card + Add to Cart / Wishlist / Download

On mobile this becomes a sticky **top bar** showing the live result thumbnail + frame name, tappable to expand full-screen.

### Step 3 — Frame Picker (below, scrollable)
- Switches from horizontal scroll to a **responsive grid** (2 cols mobile, 3–4 cols desktop) so users can browse without horizontal scrolling.
- Tapping any frame card **immediately triggers generation** (no separate "Try This Frame" button needed — the whole card is the action). Selected card gets a ring + "Generating…" shimmer.
- Result updates in the sticky stage above — **no scrolling required**.

### Optional polish
- Auto-scroll to sticky stage on first generation (smooth).
- "Quick toggle" chips above the picker: All · Sunglasses · Eyeglasses · Color filters — so users find frames faster.
- Subtle pulse animation on the sticky result the first time it generates, so users notice it updated.

## Files to change
- `src/pages/TryOn.tsx` — restructure layout: upload → sticky stage → grid picker
- `src/components/try-on/FramePicker.tsx` — convert horizontal scroll to responsive grid; make whole card clickable to try; remove redundant button (keep visual cue)
- `src/components/try-on/PhotoUpload.tsx` — add compact/collapsed mode after upload
- New small wrapper for the sticky stage (or inline in TryOn.tsx using `sticky top-X` with TryOnResult inside)

## What stays the same
- AR mode, Tour, History, hooks (`useVirtualTryOn`), result carousel — all untouched.
- No backend changes.

## Outcome
One continuous flow: **upload once → tap frames → watch result update live above**. No scrolling whiplash, no hidden state, mobile-friendly.

<lov-actions>
<lov-suggestion message="Looks good, implement it">Approve and implement</lov-suggestion>
<lov-suggestion message="Make the sticky stage full-width with the result on top and frame info below, instead of side-by-side">Stack stage vertically</lov-suggestion>
<lov-suggestion message="Also add filter chips (All / Sunglasses / Eyeglasses / by color) above the frame grid">Add filter chips too</lov-suggestion>
</lov-actions>
