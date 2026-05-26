## Problem

The "New Season / New Arrivals / Flash Deals" product strip under the hero (rendered by `HeroSection.tsx`, lines 467–523) is the only place where product thumbnails still ride on a dark `bg-muted` tile with `object-cover`. That crops the frame and removes the white backdrop, so the eyewear blends into the ink background instead of standing out like it does on the Shop cards, Featured Frames, and PDP.

## Fix

Convert each ticker tile to use the global `.product-surface` system (the same one shop cards, list cards, PDP, and Featured Frames already use), so the frame sits on a clean white tile with the contact shadow and the holistic 1.45× scale rule auto-applies.

### Single edit: `src/modules/storefront/components/home/HeroSection.tsx` (lines ~484–493)

Replace the image wrapper inside the product ticker map:

```text
Before:
<div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
  {product.image_url ? (
    <img ... className="... object-cover group-hover:scale-105 ..." />
  ) : (
    <div className="w-full h-full bg-cream/5" />
  )}
  ...badges
</div>

After:
<div className="relative aspect-square rounded-lg overflow-hidden mb-2">
  <div data-surface="card" className="product-surface absolute inset-0">
    {product.image_url ? (
      <img src={...} alt={...} />
    ) : (
      <div className="w-full h-full bg-white" />
    )}
  </div>
  ...badges (kept absolute, unchanged)
</div>
```

Key points:
- Remove `bg-muted` and `object-cover` — `.product-surface` already sets white bg, `object-contain`, padding, and the 1.45× scale.
- Keep `aspect-square`, rounded corners, and the discount/label badges exactly as they are (they sit above via `absolute`).
- Drop the manual `group-hover:scale-105` since `.product-surface[data-surface="card"]:hover img` already scales to 1.55×.

### Why this is the right surface

Per `mem://design/framework-blueprint` and the global rule in `src/index.css`, every product thumbnail should opt into `.product-surface` with a `data-surface` tag so the white tile + contact shadow + frame-scale stay consistent across PDP, shop grid, list, featured, and now the hero ticker.

## Out of scope

- No changes to hero copy, countdown, banner colors, ticker animation, or product query.
- No changes to other components — `.product-surface` already handles the visuals globally.
- No image regeneration.
