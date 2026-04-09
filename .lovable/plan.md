

## Editorial Storytelling Landing Page Revamp

Inspired by the VELOUR reference — bold typographic hero, scrolling marquee tickers, numbered editorial sections, lifestyle imagery integrated into text, and a clean Cream/Ink alternating rhythm. Adapted for M&H Eyewear's unique dual identity: luxury fashion eyewear + clinical eye care.

### Design Language (from references)

```text
┌──────────────────────────────────────────────────┐
│  HERO — Full-width typographic statement         │
│  "where vision lives — now"                      │
│  Giant Syne Bold text with product images         │
│  floating between words. Cream bg, Ink text.     │
├──────────────────────────────────────────────────┤
│  MARQUEE TICKER — horizontal scrolling bar       │
│  "SMART STYLING • PREMIUM FRAMES • EYE CARE •"  │
│  Ink bg, Gold text, continuous loop              │
├──────────────────────────────────────────────────┤
│  EDITORIAL GRID — "All about vision ©26"         │
│  Asymmetric image + text blocks, numbered        │
│  01/06, 02/06 etc. Cream bg.                     │
├──────────────────────────────────────────────────┤
│  COLLECTION SHOWCASE — Category cards            │
│  Large editorial images, minimal text overlay    │
│  Ink bg section                                  │
├──────────────────────────────────────────────────┤
│  SOCIAL PROOF / TESTIMONIAL — editorial quote    │
│  Large pull-quote with star rating               │
│  Cream bg                                        │
├──────────────────────────────────────────────────┤
│  FEATURED FRAMES — product grid                  │
│  Clean cards, Ink bg                             │
├──────────────────────────────────────────────────┤
│  DUAL CTA SPLIT — Eyewear | Eye Care            │
│  Side-by-side editorial panels                   │
│  Links to /eyewear and /booking                  │
├──────────────────────────────────────────────────┤
│  TRUST STRIP + FOOTER                            │
└──────────────────────────────────────────────────┘
```

### File Changes

**1. New component: `src/modules/storefront/components/home/MarqueeTicker.tsx`**
- Infinite horizontal scroll of brand/value keywords
- "PREMIUM FRAMES • VIRTUAL TRY-ON • FREE EYE EXAMS • AI STYLING • DESIGNER EYEWEAR"
- Ink background, Gold/Cream text, CSS animation (no JS)
- Small orange `+` decorators between items (like VELOUR reference)

**2. Rewrite: `HeroSection.tsx`**
- Replace carousel-based hero with a VELOUR-style typographic hero
- Giant Syne Bold headline: `"where vision lives — now"` (or similar editorial statement)
- Product/lifestyle images floating between text words (CSS grid/absolute positioning)
- Cream background, Ink text, Gold accents
- Small stats counter: "280K+ PEOPLE WE INSPIRE" style
- Subtle tag labels: `/EYEWEAR`, `/EYE CARE`
- Two CTAs: "Shop Collection" (Gold) + "Book Eye Exam" (Flame)
- Remove Embla carousel dependency from hero

**3. New component: `src/modules/storefront/components/home/EditorialGrid.tsx`**
- "All about vision ©26" editorial section
- Asymmetric grid with numbered blocks (01/06, 02/06...)
- Mix of frame product images and short editorial copy
- Each block has a small description + "LEARN MORE →" link
- Cream background with Ink text
- Replaces the old `QuickDiscovery` section in the page flow

**4. Rewrite: `CategoryCards.tsx`**
- Convert from 3-column equal cards to an editorial asymmetric layout
- One large hero card + two stacked smaller cards
- Cleaner typography, less overlay clutter
- Keep existing category data and routing
- Ink background maintained

**5. New component: `src/modules/storefront/components/home/TestimonialSection.tsx`**
- Large editorial pull-quote testimonial
- Star rating (5.0, 145 Reviews)
- Customer name in brackets `[Customer Name]`
- "See What Our Customers Are Saying" link
- Cream background
- Replaces old QuizPromo position (Quiz CTA moves into editorial grid)

**6. Rewrite: `VirtualTryOn.tsx`**
- Simplify to a clean editorial split panel
- Large image on one side, bold typographic headline on other
- Keep AI try-on messaging but in editorial tone
- Ink background

**7. Rewrite: `TrustBadges.tsx`**
- Convert to a horizontal strip/bar rather than 4-column grid
- Cleaner, more editorial — single row with dividers
- Or integrate into footer area

**8. New component: `src/modules/storefront/components/home/DualCtaSection.tsx`**
- Side-by-side "Fashion Eyewear" | "Clinical Eye Care" split
- Each half has a large image, headline, and CTA
- Represents the brand's dual identity
- Cream background

**9. Update: `Index.tsx`**
- New section order:
  1. HeroSection (typographic, Cream)
  2. MarqueeTicker (Ink strip)
  3. EditorialGrid (Cream) — replaces QuickDiscovery
  4. CategoryCards (Ink)
  5. TestimonialSection (Cream) — replaces QuizPromo
  6. FeaturedFrames (Ink) — kept as-is with minor style tweaks
  7. DualCtaSection (Cream) — replaces VirtualTryOn
  8. TrustBadges (Ink strip)
  9. Footer

**10. Update: `src/modules/storefront/components/home/index.ts`**
- Export new components: MarqueeTicker, EditorialGrid, TestimonialSection, DualCtaSection
- Keep QuizPromo and VirtualTryOn files but they won't be imported on Index

**11. CSS additions in `src/index.css`**
- `.marquee-track` animation for infinite horizontal scroll
- `.editorial-number` styling for the 01/06 numbered labels

### What Does NOT Change
- Navigation (TopBar + MainNav) — already updated in Phase 2
- Footer — already Ink-based and working
- FeaturedFrames — keeps its database-driven product grid (minor style polish only)
- Mobile bottom nav
- All routing, data fetching, cart, auth logic
- Typography system (Syne + DM Sans already applied)

### Technical Notes
- Embla carousel removed from hero (simpler, more editorial)
- Marquee uses pure CSS `@keyframes` for performance
- All new components use existing Tailwind tokens (ink, cream, mh-gold, flame)
- Images: reuse existing assets (hero-eyewear.jpg, hero-eye-care.jpg, frame-*.jpg) positioned editorially

