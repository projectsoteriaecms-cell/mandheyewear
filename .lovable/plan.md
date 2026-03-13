

## Fix Logo Contrast in Mobile Hamburger Menu

### Problem
The gold M&H logo (`mh-logo-gold.png`) doesn't contrast well against the blue/primary background in the hamburger menu header.

### Approach
There's no white logo asset available, but we can use the dark logo (`mh-logo.png`) with a CSS `brightness(0) invert(1)` filter to render it as pure white. This gives excellent contrast on the blue primary background without needing a new image file.

### Change

**`src/components/navigation/MobileTopBar.tsx`** — In the Sheet header, switch from `mhLogoGold` to `mhLogo` and add an invert filter:

```tsx
<img 
  src={mhLogo} 
  alt="M&H Eyewear" 
  className="h-12 w-auto brightness-0 invert" 
/>
```

Single line change, one file.

