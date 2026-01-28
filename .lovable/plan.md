
# Logo Consistency Update Plan

## What You're Asking For

You want the Soteria logo in the **middle top section** of the mobile header to match the **white logo style** used in the hamburger menu panel (left side). 

## Current Situation

| Location | Logo File | CSS Treatment | Result |
|----------|-----------|---------------|--------|
| Hamburger Menu (left panel header) | Gold logo (`/lovable-uploads/...`) | `brightness-0 invert` | Clean white logo |
| Center Top Bar | Blue logo (`soteria-logo.png`) | `dark:invert dark:brightness-[1.2]` | Blue in light mode, inverted in dark mode |

## What I'll Do

Update the **MobileTopBar.tsx** center logo section to use the same gold Soteria logo file with appropriate CSS filters so it displays consistently across light and dark modes.

**For the center logo, I'll use:**
- The same gold logo file currently used in hamburger menu
- Smart CSS filter that makes it work in both themes:
  - **Light mode**: Apply filter to make it dark/black (readable on white background)
  - **Dark mode**: Apply filter to make it white/light (readable on dark background)

## Files to Change

| File | Change |
|------|--------|
| `src/components/navigation/MobileTopBar.tsx` | Update line 192 to use the gold logo with proper theme-aware CSS filters |

## Additional Considerations

- The **MainNav.tsx** (desktop) and **MobileNav.tsx** also use the blue Soteria logo - should these be updated for consistency later?
- Once we finish Soteria logo, we'll tackle the M&H logo in a follow-up

## Technical Details

The center logo will be updated from:
```jsx
<img src={soteriaLogo} alt="Soteria" className="h-7 w-auto dark:invert dark:brightness-[1.2]" />
```

To use the gold logo with theme-aware filtering:
```jsx
<img 
  src="/lovable-uploads/c6bc733f-cada-4635-b01a-c1aa00c8ba32.png" 
  alt="Soteria" 
  className="h-7 w-auto brightness-0 dark:invert" 
/>
```

This will make the gold logo appear black in light mode and white in dark mode - matching the hamburger panel behavior.
