

## Merge Promo Banner + New Arrivals Into One Unified Section

### What's Changing

The two separate sections below the hero headline — the **Promo Banner Card** (big marketing card with title, discount, thumbnails) and the **Flash Deals / New Arrivals Strip** (horizontal product row) — get combined into a single, cleaner block.

### How It Will Look

One card with:
- **Top area**: Banner title, date label, discount pill, and "Shop Now" link — all in a compact horizontal layout (no separate thumbnails)
- **Bottom area**: The scrollable product row sits directly beneath, inside the same card — no visual gap between the two

### Changes — `HeroSection.tsx`

1. **Remove the standalone Promo Banner Card** (the `<Link>` block with featured thumbnails, discount pill, and "Shop Now")
2. **Integrate banner info into the Flash Deals strip header**: The flame-colored header bar will show the banner title + discount alongside the countdown/label
3. **Product row stays unchanged** beneath the header — same scrollable product cards
4. **Result**: One cohesive marketing block instead of two stacked sections, moved up tighter under the hero

