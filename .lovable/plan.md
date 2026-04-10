

## Mobile Hero Section Optimization

### Problems
1. **Hero image stacks below CTAs on mobile** — The single-column grid puts the large product image underneath "Book Eye Exam," making it look disorganized
2. **Button text wraps** — "Shop Collection" and "Book Eye Exam" break onto multiple lines on small screens

### Changes — `HeroSection.tsx`

1. **Reorder mobile layout**: Move the hero image *above* the headline on mobile using CSS `order` classes — `order-first lg:order-last` on the image column, so on mobile it appears at the top as a visual hero, not awkwardly below CTAs

2. **Shrink hero image on mobile**: Reduce the image container size on small screens — `max-w-[240px] sm:max-w-[300px] lg:max-w-[420px]` with a smaller aspect ratio and centered alignment, so it doesn't dominate the mobile viewport

3. **Fix button text wrapping**: Add `whitespace-nowrap` to both CTA buttons and slightly reduce padding on mobile (`px-5 sm:px-7`) so "Shop Collection" and "Book Eye Exam" each stay on one line

4. **Tighten mobile spacing**: Reduce vertical gaps (`gap-4 lg:gap-12`, `mb-4 sm:mb-10`) between image and text on mobile for a compact, app-like feel

