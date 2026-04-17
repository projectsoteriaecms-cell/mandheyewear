

# Make the Try-On Stage Truly Sticky & Compact

## Root cause
The "sticky stage" added last round is sticky in CSS, but `TryOnResult` is **too tall to ever stay in viewport** (449px viewport vs ~700px card). So when the user taps a frame, the result is technically pinned but pushed off-screen. The session replay confirms 1100–1700px of scrolling after frame taps.

## Fix: a compact "Stage" mode for TryOnResult

Add a `compact` prop to `TryOnResult` that, when true, renders a **slim, viewport-friendly** version specifically for the sticky region:

- **Single image only** (the result), no Original/With-Frames split — the user's photo is already shown in the compact upload bar above.
- **Inline header**: frame name + price on one line, action buttons (Cart, Heart, Download, Share) as **icon-only buttons** on the right.
- **Idle state collapses to a 1-line hint** ("Tap a frame below to preview it here") — no giant 4:3 placeholder eating 60% of the viewport.
- **Loading state keeps the previous result visible** with a small spinner badge overlay (instead of replacing the image with a skeleton) — so tapping frame #2 doesn't blank out frame #1.
- **Fixed compact height**: image capped at ~`max-h-[40vh]` so the whole stage fits in ~50vh, leaving room for frame grid below.

## Sticky stage refinements in `TryOn.tsx`

- Tighter sticky offset (`top-16`) and remove the nested `sm:p-4` wrapper padding.
- Pass `compact` to `TryOnResult` inside the sticky container.
- Keep the full-rich `TryOnResult` only for the **History** detail view (unchanged).
- Add a subtle border-bottom shadow on the sticky stage when scrolled, so it feels anchored.

## Frame grid: show generation feedback in-place
Already done last round (card overlay spinner) — keep, but also **highlight the active card** with a persistent ring after generation so user remembers which one they're viewing in the sticky stage.

## Mobile (449px viewport — current user)
- Compact stage = ~`h-[42vh]` total: image (~32vh) + 1-line meta + icon row.
- Frame grid stays 2-col, scrollable below.
- Result: tap frame → see preview update in pinned stage **without scrolling**.

## Files to change
- `src/components/try-on/TryOnResult.tsx` — add `compact` prop branch (slim layout, single image, icon-only actions, persistent-image loading state, slim idle hint).
- `src/pages/TryOn.tsx` — pass `compact` to the sticky `TryOnResult`, tighten sticky offset/padding.

## What stays
- All hooks, AR mode, History (uses full TryOnResult), carousel for multi-angle, email capture, download logic — untouched.

## Outcome
The result panel actually stays visible while browsing frames on a 449px-tall viewport. Tapping frames updates the pinned preview live, with no scrolling required.

