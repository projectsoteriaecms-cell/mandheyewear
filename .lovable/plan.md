

## Hero Headline Narrative Optimization

### Creative Analysis

**What's working now:**
The word **OUTLOOK** is a brilliant anchor — it's a triple pun (vision/perspective/style) and the GlassesOO icon makes it an unmistakable visual signature. That stays.

**What's not working:**
The headline is static. "A Clearer OUTLOOK on life" is clean but it only speaks to the *clinical* side. The fashion/identity story never gets its moment in the main headline. The rotating taglines below carry that weight, but they feel disconnected — like captions, not story beats.

### The Fix: Rotating Headline + Refined Taglines (One Unified Narrative Arc)

Instead of one static headline, the **words around OUTLOOK rotate** every 5 seconds, each one reframing the brand from a different angle. The tagline beneath shifts in sync to complete the thought.

**Headline → Tagline pairs (each is one "beat"):**

| Beat | Line 1 | Line 2 (OUTLOOK) | Line 3 | Synced Tagline |
|------|--------|-------------------|--------|----------------|
| 1 – Clinical | A Clearer | OUTL👓K | on life. | "Because seeing well changes everything." |
| 2 – Fashion | A Bolder | OUTL👓K | on you. | "Frames that speak before you do." |
| 3 – Cultural | The Only | OUTL👓K | that fits. | "Na style wey dey see road." |
| 4 – Aspirational | A Better | OUTL👓K | starts now. | "Sharp eyes. Sharper confidence." |

**Why this works:**
- Each rotation tells a different brand story (clinic → fashion → culture → aspiration) without ever feeling like a sales pitch
- "OUTLOOK" stays constant — the visual anchor never moves, only the framing words fade in/out
- The tagline completes the headline's thought rather than being a separate idea
- The sequence builds: *see clearly → look powerful → own your identity → take action*

**The pill badge** changes from static "Clarity without compromise" to match the current beat:
1. "See better" → 2. "Look better" → 3. "Be better" → 4. "Start today"

### Technical Changes

**File: `src/modules/storefront/components/home/HeroSection.tsx`**

1. Replace the static headline text with a `HERO_BEATS` array containing `{ line1, line3, tagline, pill }` objects
2. Use the existing `taglineIndex` state + interval to drive all four elements in sync (bump interval from 4s → 5s for readability)
3. Add crossfade animation to Line 1 and Line 3 spans (Line 2 / OUTLOOK stays fixed)
4. Remove the separate `TAGLINES` array — it merges into the beats

**No other files change.** The GlassesOO component, animations, layout, and CTAs all stay exactly as they are.

### Pill Badge
The small "Clarity without compromise" badge also rotates in sync with the headline beat, reinforcing the message with a tight 2-3 word echo.

