/**
 * Image display utilities.
 * Ensures the original uploaded photo (not AI-generated) is always
 * shown as the hero / catalog preview image.
 */

/** Returns true if a URL looks like an original upload (contains /main.) */
function isOriginalUpload(url: string): boolean {
  return /\/main\.\w+/.test(url);
}

/** Returns true if a URL looks like an AI-generated additional shot */
function isAiGenerated(url: string): boolean {
  return /\/additional-\d+/.test(url);
}

interface ProductImageFields {
  image_url: string | null;
  additional_images: string[] | null;
}

/**
 * Returns [heroImage, ...galleryImages] with the original upload
 * always first. Safe to call on any product shape.
 */
export function getDisplayImages(product: ProductImageFields): string[] {
  const primary = product.image_url;
  const extras = product.additional_images ?? [];

  // Combine all available images
  const all = primary ? [primary, ...extras] : [...extras];
  if (all.length === 0) return [];

  // If the first image is already an original upload, keep order
  if (isOriginalUpload(all[0])) return all;

  // Find the original upload anywhere in the list
  const origIdx = all.findIndex(isOriginalUpload);
  if (origIdx === -1) return all; // no original found, keep as-is

  // Move the original to front, shift others
  const original = all[origIdx];
  const rest = [...all.slice(0, origIdx), ...all.slice(origIdx + 1)];
  return [original, ...rest];
}

/**
 * Returns just the hero image URL for catalog cards.
 */
export function getHeroImage(product: ProductImageFields): string | null {
  const images = getDisplayImages(product);
  return images.length > 0 ? images[0] : null;
}
