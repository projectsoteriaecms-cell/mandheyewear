

## Fix Style Quiz & Recommendation Engine

### Problems Found

1. **Two duplicate quizzes** — `/style-quiz` page and onboarding `StyleQuizStep` have the same questions but different budget IDs (`"budget"/"standard"/"premium"/"luxury"` vs `"under 50k"/"50-150k"/"150-300k"/"over 300k"`). The recommendation engine's `BUDGET_MAPPING` only matches the onboarding version's IDs, so the standalone quiz's budget answers never match.

2. **Color matching is broken** — 619 of 773 products with a color value have it set to `"Various"`, which matches nothing. Only ~154 products have actual color values.

3. **Style matching is too narrow** — Products use compound styles like `"Cat Eye/Round"`, `"Rectangular/Sport"`. The `STYLE_MAPPING` maps quiz choices to single values, partially working (`.includes()` catches some), but misses many. Also, quiz style options (Classic, Modern, Bold, Minimalist, Vintage) are abstract — they don't include real frame shapes like Cat Eye.

4. **Quiz is missing user-requested options** — No Cat Eye as a selectable frame shape. No material filter (Acetate/Plastic, Metal, Gold Plated). No Kids category option. Color step has limited value given data quality.

5. **No `frame_shape` data** in `frame_attributes` — the column exists but is empty for all products. The `style` column on `products` table is the real source for shape data.

### Plan

**1. Consolidate into one quiz — remove standalone `/style-quiz` page, use onboarding quiz everywhere**

- Update `src/pages/StyleQuiz.tsx` to redirect to `/onboarding` (or reuse the same component)
- Alternatively, make the standalone page import and use the same answer format/IDs as the onboarding step

Decision: Keep `/style-quiz` as an accessible entry point but make it use the same component and save format as the onboarding version. This avoids breaking bookmarks/links.

**2. Redesign quiz steps based on actual product data**

Replace the current abstract style options with real frame shapes from the catalog:

| Current (abstract) | New (data-driven) |
|---|---|
| Classic, Modern, Bold, Minimalist, Vintage | Rectangular, Cat Eye, Aviator, Round, Square, Geometric |

These map directly to the `style` column values. The matching becomes a direct `includes()` check instead of an abstract mapping layer.

Add a **Material** step (new):
- Acetate/Plastic (472 products)
- Metal (9+ products)
- Titanium (7+ products)
- Mixed (Acetate/Metal combos)

Store material preference in `frame_preferences.material`.

Remove the **Color** step — 80% of products have "Various" making it useless. Replace with the Material step.

Add **Kids** option to a new "Who is this for?" step or as a gender/category filter.

**3. Fix the recommendation engine**

Update `src/hooks/usePersonalizedProducts.ts`:
- Remove `STYLE_MAPPING` indirection — match quiz frame shape selections directly against `product.style` using `.includes()` (handles compound styles like "Cat Eye/Round")
- Remove `COLOR_MAPPING` — skip color scoring until data quality improves
- Add material matching using `product.material` and `frame_attributes.frame_material`
- Fix `BUDGET_MAPPING` to use consistent IDs
- Lower the recommendation threshold from 40 to 20 (since removing color scoring reduces max achievable score)
- Rebalance scoring: Style 30pts, Budget 30pts, Material 20pts, Frame fit 20pts

**4. Improve post-quiz experience**

- Show actual product recommendations on the results page instead of just a summary
- Use `usePersonalizedProducts` to display top 4-6 matched products immediately

### Files to Change

| File | Change |
|---|---|
| `src/pages/StyleQuiz.tsx` | Replace abstract style/color steps with data-driven frame shapes + material. Align budget IDs. Show product recommendations on results page. |
| `src/components/onboarding/StyleQuizStep.tsx` | Same quiz content updates — share constants or import from shared location |
| `src/hooks/usePersonalizedProducts.ts` | Remove STYLE_MAPPING/COLOR_MAPPING indirection. Add material matching. Rebalance scoring. Lower threshold. |
| New: `src/components/onboarding/quiz-constants.ts` | Shared quiz options (frame shapes, materials, budgets, usage) used by both quiz locations |

### Technical Details

New frame shape options derived from actual product data:
```text
Rectangular (601), Cat Eye (60+), Round (20+), Square (29+), Aviator (10+), Geometric/Sport (35+)
```

Material options from `frame_attributes.frame_material`:
```text
Acetate/Plastic (500+), Metal (60+), Titanium (30+), Mixed materials
```

The matching logic simplifies from:
```text
quiz "bold" → STYLE_MAPPING["bold"] → ["cat-eye","oversized"] → product.style.includes()
```
to:
```text
quiz "Cat Eye" → product.style.toLowerCase().includes("cat eye")
```

This works with compound styles naturally — "Cat Eye/Round" matches both "Cat Eye" and "Round" selections.

