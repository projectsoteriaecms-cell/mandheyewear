

## Copy & Vibe Overhaul — African Editorial Identity

### The Problem
Current copy ("where vision lives — now") is generic and could belong to any global eyewear brand. It has no cultural texture, no double-meaning wordplay, and doesn't speak to an African audience. The background feels flat.

---

### Copy Direction (Refined from your picks)

**Hero Headline (two-line reveal):**
```
A clearer satisfying outlook
on life.
```
— "Outlook" is a triple pun: (1) how you see/your vision, (2) your perspective on life, (3) your look/appearance. Bridges clinical + fashion + identity.

**Hero Subtext:**
> "Clarity without compromise. Your world, in high definition."

**Supporting line (smaller, editorial):**
> "Beyond the lens lies a world of detail — where health meets high-fashion, designed for those who see more."

**Cultural punch lines** woven throughout the page (marquee, editorial grid captions, CTAs):
- "Sharp eyes. Sharper style." — Nigerian swagger energy
- "No dull moment. No dull frames."  — plays on the Naija expression
- "Your face. Your canvas." — identity-first, relatable
- "See am. Believe am." — subtle pidgin nod, universally understood
- "Big vision. Bigger statement."
- "Eye no dey lie." — pidgin proverb meets brand truth (the eye doesn't lie)
- "Na style wey dey see road." — pidgin: "It's style that sees the way" (fashion + vision)
- "Clarity dey cost — but we no go overcharge you." — cheeky, trust-building

**Marquee ticker items (culturally flavored):**
Top row: `SHARP EYES • DESIGNER FRAMES • CLARITY WITHOUT COMPROMISE • AI STYLING • FREE EYE EXAMS • HIGH DEFINITION`
Bottom row: `EYE NO DEY LIE • PRECISION LENSES • YOUR FACE YOUR CANVAS • VIRTUAL TRY-ON • BIG VISION • SAME DAY SERVICE`

**Editorial Grid section header:**
- Label: "The M&H Standard"
- Headline: `See more. Be more.`

**Dual CTA section headlines:**
- Left: "Sharp Eyes" (clinical) → subtext: "Precision care from certified specialists."
- Right: "Sharper Style" (fashion) → subtext: "Frames that speak before you do."

---

### Background & Atmosphere Fix

Replace the current flat cream with a **warm off-white (#FAF8F5) to soft warm gray gradient** — feels calm but premium. Add:
- A subtle CSS noise/grain texture overlay (tiny repeating SVG) for tactile richness
- The breathing gold glow stays but shifts to a warmer, deeper tone
- Promo banner remains dark ink — high contrast preserved

---

### File Changes

**1. `HeroSection.tsx`** — New copy throughout
- Headline: "A clearer outlook on life." with word-by-word reveal
- Subtext: "Clarity without compromise. Your world, in high definition."
- Supporting editorial line below
- Background: warm off-white with subtle grain overlay
- All existing animations preserved

**2. `MarqueeTicker.tsx`** — Culturally flavored items
- Replace generic items with the punch lines above
- Mix English + subtle pidgin references

**3. `EditorialGrid.tsx`** — New section header
- "The M&H Standard" label, "See more. Be more." headline
- Update block descriptions with punchier editorial copy

**4. `DualCtaSection.tsx`** — "Sharp Eyes / Sharper Style" headlines

**5. `TestimonialSection.tsx`** — Update header copy to "Eye no dey lie."

**6. `index.css`** — Add subtle grain texture class using a tiny SVG noise pattern as a pseudo-element on the cream sections

### What Does NOT Change
- Layout structure, animations, components, routing
- Promo banner content (sale details stay)
- Stats, CTAs, images, all hooks

