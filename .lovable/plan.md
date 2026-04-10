

## Reduce OUTLOOK Tracking — Remove Excessive Stretch

### Problem
The "OUTLOOK" line has `tracking-[0.15em] sm:tracking-[0.2em]` which makes it look too stretched and unnatural.

### Fix — `HeroSection.tsx`

**Line 227**: Remove the extra letter-spacing from the OUTLOOK wrapper. Change:
```tsx
tracking-[0.15em] sm:tracking-[0.2em]
```
to:
```tsx
tracking-[0.04em] sm:tracking-[0.06em]
```

This keeps a subtle, elegant stretch without the over-extended look. The `whitespace-nowrap` stays to keep "OUTLOOK" as one unit.

