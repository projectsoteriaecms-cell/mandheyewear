
# Logo Fix: Restore Natural Colors with Proper Dark Mode

## Issue Summary

The current implementation uses `brightness-0 dark:invert` which makes the Soteria logo **black in light mode** instead of its natural **blue color**. The dark mode appearance also needs improvement.

## What You Want

| Mode | Soteria Logo | M&H Logo |
|------|--------------|----------|
| Light Mode | Original blue color | Original color |
| Dark Mode | Clean white version | Clean white version |

## Solution

Use the **original blue Soteria logo** from `src/assets/soteria-logo.png` with a simple `dark:invert` filter:

- **Light mode**: No filter applied → Shows natural blue color
- **Dark mode**: `invert` filter → Converts blue to white cleanly

## File to Change

**`src/components/navigation/MobileTopBar.tsx`** (line 192-194)

Change from:
```jsx
<img src="/lovable-uploads/c6bc733f-cada-4635-b01a-c1aa00c8ba32.png" alt="Soteria" className="h-7 w-auto brightness-0 dark:invert" />
<img src={mhLogo} alt="M&H" className="h-7 w-auto brightness-0 dark:invert" />
```

Change to:
```jsx
<img src={soteriaLogo} alt="Soteria" className="h-7 w-auto dark:invert" />
<img src={mhLogo} alt="M&H" className="h-7 w-auto dark:invert" />
```

## Result

- **Light mode**: Both logos show in their original brand colors (blue Soteria, original M&H)
- **Dark mode**: Both logos cleanly inverted to white for visibility on dark background
- No more black logos in light mode
- Better quality inversion in dark mode (direct invert without brightness manipulation)
