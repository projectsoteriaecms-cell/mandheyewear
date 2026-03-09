

# Sort Products: Images First, Most Recent First

## Change
In `src/modules/products/hooks/useAdminProducts.ts`, update the admin products query to sort by `image_url` (non-null first) then by `updated_at` descending. This ensures products with images appear at the top, with the most recently updated (i.e., just had images generated) first.

### File: `src/modules/products/hooks/useAdminProducts.ts` (~line 77)
Change the `.order("created_at", { ascending: false })` to a two-level sort:
```typescript
.order("image_url", { ascending: false, nullsFirst: false })
.order("updated_at", { ascending: false })
```

This uses Supabase's built-in ordering: `image_url DESC NULLS LAST` puts products with images first, then `updated_at DESC` ensures the most recently updated product (the one that just got images generated) appears at the very top.

## Files Modified
- `src/modules/products/hooks/useAdminProducts.ts` — update query ordering

