

## Optimize GlassesOO — Double Lens Frames, No Temples

### What's changing

The current `GlassesOO` component renders a single rounded rectangle with the hero image inside it. The user wants it to look like **two side-by-side glasses lenses** (like actual spectacle frames without temples) — each lens showing the hero image.

### Changes — `HeroSection.tsx`

**Replace the `GlassesOO` component** (lines 9-17) with a new design:

1. **Two circular/oval lenses side by side** — Two `<span>` elements styled as circles (or slight ovals), each containing the hero image via `object-cover`, connected by a small bridge bar in the middle
2. **No temples** — Just the front frame: left lens + bridge + right lens
3. **Styling**: Each lens gets a `rounded-full` border (gold accent), the bridge is a thin horizontal bar connecting them, and each lens clips the hero image independently
4. **Responsive sizing**: The overall width stays proportional to the font size using `em` units so it scales with the headline text on all viewports

### Rough structure
```tsx
const GlassesOO = ({ src, className }) => (
  <span className={`relative inline-flex items-center align-middle ${className}`}>
    {/* Left lens */}
    <span className="relative w-[0.45em] h-[0.45em] rounded-full overflow-hidden border-2 border-mh-gold/50">
      <img src={src} className="absolute inset-0 w-full h-full object-cover" />
    </span>
    {/* Bridge */}
    <span className="w-[0.08em] h-[0.06em] bg-mh-gold/50 -mx-[1px]" />
    {/* Right lens */}
    <span className="relative w-[0.45em] h-[0.45em] rounded-full overflow-hidden border-2 border-mh-gold/50">
      <img src={src} className="absolute inset-0 w-full h-full object-cover" />
    </span>
  </span>
);
```

- Update the `GlassesOO` usage at line 233-236 to adjust the wrapper sizing (`w-[1.1em]` → wider to accommodate two lenses)
- Fine-tune border thickness and lens proportions for both mobile (390px) and desktop viewports

