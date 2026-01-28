
# Style Quiz Visual Enhancement Plan

## Current Issues Identified

1. **Face Shape Selection**: Uses generic Phosphor icons (Circle, Square, Hexagon, Diamond) that don't visually represent actual face shapes
2. **Frame Style Selection**: Text-only cards with no visual representation of frame styles
3. **Overall Aesthetic**: Looks utilitarian rather than premium/luxury eyewear experience
4. **Two Implementations**: Both `StyleQuizStep.tsx` (onboarding) and `StyleQuiz.tsx` (standalone page) need updates

## Proposed Improvements

### 1. Face Shape Visual Representations
Replace generic icons with elegant SVG illustrations of face silhouettes:
- **Oval**: Elongated egg-shaped silhouette
- **Round**: Circular face outline with soft curves
- **Square**: Angular jawline silhouette
- **Heart**: Wider forehead tapering to chin
- **Oblong**: Vertically elongated rectangle silhouette

Each will be a minimalist, line-art style SVG that fits the Dieter Rams aesthetic - clean, simple, professional.

### 2. Frame Style Visual Representations
Add actual frame shape illustrations for each style:
- **Classic**: Traditional rectangular/wayfarer silhouette
- **Modern**: Geometric/angular frame outline
- **Bold**: Thick oversized frame silhouette
- **Minimalist**: Thin wire-frame outline
- **Vintage**: Round/cat-eye retro silhouette

### 3. Enhanced Card Design
- Larger visual area with the illustration taking prominence
- Subtle hover animations (gentle scale + shadow)
- Selected state with elegant gold accent border
- Refined typography with proper hierarchy

### 4. Color Selection Improvement
- Add realistic tortoise shell pattern instead of solid amber
- Add metallic gradient for gold/silver
- Improve the "Clear" representation with subtle pattern

---

## Technical Implementation

### New Files to Create
```
src/components/onboarding/illustrations/
├── FaceShapeIllustration.tsx    # SVG component for face shapes
├── FrameStyleIllustration.tsx   # SVG component for frame styles
└── index.ts                     # Barrel export
```

### Files to Modify
1. `src/components/onboarding/StyleQuizStep.tsx` - Update face shape and frame style rendering
2. `src/pages/StyleQuiz.tsx` - Update standalone quiz page with same improvements

### Design Specifications

**Face Shape Illustrations**
- Monochromatic line art (uses `currentColor`)
- 64x80px viewBox for vertical face proportions
- 1.5px stroke weight for refined look
- Subtle fill on selection

**Frame Style Illustrations**
- Horizontal frame silhouettes
- 80x32px viewBox for wide frame shapes
- Clean outlines without excessive detail
- Gold fill on selected state

**Card Layout**
```
┌─────────────────────────────────┐
│                                 │
│      [Face/Frame Illustration]  │
│           (prominent)           │
│                                 │
│  ─────────────────────────────  │
│  Label Name                     │
│  Brief description              │
│                      ✓ (if sel) │
└─────────────────────────────────┘
```

### Color Palette for Quiz
- Background: Clean white/dark based on theme
- Cards: Subtle border, no heavy shadows
- Selected: Gold accent border (brand color)
- Illustrations: Primary foreground color, gold on selection

---

## Summary of Changes
| Component | Current | Proposed |
|-----------|---------|----------|
| Face shapes | Generic icons (Circle, Square, etc.) | Elegant face silhouette SVGs |
| Frame styles | Text-only cards | Frame shape illustration + text |
| Colors | Basic circles | Realistic patterns/gradients |
| Cards | Plain styling | Premium hover states + gold accents |
| Typography | Standard | Cormorant Garamond headings |
