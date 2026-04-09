

## Typography Switch: Syne Bold + DM Sans

Replace Cormorant Garamond (display) and Inter (body) with **Syne** and **DM Sans** for a bold, geometric, Gen Z-native feel.

### Changes

**1. `index.html`** — Swap Google Fonts import
- Replace `Cormorant+Garamond:wght@300;400;500;600;700` with `Syne:wght@400;500;600;700;800`
- Replace `Inter:wght@300;400;500;600;700` with `DM+Sans:wght@300;400;500;600;700`

**2. `tailwind.config.ts`** — Update font family definitions
- `font-display`: `['Syne', 'sans-serif']` (was Cormorant Garamond, serif)
- `font-body`: `['DM Sans', 'sans-serif']` (was Inter, sans-serif)

**3. `src/index.css`** — Update any hardcoded font-family references
- Change `'Cormorant Garamond'` → `'Syne'` and `'Inter'` → `'DM Sans'` in any CSS rules

No component files need updating — they all reference `font-display` and `font-body` utility classes which will automatically pick up the new fonts.

