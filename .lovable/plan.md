

# Deeper Blue Banner with Template Frame Slideshow

## Changes Overview

### 1. Deeper Blue Background

**Current**: The banner uses `bg-gradient-to-br from-primary via-primary/95 to-primary/80` which is `HSL 210 85% 40%` (medium blue)

**New**: Create a deeper, richer navy-blue gradient that:
- Is darker than the current primary (`210 85% 40%`)
- Lighter than the page background in dark mode (`220 25% 8%`)
- Has excellent contrast with white text and gold accents

**Proposed color values:**
```
from-[hsl(215_50%_22%)]  →  Deep navy blue
via-[hsl(218_45%_18%)]   →  Darker mid-transition
to-[hsl(220_40%_15%)]    →  Darkest edge (but still lighter than bg)
```

This creates a rich, sophisticated navy that:
- Feels luxurious and premium
- Has strong contrast with white text
- Works well with gold accents
- Is distinctly different from the page background

### 2. Replace Database Products with Template Frames

**Current**: Fetches luxury products from database using `useQuery`

**New**: Use the 4 static template frame images you already have:
- `src/assets/frame-1.jpg` - Rose gold round frames
- `src/assets/frame-2.jpg` - Black square frames  
- `src/assets/frame-3.jpg` - Tortoise cat-eye frames
- `src/assets/frame-4.jpg` - Gold aviator frames

These are the exact frames from your uploaded reference - professionally photographed with marble/clean backgrounds that look sophisticated.

**Implementation:**
```typescript
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const SHOWCASE_FRAMES = [
  { id: 1, src: frame1, name: "Classic Round", style: "Timeless Elegance" },
  { id: 2, src: frame2, name: "Modern Square", style: "Contemporary Edge" },
  { id: 3, src: frame3, name: "Bold Cat-Eye", style: "Statement Maker" },
  { id: 4, src: frame4, name: "Aviator", style: "Iconic Style" },
];
```

### 3. Visual Comparison

**Background Gradient Change:**
| Element | Current | New |
|---------|---------|-----|
| Start color | `HSL 210 85% 40%` (bright blue) | `HSL 215 50% 22%` (deep navy) |
| Mid color | 95% opacity of above | `HSL 218 45% 18%` (darker navy) |
| End color | 80% opacity of above | `HSL 220 40% 15%` (richest navy) |
| Feel | Corporate blue | Luxurious deep navy |

**Slideshow Change:**
| Aspect | Current | New |
|--------|---------|-----|
| Source | Database products | Static template images |
| Images | Product photos (variable quality) | Professional frame photos |
| Count | Up to 5 luxury brand items | 4 curated showcase frames |
| Labels | Brand names (CARTIER, etc.) | Style descriptors |

---

## Technical Changes

### File: `src/components/home/QuickDiscovery.tsx`

1. **Import static frame images** at the top of the file
2. **Remove the `luxuryFrames` query** (no longer fetching from database)
3. **Create static `SHOWCASE_FRAMES` array** with the 4 template images
4. **Update the gradient** to use the deeper navy blue values
5. **Update the carousel** to map over `SHOWCASE_FRAMES` instead of `luxuryFrames`
6. **Adjust decorative elements** for better contrast on darker background

### Code Changes Summary:

**Line ~1-22**: Add frame imports
```typescript
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";
```

**Lines ~34-36**: Define showcase frames array
```typescript
const SHOWCASE_FRAMES = [
  { id: 1, src: frame1, name: "Classic Round", style: "Timeless Elegance" },
  { id: 2, src: frame2, name: "Modern Square", style: "Contemporary Edge" },
  { id: 3, src: frame3, name: "Bold Cat-Eye", style: "Statement Maker" },
  { id: 4, src: frame4, name: "Aviator", style: "Iconic Style" },
];
```

**Lines ~69-90**: Remove the `luxuryFrames` useQuery hook entirely

**Line ~156**: Update gradient to deeper navy
```typescript
className="... bg-gradient-to-br from-[hsl(215_50%_22%)] via-[hsl(218_45%_18%)] to-[hsl(220_40%_15%)]"
```

**Lines ~200-260**: Update carousel to use `SHOWCASE_FRAMES`
```typescript
{SHOWCASE_FRAMES.map((frame) => (
  <CarouselItem key={frame.id}>
    <img src={frame.src} alt={frame.name} ... />
    <div className="badge">
      <span>{frame.style}</span>
    </div>
  </CarouselItem>
))}
```

---

## Expected Visual Result

| Aspect | Before | After |
|--------|--------|-------|
| Background | Bright corporate blue | Rich, deep navy blue |
| Contrast | Good | Excellent (darker bg, brighter gold) |
| Frame images | Database product photos | Professional template frames |
| Quality | Variable (depends on uploads) | Consistent, high-quality |
| Brand labels | "CARTIER", "GUCCI" | "Timeless Elegance", "Contemporary Edge" |
| Feel | Product catalog | Luxury showcase |

