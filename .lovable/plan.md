

## Multi-Angle Virtual Try-On with Smooth Carousel

### What We'll Build
After the front-facing try-on generates, the user sees it immediately. Then two additional angles (3/4 left, 3/4 right) generate in the background. All three views appear in a swipeable carousel with smooth transitions and angle labels.

### How It Works

```text
Modal opens → Generate front view (5-10s) → Show immediately
                ↓ (in background)
         Generate 3/4 left view → add to carousel
         Generate 3/4 right view → add to carousel

User sees: [← 3/4 Left] [Front ●] [3/4 Right →]
           Swipe or tap dots to rotate between views
```

### Implementation

**1. Update edge function to accept an `angle` parameter**
- File: `supabase/functions/virtual-try-on/index.ts`
- Add optional `angle` field to the request: `"front"` (default), `"three_quarter_left"`, `"three_quarter_right"`
- Modify `buildPrompt()` to include angle-specific instructions:
  - Front: current prompt (unchanged)
  - 3/4 Left: "Show the person turned ~30 degrees to their left, showing how the glasses look from a three-quarter left angle"
  - 3/4 Right: same but right side
- The same user photo + frame reference are sent each time; only the prompt changes

**2. Update `useVirtualTryOn` hook to support multi-angle generation**
- File: `src/modules/personalization/hooks/useVirtualTryOn.ts`
- Add `multiAngleResults` state: `{ front?: string, left?: string, right?: string }`
- Add `generateMultiAngle()` method that:
  1. Generates front view first, sets it as `currentResult` immediately
  2. Fires left and right angle requests in parallel (background)
  3. Updates `multiAngleResults` as each completes
- Add `isGeneratingAngles` loading state for the secondary views

**3. New `TryOnCarousel` component**
- File: `src/components/try-on/TryOnCarousel.tsx`
- Receives `images: { angle: string, url: string, loading: boolean }[]`
- Renders a swipeable image carousel with:
  - Touch/drag swipe support (CSS scroll-snap)
  - Dot indicators showing current angle
  - Angle labels ("Front", "Left Side", "Right Side") overlaid on each image
  - Smooth CSS transitions between slides
  - Loading skeleton placeholders for angles still generating
- No external carousel library needed — pure CSS scroll-snap + React state

**4. Update `InlineTryOnModal` to use the carousel**
- File: `src/components/try-on/InlineTryOnModal.tsx`
- After front view succeeds, auto-trigger left and right angle generation
- Replace single `<img>` with `<TryOnCarousel>` component
- Show "Generating more angles..." indicator while side views load
- Each completed angle smoothly appears in the carousel

**5. Update `TryOnResult` component (full /try-on page)**
- File: `src/components/try-on/TryOnResult.tsx`
- Same carousel treatment for the dedicated try-on page

### Cost Consideration
Each try-on now costs 3x AI calls (3 angles). The front view shows instantly — side views are bonus. If either side view fails, the carousel simply shows fewer slides gracefully.

### Files Modified
1. `supabase/functions/virtual-try-on/index.ts` — Add `angle` parameter + angle-specific prompts
2. `src/modules/personalization/hooks/useVirtualTryOn.ts` — Add `generateMultiAngle()` + multi-angle state
3. `src/components/try-on/TryOnCarousel.tsx` (new) — Swipeable angle carousel with scroll-snap
4. `src/components/try-on/InlineTryOnModal.tsx` — Use carousel, trigger multi-angle generation
5. `src/components/try-on/TryOnResult.tsx` — Use carousel on full try-on page
6. `src/components/try-on/index.ts` — Export new component

