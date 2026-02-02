/**
 * Snapchat Camera Kit Lens Configuration
 * 
 * To configure this for your Snap Camera Kit app:
 * 1. Go to https://kit.snap.com/ and create a Camera Kit app
 * 2. Get your API Token from the app settings
 * 3. Create lenses in Lens Studio and add them to a Lens Group
 * 4. Copy the Lens Group ID and individual Lens IDs here
 * 
 * For the pilot, we use placeholder IDs that will be replaced
 * with actual Snap lens IDs once you have your developer credentials.
 */

export interface SnapLensConfig {
  id: string;
  name: string;
  snapLensId: string;
  thumbnailUrl?: string;
  productId?: string; // Maps to M&H product catalog
}

export interface SnapCameraKitConfig {
  apiToken: string;
  lensGroupId: string;
  lenses: SnapLensConfig[];
}

// Placeholder configuration - replace with actual Snap credentials
// Camera Kit API Tokens are designed to be public/client-side safe
export const SNAP_CONFIG: SnapCameraKitConfig = {
  // Replace with your Camera Kit API Token from https://kit.snap.com/
  apiToken: import.meta.env.VITE_SNAP_CAMERA_KIT_TOKEN || "",
  
  // Replace with your Lens Group ID from Snap Kit Portal
  lensGroupId: import.meta.env.VITE_SNAP_LENS_GROUP_ID || "",
  
  // Demo lenses - replace snapLensId with actual lens IDs from Lens Studio
  lenses: [
    {
      id: "demo_aviator",
      name: "Classic Aviator",
      snapLensId: "", // Will be populated with actual Snap lens ID
      thumbnailUrl: "/placeholder.svg",
    },
    {
      id: "demo_round",
      name: "Round Frames",
      snapLensId: "", // Will be populated with actual Snap lens ID
      thumbnailUrl: "/placeholder.svg",
    },
    {
      id: "demo_cat_eye",
      name: "Cat Eye",
      snapLensId: "", // Will be populated with actual Snap lens ID
      thumbnailUrl: "/placeholder.svg",
    },
  ],
};

/**
 * Check if Camera Kit is properly configured
 */
export const isCameraKitConfigured = (): boolean => {
  return Boolean(
    SNAP_CONFIG.apiToken && 
    SNAP_CONFIG.lensGroupId && 
    SNAP_CONFIG.lenses.some(lens => lens.snapLensId)
  );
};

/**
 * Get available lenses that have valid Snap IDs
 */
export const getConfiguredLenses = (): SnapLensConfig[] => {
  return SNAP_CONFIG.lenses.filter(lens => lens.snapLensId);
};
