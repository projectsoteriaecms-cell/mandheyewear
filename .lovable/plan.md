

## Add "Regenerate" Option for Individual Products

### What Changes

**1. Edge function (`supabase/functions/generate-product-image/index.ts`)**
- Add support for a `productId` parameter in the request body
- When `productId` is provided, skip the "missing image" query and instead fetch that specific product directly
- Delete existing images from storage before regenerating (upsert already handles this since we use `upsert: true`)
- Clear existing `image_url` and `additional_images` before generating new ones

**2. QuickImageUploadModal (`src/components/admin/products/QuickImageUploadModal.tsx`)**
- Add a "Regenerate with AI" button in the modal header/actions area
- When clicked, invoke the edge function with `{ productId: product.id }` 
- Show a loading state while regenerating
- On completion, invalidate queries to refresh the UI

**3. ProductImageListView (`src/components/admin/products/ProductImageListView.tsx`)**
- Add a "Regenerate" option to the existing three-dot dropdown menu alongside "Manage Images"

**4. ProductImageCard (`src/components/admin/products/ProductImageCard.tsx`)**
- No changes needed — clicking the card opens the QuickImageUploadModal which will have the regenerate button

### Technical Details

**Edge function change** — add a branch at the top of the handler:
```typescript
const { batchSize = 1, itemTypes, maxProducts, productId } = await req.json().catch(() => ({}));

// Single product regeneration mode
if (productId) {
  const { data: product } = await supabase
    .from("products")
    .select("id, name, brand, color, material, item_type, style, sku")
    .eq("id", productId)
    .single();
  // ... generate and return result for just this product
}
```

**QuickImageUploadModal** — add regenerate button + state:
- `isRegenerating` state boolean
- Button with `Lightning` icon: "Regenerate with AI"
- Calls `supabase.functions.invoke("generate-product-image", { body: { productId: product.id } })`
- Shows toast on success/failure

**ProductImageListView** — add dropdown menu item:
- New `onRegenerateClick` prop
- "Regenerate with AI" menu item with `Lightning` icon

