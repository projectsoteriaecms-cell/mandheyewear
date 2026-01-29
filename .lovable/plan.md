

# Complete Redesign: Quick Discovery Section

## Problems Identified

1. **Generic Icons** - Using airplane, cat, circle icons is unprofessional and confusing
2. **Empty Promo Card** - The 2026 banner has no visual interest, no glasses imagery
3. **Missing Brand Colors** - Blue (your dominant clinical color) is barely used
4. **Duplicate Purpose** - Two "Shop by Category" sections creates confusion

---

## The Solution: A Bold, Zenni-Inspired Transformation

We'll create a completely redesigned section called **QuickDiscovery** that looks professional, uses real imagery, and integrates your blue/gold brand colors.

---

## New Design Structure

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   QUICK DISCOVERY SECTION (Blue gradient background)                           │
│                                                                                 │
│   ┌──────────────────────────────────────────────────────────────────────────┐ │
│   │ TRENDING FRAMES - Actual product thumbnails with real images             │ │
│   │                                                                          │ │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  →      │ │
│   │  │[PRODUCT]│  │[PRODUCT]│  │[PRODUCT]│  │[PRODUCT]│  │[PRODUCT]│        │ │
│   │  │ IMAGE   │  │ IMAGE   │  │ IMAGE   │  │ IMAGE   │  │ IMAGE   │        │ │
│   │  │         │  │         │  │         │  │         │  │         │        │ │
│   │  │ ₦55,000 │  │₦130,000 │  │₦155,000 │  │₦785,000 │  │ ₦30,000 │        │ │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │ │
│   └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│   ┌──────────────────────────────────────────────────────────────────────────┐ │
│   │ PROMOTIONAL BANNER - Rich visual with glasses imagery                    │ │
│   │                                                                          │ │
│   │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│   │  │                                                    🕶️              │ │ │
│   │  │   NEW 2026 COLLECTION                         [floating glasses]  │ │ │
│   │  │   Premium Designer Frames                                          │ │ │
│   │  │   Curated by M&H Eyewear experts                                  │ │ │
│   │  │                                           [Shop Collection →]      │ │ │
│   │  │   Blue gradient background with decorative eyewear silhouettes    │ │ │
│   │  └────────────────────────────────────────────────────────────────────┘ │ │
│   └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│   ┌──────────────────────────────────────────────────────────────────────────┐ │
│   │ QUICK FILTERS - Refined pills with blue/gold accents                     │ │
│   │                                                                          │ │
│   │  [🔥 Best Sellers]  [✨ New Arrivals]  [💰 Under ₦50k]  [🎯 Try-On] →   │ │
│   └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Trending Frames Row (Real Products)

**What changes:**
- Replace icon circles with **actual product images** from the database
- Show frames from products that have `image_url` defined
- Each card shows: product photo, brand name, price
- Rounded corners (not full circles) - more modern
- Blue border on hover, gold price accent

**Data source:** Fetching from products table where `image_url IS NOT NULL AND item_type = 'frames'`

**Styling:**
- Horizontally scrollable with snap points
- White background cards on subtle blue tinted section background
- Blue glow on hover
- Price displayed in gold (accent color)

---

### 2. Promotional Banner (Designed Card)

**What changes:**
- Full-width card with **blue gradient background** (primary brand color)
- Floating eyewear silhouettes/decorative elements (SVG or CSS)
- Actual glasses imagery or a hero product image positioned right
- Clear hierarchy: badge → headline → subtext → CTA
- Gold accent button

**Design approach:**
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  [GLASSES IMAGE]   │
│ ░░░                                              ░░░░                    │
│ ░░░  ✨ New Collection                           ░░░░    🕶️              │
│ ░░░                                              ░░░░                    │
│ ░░░  2026 Designer Frames                        ░░░░                    │
│ ░░░  Premium eyewear curated by experts          ░░░░                    │
│ ░░░                                              ░░░░                    │
│ ░░░  [Shop Collection →]                         ░░░░                    │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                    │
└──────────────────────────────────────────────────────────────────────────┘
        BLUE GRADIENT BACKGROUND                    PRODUCT/GLASSES IMAGE
