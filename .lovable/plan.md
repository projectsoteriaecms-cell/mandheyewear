

# Luxurious Designer Frames Promotional Card Redesign

## Current Issues

1. **Card is too compact** - Current `p-6 lg:p-10` with `md:grid-cols-5` layout makes it feel cramped
2. **Weak visual impact** - The featured product image is small (48x48 w-48 h-48) and uses a product with white background
3. **Generic design** - Needs more sophisticated luxury feel (think Cartier, Gucci brand ads)
4. **Poor image selection** - Currently pulling the first product, which may not be the most luxurious

---

## The Solution: Full-Width Luxury Banner

Transform this into a **tall, square-ish hero card** (aspect ratio ~16:9 or closer to square on mobile) with:

### Visual Design Concept

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░                                                                               ░░░ │
│  ░░░                        ╔═══════════════════╗                                  ░░░ │
│  ░░░   ✨ Exclusive         ║                   ║                                  ░░░ │
│  ░░░                        ║    [CARTIER]      ║                                  ░░░ │
│  ░░░   2026 Designer        ║    [DESIGNER]     ║                                  ░░░ │
│  ░░░   Collection           ║    [FRAME]        ║   ← LARGE floating frame         ░░░ │
│  ░░░                        ║    [IMAGE]        ║     with subtle animation        ░░░ │
│  ░░░   Curated luxury       ║                   ║                                  ░░░ │
│  ░░░   eyewear              ╚═══════════════════╝                                  ░░░ │
│  ░░░                                                                               ░░░ │
│  ░░░   [Explore Collection →]                                                      ░░░ │
│  ░░░                                                                               ░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                                          │
│                    RICH BLUE GRADIENT + GOLD ACCENT ELEMENTS                            │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Card Size & Layout

**Current:**
- `grid md:grid-cols-5` with `p-6 lg:p-10` 
- Compact rectangular shape

**New:**
- **Min-height: 320px on mobile, 400px on desktop** (near-square feel)
- **Full container width** with centered content
- **Two-column layout on desktop** (50/50 split for text + image)
- **Stacked on mobile** with image positioned behind text (overlay style)

### 2. Background Treatment

Sophisticated blue gradient with luxury accents:

```tsx
className="relative overflow-hidden rounded-3xl min-h-[320px] md:min-h-[400px] 
           bg-gradient-to-br from-primary via-primary/95 to-primary/80"
```

Add layered decorative elements:
- **Golden shimmer sweep** across the top (using `animate-shimmer-sweep`)
- **Glassmorphic orbs** in corners
- **Subtle gold border accent** on the frame/card

### 3. Featured Product Selection

**Change the query** to fetch specifically:
- Designer brands (CARTIER, GUCCI, etc.) 
- Higher-priced items (they're typically better photographed)
- Filter for products with clean images

```typescript
// Prioritize luxury brands for the banner
const { data: featuredProduct } = useQuery({
  queryKey: ["featured-designer-product"],
  queryFn: async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, price, image_url")
      .eq("is_active", true)
      .eq("item_type", "frames")
      .in("brand", ["CARTIER", "GUCCI", "DIOR", "VERSACE", "PRADA"])
      .not("image_url", "is", null)
      .order("price", { ascending: false })
      .limit(1)
      .single();
    return data;
  },
});
```

This ensures we get a high-end designer frame like the **GUCCI 785K** or **CARTIER**.

### 4. Image Presentation

**Current:** `w-48 h-48` (small)

**New:**
- **Larger dimensions:** `w-64 h-64 md:w-80 md:h-80`
- **Drop shadow enhancement:** `drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]`
- **Elegant float animation:** `animate-float-slow`
- **Remove background effect:** Apply `mix-blend-multiply` for PNGs with white backgrounds, or use image with transparent background
- **3D tilt effect on hover:** Subtle perspective rotation

### 5. Typography Hierarchy

Premium, elegant text styling:

```tsx
// Badge
<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                bg-accent/20 backdrop-blur-sm border border-accent/30 
                text-accent text-xs font-medium tracking-wider uppercase">
  <Sparkle weight="fill" className="w-4 h-4" />
  Exclusive Collection
</span>

// Main heading - larger, more impactful
<h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-white 
               leading-tight tracking-tight">
  2026 Designer Frames
</h3>

// Subtext with luxury feel
<p className="text-white/70 text-base md:text-lg max-w-sm font-light">
  Curated luxury eyewear from the world's most prestigious houses
</p>
```

### 6. CTA Button Enhancement

```tsx
<Button 
  className="bg-accent hover:bg-accent/90 text-accent-foreground 
             px-8 py-6 text-base font-medium shadow-lg shadow-accent/30
             group transition-all duration-300 hover:shadow-xl hover:shadow-accent/40"
>
  Explore Collection
  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
</Button>
```

### 7. Decorative Luxury Elements

```tsx
{/* Golden shimmer line at top */}
<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

{/* Animated gold orbs */}
<div className="absolute top-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" />
<div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
<div className="absolute top-1/2 right-1/4 w-20 h-20 bg-accent/5 rounded-full blur-2xl animate-float-gentle" />

{/* Luxury corner accent */}
<div className="absolute top-4 right-4 w-12 h-12 border border-accent/20 rounded-lg opacity-50" />
<div className="absolute bottom-4 left-4 w-8 h-8 border border-white/10 rounded opacity-30" />
```

---

## Mobile Design

On mobile, the banner becomes:

```text
┌─────────────────────────────────┐
│                                  │
│   [DESIGNER FRAME IMAGE]         │
│   Large, centered, floating      │
│                                  │
├─────────────────────────────────┤
│                                  │
│   ✨ Exclusive Collection        │
│                                  │
│   2026 Designer                  │
│   Frames                         │
│                                  │
│   Curated luxury eyewear...      │
│                                  │
│   [Explore Collection →]         │
│                                  │
└─────────────────────────────────┘
```

- Image moves above text content
- Full-width container
- Touch-friendly button

---

## File Changes

### `src/components/home/QuickDiscovery.tsx`

**Lines 108-156** - Complete redesign of the Promotional Banner section:

1. **New query** for featured designer product (separate from trending)
2. **Increased dimensions** - min-height 320px mobile / 400px desktop
3. **Enhanced gradient** with luxury decorative elements
4. **Larger typography** - text-4xl to text-5xl heading
5. **Bigger product image** - w-64 to w-80 with premium drop shadow
6. **Refined animations** using existing keyframes (float-slow, shimmer, pulse-glow)
7. **Mobile-first layout** with stacked content and image

---

## Expected Visual Result

| Aspect | Before | After |
|--------|--------|-------|
| **Height** | ~200px | **320-400px** (near-square) |
| **Product Image** | 192×192px, small | **256-320px**, prominent |
| **Text Size** | text-2xl/3xl | **text-3xl/4xl/5xl** |
| **Background** | Simple gradient | **Rich gradient + gold accents + shimmer** |
| **Featured Product** | First product (random) | **Designer brand (Cartier/Gucci)** |
| **Animations** | Basic float | **Float + shimmer + glow pulse** |
| **Feel** | Generic | **Luxurious, sophisticated, high-end** |

