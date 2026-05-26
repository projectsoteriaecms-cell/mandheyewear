/**
 * Catalog visibility flags.
 *
 * HIDE_MH_FRAMES — when true, all `item_type = 'frames'` products on the
 * M&H Eyewear (m_and_h_fashion) brand line are soft-hidden from the
 * storefront (shop grid, featured, category counts) while remaining
 * `is_active = true` in the DB so admin, inventory, Zoho sync and product
 * feeds are untouched. Flip back to `false` to re-list frames.
 */
export const HIDE_MH_FRAMES = false;

/** Category keys that map to frames (used to zero out counts when hidden). */
export const MH_FRAME_CATEGORY_KEYS = ["eyeglasses", "sunglasses"] as const;
