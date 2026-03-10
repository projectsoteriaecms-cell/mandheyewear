

## Luxury Eyewear Category Navigation — Warby Parker / Vogue Style

I looked at both Warby Parker and Vogue Eyewear's category pages to understand the pattern you're referring to. Here's what they do:

- **Warby Parker**: Top-level nav has distinct "Eyeglasses | Sunglasses | Contacts | Accessories" as separate pages. Each category page has a **left sidebar filter panel** with collapsible sections (Shape, Color, Gender, Frame Width, Frame Price, Material) alongside the product grid.

- **Vogue Eyewear**: Has a **horizontal category pill bar with circular avatar images** (All Eyeglasses, Women, Men, Kids, Teens) at the top, plus a "Filters & Sort" button that opens a filter panel.

### What I'll Build

**1. Redesign the Eyewear page layout** — Replace the current basic pill tabs with a premium two-column layout:
- **Left sidebar** (desktop): Collapsible filter sections for Shape, Gender, Price Range, Brand, Material — styled like Warby Parker
- **Right content area**: Product grid with sort dropdown and count
- **Mobile**: Filters collapse into a slide-out drawer triggered by a "Filters & Sort" button

**2. Add a visual category header bar** — Inspired by Vogue's circular avatar pills:
- Horizontal row of category cards with small circular images (eyeglasses icon, sunglasses icon, accessories icon, lenses icon)
- Centered at the top of the shop page below the breadcrumb
- Active state with underline accent

**3. Update top navigation** — Make "Eyeglasses", "Sunglasses", and "Accessories" first-class nav items (like Warby Parker) instead of hiding them in a dropdown:
- Desktop nav: `Eyeglasses | Sunglasses | Accessories | Eye Exams` as direct links
- Each links to `/eyewear?category=X` with the appropriate filter pre-applied

**4. Sidebar filter sections** (collapsible accordion):
- **Shape**: Round, Rectangular, Cat-Eye, Aviator, Wayfarer
- **Gender**: Men, Women, Unisex
- **Price**: Budget, Standard, Premium, Luxury
- **Sort**: Featured, Price Low-High, Price High-Low
- Filter counts shown next to each option
- "Clear all" button when filters are active

### Files to Create/Edit

| File | Change |
|------|--------|
| `src/components/eyewear/ShopSidebar.tsx` | New — collapsible filter sidebar component |
| `src/components/eyewear/ShopCategoryBar.tsx` | New — visual category header with circular icons |
| `src/components/eyewear/MobileFilterDrawer.tsx` | New — sheet-based filter panel for mobile |
| `src/pages/Eyewear.tsx` | Refactor to two-column sidebar + grid layout |
| `src/components/navigation/MainNav.tsx` | Flatten Eyewear dropdown into direct category links |
| `src/components/navigation/MobileBottomNav.tsx` | Update if needed for category navigation |
| `src/components/eyewear/ProductFilters.tsx` | Remove (replaced by sidebar) |

### Technical Notes
- Sidebar uses the existing Accordion component from shadcn/ui for collapsible sections
- Mobile filter drawer uses the Sheet component
- Filter state managed via URL search params (already partially implemented) so links are shareable
- All existing filter logic (gender, style, price tier, category) is preserved and moved into the sidebar
- Product counts per filter option computed from the full product set for real-time feedback

