

## Left-Align CTA Buttons Under "A New Frame of Mind"

### Problem
The "Shop Collection" and "Book Eye Exam" buttons are in a `flex-row` layout with `justify-between`, pushing them to the far right on desktop. They should sit directly below the "A new frame of mind" text, left-aligned.

### Changes — Single file: `HeroSection.tsx`

1. **Move the CTA buttons inside the left content column** (the `max-w-md space-y-5` div that contains the "A new frame of mind" paragraph), placing them after the now-empty stats div
2. **Remove the `lg:flex-row` and `justify-between`** from the parent wrapper since we no longer need the two-column split
3. The CTA buttons keep their existing styling (`flex-col sm:flex-row gap-3`) but are now naturally left-aligned under the text content

This is a simple structural move — no new components or styles needed.

