

# Extend Mobile Image Width to Match Title Text

## Problem
On mobile (390px viewport), the `max-h-[45vh]` cap limits the image height to ~240px. Because the image uses `aspect-square`, this also constrains its **width** to ~240px — much narrower than the ~358px container width. The product title text fills the full container width, so the image appears noticeably narrower than the text below it.

## Root Cause
`aspect-square` + `max-h-[45vh]` = height drives width. At 535px viewport height, 45vh = ~240px, so the square image becomes 240×240px instead of filling the available ~358px width.

## Fix

### ProductImageCarousel.tsx (line 81)
Remove the mobile `max-h-[45vh]` and only apply the max-height cap at `md` breakpoint where it's needed for desktop layout.

```
// Before
"aspect-square max-h-[45vh] md:max-h-none md:aspect-[4/3]"

// After
"aspect-square md:max-h-none md:aspect-[4/3]"
```

Additionally, add `w-full` to the container (line 90) to ensure it stretches to full width:

```
// Before
"relative overflow-hidden bg-secondary group rounded-lg"

// After
"relative overflow-hidden bg-secondary group rounded-lg w-full"
```

## Result
On 390px mobile: the image fills the full container width (~358px) as a square (358×358px), perfectly aligned with the title text width. Desktop layout remains unchanged.

| File | Change |
|------|--------|
| `src/components/product/ProductImageCarousel.tsx` | Remove `max-h-[45vh]`, add `w-full` |

