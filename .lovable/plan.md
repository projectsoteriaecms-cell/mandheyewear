

## Problem: Catalog Images Showing Cases/Packaging Used as AR Overlay

When you select a frame in Live AR that **doesn't have 3D measurements** (the majority — only 101 out of ~10,800 have measurements), the system falls back to the **2D overlay path**. This takes the product's catalog image and stretches it onto your face. If that image shows the frame inside a case, on a display, or with packaging, that's exactly what gets plastered on your face — useless for try-on.

Even for the 101 products WITH 3D measurements, the thumbnail in the frame selector still shows whatever the `image_url` is (which could be a case photo), making it look broken even if the 3D parametric rendering would work fine underneath.

### Two-Part Fix

**1. Filter the AR frame selector to only show 3D-ready products**

Right now all ~frame products with images appear in the AR selector. Since the 2D overlay with a case photo is useless, we should only show products that have full 3D measurements (the 101 products). This way every frame in the AR selector actually works properly with parametric 3D rendering.

- **File: `src/pages/TryOn.tsx`** — Pass a filtered list to `LiveARTryOn` that only includes products with 3D-ready frame attributes, or add a query that joins `frame_attributes` to check for measurements
- **File: `src/components/try-on/LiveARTryOn.tsx`** — Remove the 2D fallback indicator since all shown products will be 3D

**2. Add a "coming soon" count showing how many frames aren't yet 3D-ready**

Below the AR frame selector, show a message like "101 frames available for 3D try-on · 10,700+ more coming soon" so users understand more are on the way.

- **File: `src/components/try-on/ARFrameSelector.tsx`** — Accept a `totalCount` prop and display the "more coming" message

### Technical Detail

We need to fetch frame attributes for the product list to know which ones are 3D-ready. Two options:
- **Option A (simpler):** Create a new hook or RPC that returns product IDs with complete measurements, then filter client-side
- **Option B (efficient):** Add a database view or modify the products query to join `frame_attributes` and filter server-side

Option A is faster to implement — fetch all frame_attribute product_ids where all 3 measurements exist, then filter `frameProducts` to only those IDs before passing to `LiveARTryOn`.

### Files Modified
| File | Change |
|------|--------|
| `src/pages/TryOn.tsx` | Fetch 3D-ready product IDs, filter AR product list |
| `src/components/try-on/ARFrameSelector.tsx` | Add total/coming-soon count display |
| `src/components/try-on/LiveARTryOn.tsx` | Remove 2D fallback messaging since all AR products will be 3D |

