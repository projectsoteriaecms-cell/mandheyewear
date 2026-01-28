

# Dual-Theme Logo Implementation Plan

## Summary

You want:
- **Soteria Logo**: Navy blue in light mode, golden yellow in dark mode (using the uploaded `Untitled_design_5.png`)
- **M&H Logo**: Clean version without the "EYEWEAR & OPTICALS" tagline (using the uploaded `mandh.png` but cropped/modified)

## Logo Strategy

| Mode | Soteria Logo | M&H Logo |
|------|--------------|----------|
| Light Mode | Original navy blue (`soteria-logo.png`) | Golden M&H (without tagline) |
| Dark Mode | Golden yellow (`Untitled_design_5.png`) | Golden M&H (without tagline) |

## Implementation Approach

Since CSS filters cannot change blue to gold (only invert), we need **two separate logo files** for Soteria and display them conditionally based on theme.

For M&H, the uploaded `mandh.png` includes "EYEWEAR & OPTICALS" tagline. You mentioned you want the version "without echo" - this means we need a cropped version showing just the M&H symbol and letters.

## Files to Create/Copy

1. **Copy golden Soteria logo**: `user-uploads://Untitled_design_5.png` → `src/assets/soteria-logo-gold.png`
2. **Copy M&H logo**: `user-uploads://mandh.png` → `src/assets/mh-logo-gold.png`

## Files to Modify

### 1. `src/components/navigation/MobileTopBar.tsx`

**Imports (add new gold logos):**
```tsx
import soteriaLogo from "@/assets/soteria-logo.png";
import soteriaLogoGold from "@/assets/soteria-logo-gold.png";
import mhLogo from "@/assets/mh-logo.png";
import mhLogoGold from "@/assets/mh-logo-gold.png";
```

**Center Logo Section (lines 191-195):**
Show different logos based on `isDark` state:
```tsx
<Link to="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
  <img 
    src={isDark ? soteriaLogoGold : soteriaLogo} 
    alt="Soteria" 
    className="h-7 w-auto" 
  />
  <span className="text-border text-lg">|</span>
  <img 
    src={mhLogoGold} 
    alt="M&H" 
    className="h-7 w-auto" 
  />
</Link>
```

**Hamburger Menu Panel (lines 112-116):**
Since this panel has a primary (dark) background, we show the gold logos here:
```tsx
<div className="flex items-center gap-2">
  <img src={soteriaLogoGold} alt="Soteria" className="h-6 w-auto" />
  <span className="text-primary-foreground/40">|</span>
  <img src={mhLogoGold} alt="M&H" className="h-6 w-auto" />
</div>
```

### 2. `src/components/navigation/MainNav.tsx`

**Imports:**
```tsx
import soteriaLogo from "@/assets/soteria-logo.png";
import soteriaLogoGold from "@/assets/soteria-logo-gold.png";
import mhLogoGold from "@/assets/mh-logo-gold.png";
```

**Logo Section (lines 60-72):**
Use a hook or CSS approach to conditionally show logos:
```tsx
<img 
  src={soteriaLogo} 
  alt="Soteria Eye Clinic" 
  className="h-10 w-auto dark:hidden"
/>
<img 
  src={soteriaLogoGold} 
  alt="Soteria Eye Clinic" 
  className="h-10 w-auto hidden dark:block"
/>
<span className="text-border text-2xl font-light">|</span>
<img 
  src={mhLogoGold} 
  alt="M&H Eyewear" 
  className="h-10 w-auto"
/>
```

## Note About M&H Logo

The uploaded `mandh.png` includes "EYEWEAR & OPTICALS" text at the bottom. If you want a version without this tagline, you'll need to provide a cropped version or I can work with what's available. Currently, I'll use the full logo and we can adjust if needed.

## Visual Result

| Location | Light Mode | Dark Mode |
|----------|------------|-----------|
| Mobile Center Bar | Navy blue Soteria + Gold M&H | Gold Soteria + Gold M&H |
| Hamburger Menu Panel | Gold Soteria + Gold M&H | Gold Soteria + Gold M&H |
| Desktop Nav | Navy blue Soteria + Gold M&H | Gold Soteria + Gold M&H |

