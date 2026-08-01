/**
 * Snapchat Camera Kit Lens Configuration
 *
 * Architecture: ONE published Lens ("Eyewear Try On") containing a carousel of
 * 3D frame models — NOT one Lens per frame. New frames are added to the same
 * Lens in Lens Studio and republished under the same Lens ID; the web app
 * config does not change per frame.
 *
 * Per-frame metadata (which product maps to which carousel slot) lives in the
 * `ar_frame_3d_models` table, keyed by product_id.
 *
 * Setup:
 * 1. My Lenses portal (https://my-lenses.snapchat.com) → Camera Kit → Apps →
 *    "M&H Eyewear Virtual Try-On" → copy the Staging (or Production) API Token
 *    into VITE_SNAP_CAMERA_KIT_TOKEN.
 * 2. Create a Lens Group in the app, add the "Eyewear Try On" Lens to it, and
 *    copy the Group ID into VITE_SNAP_LENS_GROUP_ID.
 * 3. The Lens ID below is the published "Eyewear Try On" Lens; override with
 *    VITE_SNAP_LENS_ID only if the Lens is ever republished under a new ID.
 *
 * Camera Kit API tokens are designed to be client-side safe.
 */

/** Published "Eyewear Try On" carousel Lens (M&H Eyewear AR folder). */
const DEFAULT_CAROUSEL_LENS_ID = "76531c26-ffff-485b-b956-742b8de0fa1e";

export interface SnapCameraKitConfig {
  apiToken: string;
  lensGroupId: string;
  /** The single carousel Lens containing all frame models. */
  carouselLensId: string;
}

export const SNAP_CONFIG: SnapCameraKitConfig = {
  apiToken: import.meta.env.VITE_SNAP_CAMERA_KIT_TOKEN || "",
  lensGroupId: import.meta.env.VITE_SNAP_LENS_GROUP_ID || "",
  carouselLensId: import.meta.env.VITE_SNAP_LENS_ID || DEFAULT_CAROUSEL_LENS_ID,
};

/**
 * @deprecated The per-frame lens list is obsolete under the single-carousel-Lens
 * architecture. Kept only for components still importing the type; per-frame
 * data now comes from the `ar_frame_3d_models` table.
 */
export interface SnapLensConfig {
  id: string;
  name: string;
  snapLensId: string;
  thumbnailUrl?: string;
  productId?: string;
}

/**
 * Which slot each frame occupies in the published Lens's carousel.
 *
 * The Lens contains every frame as one carousel; Camera Kit selects which one
 * opens by passing `frameIndex` as a launch param (see useCameraKit). The site
 * owns this mapping so the Lens never needs a SKU table baked into it —
 * reordering the carousel is a republish here, not a Lens change.
 *
 * Keep in sync with `SetActiveItem.tryOnItems` in the Lens Studio project.
 * Once the catalogue outgrows a hand-maintained map this should move to the
 * `ar_frame_3d_models` table (already designed for it, keyed by product_id).
 */
const CAROUSEL_SLOT_BY_SKU: Record<string, number> = {
  "MH-506": 0,  // Dario Martini DM 796 COL.2 — black acetate cat-eye
  "MH-107": 1,  // Ray-Ban RB3025 Aviator — metal
  "MH-1780": 2, // Cartier 30104 — metal rimless
};

/**
 * Resolves a product's carousel slot, or null when that frame isn't in the Lens
 * yet. Callers should treat null as "open the Lens on its default frame" rather
 * than blocking the try-on — most of the catalogue has no 3D model yet.
 */
export const getCarouselSlotForSku = (sku?: string | null): number | null => {
  if (!sku) return null;
  const slot = CAROUSEL_SLOT_BY_SKU[sku];
  return typeof slot === "number" ? slot : null;
};

/** True when the given product has a 3D frame in the published Lens. */
export const hasArFrame = (sku?: string | null): boolean =>
  getCarouselSlotForSku(sku) !== null;

/**
 * Check if Camera Kit is properly configured
 */
export const isCameraKitConfigured = (): boolean => {
  return Boolean(
    SNAP_CONFIG.apiToken &&
    SNAP_CONFIG.lensGroupId &&
    SNAP_CONFIG.carouselLensId
  );
};
