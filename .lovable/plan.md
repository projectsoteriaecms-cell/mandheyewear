
# Refactoring Plan: Product Image Prioritization & Icon Consistency

## Summary

This plan addresses three key issues:
1. Prioritize products with real uploaded images in the Try-On page
2. Fix icon/action confusion between "Add to Cart" and "Try On" features
3. Improve visual distinction for products with and without images

---

## Issues Identified

### Issue 1: Products with Real Images Not Prioritized
Currently, the Try-On page filters for frames with images but shows them in default order. Products with real backend images should appear first.

### Issue 2: Button Action Mismatch (Bug Found!)
In `ProductCard.tsx` line 130-135, the button displays "Try On" on desktop but actually triggers `handleAddToCart`:
```tsx
<Button variant="gold" onClick={handleAddToCart}>
  <span className="hidden sm:inline">Try On</span>  // Wrong label!
</Button>
```
This is a critical UX bug causing user confusion.

### Issue 3: Icon Inconsistency
| Feature | Current Icon | Problem |
|---------|--------------|---------|
| Try On | `Camera` | Suggests "take photo", not virtual try-on |
| Add to Cart | `ShoppingBag` | Correct, consistent |
| Try On (FramePicker) | `Sparkles` | Better, but inconsistent with other places |

---

## Proposed Solution

### Part 1: Standardize Icons

Establish clear icon conventions across the entire app:

| Action | Icon | Reasoning |
|--------|------|-----------|
| **Virtual Try-On** | `Sparkles` | Conveys AI/magic, distinct from photo actions |
| **Add to Cart** | `ShoppingCart` | Standard e-commerce pattern |
| **Camera/Photo Upload** | `Camera` | Reserved for actual photo capture |

### Part 2: Fix ProductCard Actions

Split the card buttons into two distinct actions:
- **View Details** button (outline) → navigates to product page
- **Add to Cart** button (gold, ShoppingCart icon) → adds to cart
- **Try On** quick action (Sparkles icon) → on hover only

### Part 3: Prioritize Products with Images

Update the product sorting in `TryOn.tsx`:
1. First: Products with images from the backend (real uploads)
2. Second: Recently added products (fallback)
3. Hide products without images from Try-On carousel entirely (already done)

Add a count indicator showing "38 frames ready for try-on"

---

## Technical Changes

### Files to Modify

| File | Change |
|------|--------|
| `src/components/eyewear/ProductCard.tsx` | Fix button mismatch, update icons, add proper Try On action |
| `src/components/eyewear/ProductListCard.tsx` | Update icons for consistency |
| `src/pages/TryOn.tsx` | Sort products with images first, add count indicator |
| `src/components/try-on/FramePicker.tsx` | Keep Sparkles icon (already correct) |
| `src/pages/ProductDetail.tsx` | Verify Try On button uses Sparkles |

### ProductCard Changes
```tsx
// Current (broken):
<Button variant="gold" onClick={handleAddToCart}>
  <ShoppingBag className="h-3.5 w-3.5 sm:hidden" />
  <span className="hidden sm:inline">Try On</span>  // WRONG
</Button>

// Fixed:
<Button variant="gold" onClick={handleAddToCart}>
  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
  <span className="hidden sm:inline">Add to Cart</span>
</Button>
```

### Try-On Page Sorting
```tsx
// Sort frames: images first, then by name
const frameProducts = products
  ?.filter((p) => p.item_type === "frames" && p.image_url)
  .sort((a, b) => {
    // Both have images, sort by name
    return a.name.localeCompare(b.name);
  }) || [];
```

### Icon Hover Actions
Add Try-On quick action with Sparkles icon in the product card hover state:
```tsx
<Button 
  size="icon" 
  variant="secondary"
  onClick={() => navigate(`/try-on?product=${product.id}`)}
>
  <Sparkles className="h-4 w-4" />
</Button>
```

---

## Visual Summary

### Before (Current State)
```text
Product Card Hover:
[Heart] [Camera] [ShoppingBag]
         ↓          ↓
      unclear    Add to Cart

Bottom Buttons:
[View Details] [Try On]  ← Actually adds to cart!
```

### After (Fixed)
```text
Product Card Hover:
[Heart] [Sparkles] [ShoppingCart]
           ↓            ↓
       Try On      Add to Cart

Bottom Buttons:
[View Details] [Add to Cart] ← Correct!
```

---

## Testing Checklist

After implementation, verify:
- [ ] Products with real images appear first in Try-On carousel
- [ ] "Try On" buttons navigate to `/try-on?product=...`
- [ ] "Add to Cart" buttons add to cart (not try-on)
- [ ] Sparkles icon used consistently for Try-On
- [ ] ShoppingCart icon used consistently for Add to Cart
- [ ] Camera icon only used for photo upload features

---

## Estimated Impact

- **38 products** currently have uploaded images and will be prioritized
- **757 frames** without images will be hidden from Try-On (until images uploaded)
- Clear visual distinction prevents user confusion
