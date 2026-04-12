

## Reduce Hero Section Frame

### Problem
The hero section uses `min-h-screen` (line 193), forcing it to fill the entire viewport height. On the user's 575px-tall viewport, the CTAs ("Shop Collection" and "Book Eye Exam") are pushed below the fold.

### Fix

**File: `src/modules/storefront/components/home/HeroSection.tsx`** — Line 193

Change:
```
min-h-screen flex flex-col justify-center
```
To:
```
min-h-0 flex flex-col justify-center
```

This removes the forced full-viewport height, letting the section size itself naturally to its content. The headline, tagline, pill badge, and CTA buttons will all be visible at a glance without scrolling.

Additionally, reduce the vertical padding on line 209 (`py-8 sm:py-12 lg:py-16 pb-24 lg:pb-16`) to `py-4 sm:py-8 lg:py-10 pb-20 lg:pb-10` to tighten the section further.

One file, two line changes.

