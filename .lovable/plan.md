

# Move Search Bar Below the Nav — Standalone, Responsive Search Strip

## What We're Doing
Pull the search bar **out** of the cramped menu bar and place it as its own distinct row below the navigation header. This gives it room to breathe and makes it a prominent, always-visible feature — like Jumia, Amazon, or Noon — across all screen sizes.

## Layout (Before → After)

```text
BEFORE (Desktop):
┌─────────────────────────────────────────────┐
│ Logo  [===Search Bar===]  Links  Icons      │  ← everything crammed in one row
└─────────────────────────────────────────────┘

AFTER (Desktop):
┌─────────────────────────────────────────────┐
│ Logo       Nav Links          Icons          │  ← clean nav row
├─────────────────────────────────────────────┤
│   [Category ▾] [  Search eyewear...  ] [🔍] │  ← dedicated search strip
└─────────────────────────────────────────────┘

AFTER (Mobile):
┌─────────────────────────────────────────────┐
│ ☰  🌙     M&H Logo           ♡  🛒        │  ← top bar (unchanged)
├─────────────────────────────────────────────┤
│   [🔍  Search eyewear, brands, styles... ]  │  ← new search strip (tappable)
└─────────────────────────────────────────────┘
```

## Key Changes

### 1. New `SearchStrip` Component
A standalone, responsive search bar component rendered as its own row:
- **Desktop (lg+)**: Full-width bar with category dropdown on the left, text input area in the middle, and search icon button on the right — all in a rounded-full container with a subtle border/background
- **Tablet (md)**: Same layout, slightly more compact padding
- **Mobile (<md)**: Simplified single bar — tapping it opens the existing `SearchDialog`. No category dropdown on mobile (the dialog has its own category chips)

### 2. Update `Navigation.tsx`
Add the `SearchStrip` below the header, still inside the fixed header area so it stays visible on scroll. Adjust top padding offset accordingly.

### 3. Clean Up `MainNav.tsx`
- Remove the inline search bar (lines 75-121) — no longer needed in the nav row
- Remove the mobile search icon button — mobile gets the strip instead
- Remove `searchCategory` state and the `searchCategories` constant
- The nav row becomes cleaner: just Logo, Links, and Icon actions

### 4. Update `MobileTopBar.tsx`
No changes needed — search strip renders separately below it.

### 5. Adjust Page Content Offset
Since we're adding a second fixed row (~48px), update the content top padding (likely in the layout wrapper) so pages don't hide behind the navigation.

## Files to Modify
- **Create** `src/components/navigation/SearchStrip.tsx` — the new standalone search bar
- **Edit** `src/components/Navigation.tsx` — add SearchStrip below header
- **Edit** `src/components/navigation/MainNav.tsx` — remove inline search bar, simplify
- **Edit** layout/page wrappers — adjust top padding for extra nav height

## What Stays the Same
- `SearchDialog` — fully reused as-is (opened by clicking the strip)
- `MobileBottomNav` — keeps the Search tab as an alternative entry point
- All routes, product pages, cart, auth flows