```

**Color usage:**
- Background: Primary blue gradient (`from-primary via-primary/90 to-primary/80`)
- Text: White
- Button: Gold (accent)
- Decorative orbs: Gold/white glows

---

### 3. Quick Filter Pills (Enhanced)

**What changes:**
- Better icons from Phosphor (no abstract ones)
- Blue border with gold hover state
- Price-specific filters for Nigerian market (Under ₦30k, ₦50k, etc.)
- Add "Virtual Try-On" filter (differentiator)

**Filter options:**
- Best Sellers (TrendUp icon)
- New Arrivals (Sparkle icon)
- Under ₦50k (CurrencyCircleDollar icon)
- Virtual Try-On (Camera icon)
- On Sale (Tag icon)

---

## Files to Modify

### 1. `src/components/home/QuickCategories.tsx` → Rename to `QuickDiscovery.tsx`

Complete rewrite with:
- Trending products row (fetching real product data)
- Rich promotional banner with blue gradient
- Enhanced filter pills

### 2. `src/components/home/index.ts`

- Update export from `QuickCategories` to `QuickDiscovery`

### 3. `src/pages/Index.tsx`

- Update import to use `QuickDiscovery`

---

## Technical Details

### Product Data Query

```typescript
// Fetch trending products with images
const { data: products } = useQuery({
  queryKey: ["trending-products"],
  queryFn: async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, price, image_url")
      .eq("is_active", true)
      .eq("item_type", "frames")
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(8);
    return data;
  },
});
```

### Promotional Banner Styling

```tsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-primary/85">
  {/* Decorative orbs */}
  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
  <div className="absolute -bottom-10 left-1/4 w-32 h-32 bg-accent/20 rounded-full blur-xl" />
  
  {/* Content grid */}
  <div className="grid md:grid-cols-5 gap-6 p-6 lg:p-10">
    <div className="md:col-span-3 space-y-4">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-medium">
        <Sparkle weight="fill" className="w-3.5 h-3.5 text-accent" />
        New Collection
      </span>
      <h3 className="text-2xl lg:text-3xl font-display font-semibold text-white">
        2026 Designer Frames
      </h3>
      <p className="text-white/80 text-sm lg:text-base max-w-md">
        Premium eyewear curated by M&H experts for the discerning customer
      </p>
      <Button className="bg-accent hover:bg-accent/90 text-accent-foreground mt-2">
        Shop Collection <ArrowRight />
      </Button>
    </div>
    
    {/* Hero product image */}
    <div className="md:col-span-2 relative hidden md:flex items-center justify-center">
      <img 
        src={featuredProduct?.image_url} 
        alt="Featured Frame"
        className="w-48 h-48 object-contain drop-shadow-2xl animate-float"
      />
    </div>
  </div>
</div>
```

---

## Visual Comparison

| Element | Before | After |
|---------|--------|-------|
| Section Background | Light gray (`bg-muted/30`) | Subtle blue tint or white with blue accents |
| Category Icons | Abstract Phosphor icons (Airplane, Cat) | **Real product photos** from database |
| Promo Banner | Text-only with faint gradient | **Rich blue gradient** with floating glasses image |
| Filter Pills | Gray borders | Blue borders with gold hover |
| Brand Identity | Neutral | **Blue dominant** with gold accents |

---

## Mobile Experience

- Trending products: Horizontal scroll with snap, 2 visible at a time
- Promo banner: Stack vertically, glasses image above content
- Filter pills: Horizontal scroll, full-width touch targets

---

## Expected Result

A professional, brand-aligned quick discovery section that:

1. Uses **blue as the dominant color** (your clinical trust color)
2. Shows **real product imagery** instead of generic icons
3. Features a **visually designed promo card** with glasses imagery
4. Feels **premium and mature** - not cartoonish
5. **Eliminates redundancy** with the CategoryCards section below

