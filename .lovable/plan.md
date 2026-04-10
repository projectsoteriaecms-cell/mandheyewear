

## Fix: Keep "OUTLOOK" as One Unbreakable Unit

### Problem
The "OUTLOOK" text is rendered as `OUTL` + `<GlassesOO>` + `K` as separate inline elements. The browser can line-break between these parts, splitting the word across lines.

### Fix — `HeroSection.tsx`

**Line 227**: Add `whitespace-nowrap` to the OUTLOOK wrapper span to prevent any line-breaking within the word:

```tsx
<span className="inline-block overflow-hidden tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">
```

This single class addition ensures "OUTL👓K" always stays together as one unit on all viewports, never splitting across lines.

