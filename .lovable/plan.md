

## Mobile-App Responsiveness Overhaul

The landing page currently works on mobile but doesn't *feel* like a mobile app. Text is too large, spacing is desktop-first, the promo banner wastes space, CTAs are hard to tap, and the bottom nav overlaps content. This plan fixes every section to feel native-app-quality on small screens.

---

### Changes by File

**1. `HeroSection.tsx` — Mobile-first hero**
- Reduce headline `clamp` minimum from `3rem` to `2.2rem` so it doesn't overflow on 360px screens
- Inline images: shrink from `1.6em`/`1.4em` to `1.2em`/`1.0em` on mobile (`w-[1.2em] sm:w-[1.6em]`)
- Promo banner: tighten padding from `p-8` to `p-5` on mobile, reduce heading from `text-3xl` to `text-2xl`
- Stats row: switch from `gap-8` to `gap-4` on mobile, reduce stat text from `text-2xl` to `text-xl`
- CTAs: make full-width stacked on mobile (`w-full sm:w-auto`), increase touch target with `py-4`
- Subtext: reduce from `text-xl` to `text-lg` on mobile
- Add `pb-24` to account for bottom nav overlap
- Scroll indicator: bump up from `bottom-8` to `bottom-24` on mobile to clear bottom nav

**2. `MarqueeTicker.tsx` — Compact mobile ticker**
- Reduce text from `text-base` to `text-xs` on mobile, keep `sm:text-lg`
- Reduce spacing `mx-6` to `mx-3` on mobile
- Hide third ghost row on mobile (`hidden sm:flex`) — too much visual noise on small screens

**3. `EditorialGrid.tsx` — Single-column mobile cards**
- Section heading: reduce from `text-4xl` to `text-3xl` on mobile
- Cards: reduce `min-h-[260px]` to `min-h-[220px]` on mobile for better scroll rhythm
- Card content padding: `p-5` on mobile vs `p-6` on larger
- Add `pb-20` to section to clear bottom nav on last scroll

**4. `CategoryCards.tsx` — Stacked mobile cards**
- Large hero card: reduce `min-h-[400px]` to `min-h-[280px]` on mobile
- Stacked cards: reduce `min-h-[200px]` to `min-h-[180px]` on mobile
- Section heading: `text-3xl` on mobile

**5. `TestimonialSection.tsx` — Mobile quote sizing**
- Quote text: reduce from `text-xl` to `text-lg` on mobile
- Decorative `"` mark: reduce from `text-[120px]` to `text-[80px]` on mobile
- Section heading: `text-3xl` on mobile

**6. `DualCtaSection.tsx` — Full-width mobile panels**
- Panels: reduce `min-h-[400px]` to `min-h-[300px]` on mobile
- Panel content padding: `p-6` on mobile vs `p-8`/`p-10` on larger
- Section heading: `text-3xl` on mobile

**7. `TrustBadges.tsx` — 2x2 grid on mobile**
- Switch from `flex-wrap` to `grid grid-cols-2 lg:flex` so badges form a clean 2x2 grid on mobile
- Remove the desktop-only divider logic, use gap for separation
- Add `pb-20` to clear bottom nav

**8. `Index.tsx` — Bottom nav clearance**
- Add `pb-20 lg:pb-0` to the main wrapper so all content clears the fixed bottom nav
- Move the floating chat button up on mobile: `bottom-20 sm:bottom-6` to sit above the bottom nav

**9. `Footer.tsx` — Bottom nav clearance**
- Add `pb-20 lg:pb-0` to footer so it's not hidden behind the bottom nav

### What Does NOT Change
- All copy, colors, animations, dark background, cultural content stays identical
- Desktop layout is untouched — all changes are mobile-breakpoint scoped
- Navigation components (MobileTopBar, MobileBottomNav) stay as-is
- No new components or dependencies

