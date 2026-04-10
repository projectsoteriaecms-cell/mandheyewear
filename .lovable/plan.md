

## Restore Promo Banner Card Below Hero + Keep Flash Deals Strip

### What's Changing

The screenshot shows a large, prominent **promo banner card** ("NEW SEASON COLLECTION") sitting below the hero headline. This card was removed in favor of the Flash Deals strip. We're bringing it back as its own distinct section, while keeping the Flash Deals strip below it.

### Changes — Single file: `HeroSection.tsx`

#### 1. Add Promo Banner Card (between the two-column grid and the Flash Deals strip)
A full-width card matching the screenshot design:
- Dark background card with rounded corners (`bg-ink-light` or `bg-cream/[0.04]`)
- **Title**: `title_line1` in bold white, `title_line2` in flame/gold — large, impactful typography
- **Date label**: Dashed border badge ("April 2026 Drop")
- **Description**: Body text in cream/70
- **Discount badge**: Pill-shaped, with tag icon, `discount_prefix` + `discount_value` in flame color
- **Disclaimer**: Small muted text ("T&Cs apply • Limited time offer")
- **Featured product thumbnails**: Fetch products by `featured_product_ids` from the banner, display 3 rounded product images in a row at the bottom
- The entire card links to `/eyewear`

#### 2. Fetch Featured Products for the Banner
Add a query that fetches products matching `activeBanner.featured_product_ids` to display the 3 thumbnail images at the bottom of the card. Falls back to latest 3 products if no IDs are set.

#### 3. Flash Deals Strip Stays Below
No changes to the Flash Deals / New Arrivals strip — it remains right below the promo banner card.

### Result
The hero section flows: **Headline + Right Image → Promo Banner Card → Flash Deals Strip** — giving maximum marketing impact with both a seasonal campaign card and a product deal row always visible.

