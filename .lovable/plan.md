

# Hero Slideshow Implementation Plan

## Overview

Transform the static hero section into an elegant, auto-advancing slideshow that balances both brand identities: **Soteria Eye Clinic** (medical/clinical) and **M&H Eyewear** (fashion/premium eyewear). The slideshow will feature smooth animations, dynamic content per slide, and maintain the professional, minimalist aesthetic.

---

## What We're Building

A 2-3 slide hero carousel where each slide represents a different aspect of the brand:

| Slide | Focus | Image | Headline | CTA |
|-------|-------|-------|----------|-----|
| 1 | Eye Care (Medical) | `hero-eye-care.jpg` | "Your path to clearer vision begins with us" | Book Eye Exam |
| 2 | Eyewear (Fashion) | `hero-eyewear.jpg` | "Transforming vision with clarity & confidence" | Find Your Frame |
| 3 | Combined/Trust | Frame collage or lifestyle | "Precision eye care. Premium eyewear." | Shop Collection |

---

## Design Approach (Reference-Inspired)

Drawing from the reference image showing the eye clinic design:

**Visual Elements:**
- Clean, professional slides with teal/blue medical tones for clinic slides
- Warm gold accents for eyewear/fashion slides
- Smooth crossfade or slide transitions (not abrupt jumps)
- Dot indicators at bottom showing current slide
- Optional: subtle arrow controls on desktop

**Animation System:**
- Auto-advance every 5-6 seconds
- Pause on hover (desktop) for user control
- Text elements animate in with staggered fade-in-up
- Image zooms subtly during display (Ken Burns effect)
- Smooth crossfade between slides

**Mobile/Tablet Behavior:**
- Image appears below CTA buttons (as currently requested)
- Touch/swipe support for manual navigation
- Same auto-advance timing

---

## Technical Implementation

### Install Autoplay Plugin

Add `embla-carousel-autoplay` package for automatic slide advancement with pause on interaction.

### Slide Data Structure

```text
slides = [
  {
    id: 1,
    type: "clinic",
    image: heroEyeCare,
    badge: "Soteria Eye Clinic",
    headline: "Your path to clearer vision",
    subheadline: "begins with us",
    description: "Comprehensive eye exams, advanced diagnostics...",
    primaryCTA: { text: "Book Eye Exam", link: "/booking", icon: Calendar },
    secondaryCTA: { text: "Our Services", link: "/eye-care", icon: Eye },
    accentColor: "primary" // blue
  },
  {
    id: 2,
    type: "eyewear",
    image: heroEyewear,
    badge: "M&H Eyewear",
    headline: "Transforming vision with",
    subheadline: "clarity & confidence",
    description: "Not just eyewear — a unique blend of elegance...",
    primaryCTA: { text: "Find Your Frame", link: "/style-quiz", icon: Sparkle },
    secondaryCTA: { text: "Shop Collection", link: "/eyewear", icon: Bag },
    accentColor: "accent" // gold
  }
]
```

### Animation Keyframes

Add new keyframes to tailwind.config.ts:

| Animation | Effect |
|-----------|--------|
| `slide-fade-in` | Fade in from opacity 0 with slight scale |
| `slide-fade-out` | Fade out to opacity 0 |
| `ken-burns` | Slow zoom from 100% to 105% over slide duration |
| `text-reveal` | Staggered text appearance with mask/clip effect |

### Component Structure

```text
HeroSection.tsx
├── Carousel (Embla with Autoplay)
│   ├── CarouselContent
│   │   ├── CarouselItem (Slide 1 - Eye Clinic)
│   │   │   ├── Background Image with Ken Burns
│   │   │   ├── Gradient Overlay
│   │   │   ├── Content (animated text + CTAs)
│   │   │   └── Trust Indicators
│   │   └── CarouselItem (Slide 2 - Eyewear)
│   │       └── ... same structure
│   └── Dot Indicators (custom styled)
└── Floating Cards (optional: show on active slide only)
```

---

## Responsive Behavior

### Desktop (lg+)
- Full-width hero with 2-column layout
- Image on right side with floating cards
- Navigation arrows visible on hover
- Dot indicators centered at bottom

### Tablet/Mobile (< lg)
- Single column layout
- Text content first
- Image carousel below CTA buttons
- Swipe-enabled navigation
- Dot indicators below image

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Complete refactor to slideshow with Embla + Autoplay |
| `tailwind.config.ts` | Add Ken Burns and slide transition keyframes |
| `package.json` | Add `embla-carousel-autoplay` dependency |

---

## Accessibility Considerations

- Pause autoplay when user focuses on carousel
- ARIA labels for slide navigation
- Reduced motion preference support (disable Ken Burns)
- Keyboard navigation (arrow keys)

---

## Summary

This implementation creates a balanced, professional hero that:
1. **Represents both brands** equally with dedicated slides
2. **Uses smooth animations** that feel premium, not gimmicky
3. **Auto-advances** to ensure both messages are seen
4. **Maintains the existing trust indicators** and floating cards
5. **Works seamlessly** across all device sizes with the mobile image placement as requested

