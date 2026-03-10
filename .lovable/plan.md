

## Remove "Recommended For You" Section & Clean Up Personalization References

The "Recommended For You" section (lines 295-326) shows the same products regardless of category or quiz results because `usePersonalizedProducts` loads ALL products once and scores them client-side — it doesn't respect the active category filter. The scoring engine also produces weak differentiation since most products lack rich `style`/`material` metadata.

### Changes

**1. `src/pages/Eyewear.tsx`** — Remove:
- The `usePersonalizedProducts` import and hook call
- The `showPersonalized` state and `recommendationsRef`/`highlightRecommendations` state
- The "Recommended For You" section (lines 295-326)
- The "Personalization CTA" card (lines 271-293)
- The onboarding redirect highlight logic (lines 57-68)
- The personalization-based sort logic inside `filteredProducts` (lines 127-131 — the `if (showPersonalized && hasPreferences)` block)
- Remove `matchScore`, `matchReasons`, `fitIndicator` props from ProductCard/ProductListCard renders (lines 401-408, 421-425)
- Clean up unused imports (`Sparkles`, `ChevronRight`, `useAuth`, `usePersonalizedProducts`)

**2. `src/components/eyewear/ProductCard.tsx`** — Remove the match score badge / match reasons display if present (optional, keeps component clean)

**3. `src/components/eyewear/ProductListCard.tsx`** — Same cleanup

The category filtering, sidebar filters, and pagination all remain intact. The page becomes a clean category-driven browsing experience without broken personalization cluttering the UI.

### What stays
- ShopCategoryBar with server-side counts
- ShopSidebar with gender/shape/price filters
- MobileFilterDrawer
- Grid/list view toggle
- Pagination
- VirtualTryOnBanner
- ProductQuickView

