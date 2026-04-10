

## Reposition Hero Image: Below "Clarity without compromise" on Mobile, Optimized for Tablet

### Problem
On mobile (390px), the hero image currently appears *above* the entire headline ("A clearer outlook on life") because of the `order-1` class. The user wants it to appear **after** the "Clarity without compromise" pill and **before** the CTA buttons. On tablet, it needs better positioning too.

### Approach
Instead of using CSS `order` to swap the image above everything, the image will be **inlined within the left column** on mobile/tablet, placed between the "Clarity without compromise" badge and the CTA buttons. On desktop (lg+), it stays as the right column.

### Changes — `HeroSection.tsx`

1. **Remove the image from the grid's right column on mobile/tablet**: Add `hidden lg:flex` to the right-column image container so it only shows on desktop

2. **Add a mobile/tablet-only image block inside the left column**, positioned between the "Clarity without compromise" pill and the CTAs:
   - Wrap in `lg:hidden` so it disappears on desktop
   - Mobile: `max-w-[220px]`, centered, smaller rounded image
   - Tablet (md): `max-w-[280px]`, slightly larger, positioned nicely

3. **Remove the `order-1`/`order-2` swapping** since the image no longer needs to reorder — text column is always first, image is either inline (mobile/tablet) or right column (desktop)

### Result
- **Mobile**: Headline → subtext → "Clarity without compromise" → hero image → CTA buttons — clean vertical flow
- **Tablet**: Same flow but with a larger, better-proportioned image
- **Desktop**: Unchanged two-column layout

