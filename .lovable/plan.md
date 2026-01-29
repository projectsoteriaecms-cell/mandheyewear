

# Luxurious Frame Slideshow for 2026 Designer Frames Banner

## What You Want

Replace the static single product image with a **sophisticated auto-advancing slideshow** of luxury frames that:
- Shows multiple designer frames cycling through
- Frames appear clean without distracting backgrounds
- Creates an elegant, high-end visual experience
- Feels luxurious and professional

---

## The Solution: Elegant Cross-Fade Carousel

Transform the right side of the promotional banner into an auto-advancing slideshow featuring your top luxury frames.

### Visual Concept

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░                                                                           ░░░ │
│  ░░░   ✨ Exclusive Collection        ┌───────────────────────────────┐        ░░░ │
│  ░░░                                  │                               │        ░░░ │
│  ░░░   2026 Designer                  │    [CARTIER FRAME]            │        ░░░ │
│  ░░░   Frames                         │                               │        ░░░ │
│  ░░░                                  │    cross-fades to...          │ ← AUTO  ░░░ │
│  ░░░   Curated luxury...              │                               │   SLIDE ░░░ │
│  ░░░                                  │    [GUCCI FRAME]              │   (4s)  ░░░ │
│  ░░░   [Explore Collection →]         │                               │        ░░░ │
│  ░░░                                  └───────────────────────────────┘        ░░░ │
│  ░░░                                         ● ○ ○ ○ ○  ← dot indicators       ░░░ │
│  ░░░                                                                           ░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                                      │
│                         RICH BLUE GRADIENT BACKGROUND                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Fetch Multiple Luxury Frames

Change the query to fetch **5-6 top luxury products** instead of just one:

```typescript
// Fetch multiple luxury frames for slideshow
const { data: luxuryFrames } = useQuery({
  queryKey: ["luxury-frames-slideshow"],
  queryFn: async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, price, image_url")
      .eq("is_active", true)
      .eq("item_type", "frames")
      .not("image_url", "is", null)
      .order("price", { ascending: false })
      .limit(10);

    // Filter for luxury brands first, then highest priced
    const luxuryProducts = data?.filter(p => 
      LUXURY_BRANDS.some(brand => p.brand?.toUpperCase().includes(brand))
    ) || [];
    
    // Return luxury brands or top 5 highest priced
    return luxuryProducts.length >= 3 ? luxuryProducts.slice(0, 5) : data?.slice(0, 5) || [];
  },
});
```

### 2. Use Embla Carousel with Autoplay

Leverage the existing carousel component with autoplay plugin:

```typescript
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

// Track current slide for indicators
const [api, setApi] = useState<CarouselApi>();
const [current, setCurrent] = useState(0);

useEffect(() => {
  if (!api) return;
  setCurrent(api.selectedScrollSnap());
  api.on("select", () => setCurrent(api.selectedScrollSnap()));
}, [api]);
```

### 3. Slideshow Configuration

- **Auto-advance every 4 seconds** - enough time to appreciate each frame
- **Infinite loop** - seamlessly cycles back to first frame
- **Smooth cross-fade transition** - elegant, not jarring
- **Pause on hover** - user interaction pauses the carousel

```typescript
<Carousel
  setApi={setApi}
  opts={{ loop: true, align: "center" }}
  plugins={[
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  ]}
  className="w-full h-full"
>
```

### 4. Frame Image Treatment

Each frame displayed with sophisticated styling:

```tsx
<CarouselItem className="flex items-center justify-center">
  <div className="relative">
    {/* Soft glow behind frame */}
    <div className="absolute inset-0 bg-accent/15 rounded-full blur-3xl scale-90" />
    
    {/* Frame image - large and floating */}
    <img 
      src={frame.image_url}
      alt={frame.name}
      className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 
                 object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.5)]
                 animate-float-gentle"
    />
    
    {/* Brand badge below */}
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 
                    px-5 py-2 bg-white/10 backdrop-blur-md rounded-full 
                    border border-white/20">
      <span className="text-white/90 text-sm font-medium tracking-widest uppercase">
        {frame.brand}
      </span>
    </div>
  </div>
</CarouselItem>
```

### 5. Elegant Dot Indicators

Subtle indicators showing which frame is currently displayed:

```tsx
{/* Slide indicators */}
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
  {luxuryFrames.map((_, index) => (
    <button
      key={index}
      onClick={() => api?.scrollTo(index)}
      className={cn(
        "w-2 h-2 rounded-full transition-all duration-300",
        current === index 
          ? "bg-accent w-6" // Active: gold, elongated pill
          : "bg-white/30 hover:bg-white/50"
      )}
    />
  ))}
</div>
```

---

## Luxury Frames Available in Database

Your current premium inventory for the slideshow:

| Brand | Frame | Price |
|-------|-------|-------|
| CARTIER | CT0344O 003 Rimless | ₦2,376,000 |
| GUCCI | GG1504O 006 | ₦785,000 |
| POLAROID | PLD D379 | ₦155,000 |
| CARTIER | 30104 C9 | ₦130,000 |
| CARTIER | CT0563S C2 | ₦130,000 |

These will cycle through automatically, showcasing your premium collection.

---

## Technical Changes

### File: `src/components/home/QuickDiscovery.tsx`

1. **Import Autoplay plugin and carousel components**
2. **Change query** from single product to multiple luxury frames
3. **Replace static image** with Embla Carousel + Autoplay
4. **Add state** for tracking current slide (for dot indicators)
5. **Add dot indicators** with gold accent for active slide
6. **Increase image size** to w-96 for more visual impact

---

## Animation & Transitions

| Element | Animation | Duration |
|---------|-----------|----------|
| Slide transition | Smooth cross-fade | 400ms |
| Auto-advance | Loop | Every 4 seconds |
| Frame float | `animate-float-gentle` | 6s infinite |
| Dot indicator | Width expansion | 300ms |
| Glow pulse | `animate-pulse-soft` | 3s infinite |

---

## Mobile Behavior

- Slideshow works on mobile with touch swipe support
- Frames scale responsively (w-56 mobile → w-96 desktop)
- Dot indicators positioned at bottom of card
- Auto-advance continues on mobile

---

## Expected Result

A sophisticated, luxurious slideshow that:

1. **Showcases multiple designer frames** - not just one static image
2. **Auto-advances smoothly** - elegant cross-fade transitions
3. **Uses clean product images** - large, prominent with drop shadows
4. **Includes brand badges** - CARTIER, GUCCI labels beneath each frame
5. **Has subtle dot navigation** - gold accented indicators
6. **Feels premium** - sophisticated animations, not flashy

