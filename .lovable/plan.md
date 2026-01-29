

# Quick-Access Categories Section Implementation

## What We're Building

A **mobile-first quick-access category navigation** section that appears immediately after the Hero, inspired by the Zenni interface. This provides rapid browsing paths before users scroll to the larger content sections.

---

## Component Structure

### New Component: `QuickCategories.tsx`

Three distinct sub-sections:

### 1. Category Bubbles (Circular Icons)
- **Data source**: Fetch from `categories` table in database
- **Layout**: Horizontally scrollable grid (2 rows on mobile, single row on desktop)
- **Visual**: Circular containers with icons (using Phosphor icons) or could use product images
- **Interaction**: Tap navigates to `/eyewear?category={slug}`

### 2. Promotional Banner Carousel (Optional)
- Embla carousel for promotional content
- Could showcase seasonal offers, new arrivals, or special collections
- This can be added later or configured from admin

### 3. Quick Filter Pills
- Horizontally scrollable chips for popular filters
- Examples: "On Sale", "New Arrivals", "Best Sellers", "Under ₦30,000"
- Each pill links to `/eyewear?filter={value}`

---

## Visual Design (Matching Your Aesthetic)

Since your design philosophy emphasizes minimalism and elegance (Dieter Rams principles), we'll adapt the Zenni pattern with:

| Zenni Style | Our Adaptation |
|-------------|----------------|
| Crowded 2-row grid | Single elegant row with subtle scroll indicators |
| Bold product photos in circles | Clean icons with subtle backgrounds + hover effects |
| Busy pill filters | Refined pill buttons with gold accents on hover |
| Multiple carousels | One optional promo banner (can be hidden) |

---

## Technical Implementation

### Files to Create

**`src/components/home/QuickCategories.tsx`**
- Main component with three sections
- Fetches categories from database via existing `useCategories` hook
- Horizontally scrollable with Embla carousel or native CSS scroll-snap
- Responsive: compact on mobile, expanded on desktop

### Files to Modify

**`src/pages/Index.tsx`**
- Import and add `QuickCategories` component between Hero and CategoryCards

**`src/components/home/index.ts`**
- Export the new component

---

## Database Considerations

Your `categories` table already has:
- `Prescription Glasses`, `Reading Glasses`, `Progressive Lenses`, `Blue Light Glasses`
- `Designer Frames`, `Sunglasses`, `Aviator Collection`, `Cat-Eye Collection`
- `Round Collection`, `Rectangular Collection`

These 10 categories can populate the quick-access bubbles. We can add an `icon_name` column later to store Phosphor icon names per category.

---

## Component Mockup

```
┌────────────────────────────────────────────────────────┐
│                     QUICK CATEGORIES                   │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐      │
│  │ ○ │  │ ○ │  │ ○ │  │ ○ │  │ ○ │  │ ○ │  │ ○ │ →    │
│  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘      │
│ Glasses  Sun  Reading Progress  Blue  Designer  Round │
├────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │      NEW ARRIVALS 2026                          │  │
│  │      Discover the latest frames  [Shop Now →]   │  │
│  │                              ● ○ ○              │  │
│  └─────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  [On Sale] [New In] [Best Sellers] [Under ₦30k] [→]   │
└────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

1. **Create `QuickCategories.tsx`** with:
   - Category bubbles using database categories
   - Phosphor icons mapped to category slugs (fallback icons for unmapped)
   - Horizontal scroll with CSS scroll-snap or Embla
   - Optional promo banner slot (can be empty initially)
   - Quick filter pills with common filters

2. **Update Index.tsx** to include the new section

3. **Add icon mapping** - Create a utility to map category slugs to Phosphor icons

4. **Style with your design system**:
   - Card backgrounds with subtle gradients
   - Gold accent on hover states
   - Smooth scroll animations
   - Mobile-optimized touch targets

---

## Mobile vs Desktop Layout

| Element | Mobile | Desktop |
|---------|--------|---------|
| Category bubbles | Scrollable row, 6 visible | Full grid, all visible |
| Promo banner | Full width carousel | Contained with max-width |
| Filter pills | Scrollable row | May show all or scroll |
| Overall padding | Compact (py-8) | Generous (py-16) |

---

## Dependencies

- Uses existing Embla carousel (already installed)
- Uses existing `useCategories` hook from modules
- Phosphor icons (already installed)
- No new packages needed

