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
 * Check if Camera Kit is properly configured
 */
export const isCameraKitConfigured = (): boolean => {
  return Boolean(
    SNAP_CONFIG.apiToken &&
    SNAP_CONFIG.lensGroupId &&
    SNAP_CONFIG.carouselLensId
  );
};
