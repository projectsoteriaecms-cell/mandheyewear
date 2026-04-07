/**
 * AR overlay image selection & suitability checks.
 *
 * Product catalog images are usually opaque photos with white backgrounds
 * and may be angled shots — unsuitable for AR overlays. This module picks
 * the best candidate and checks whether it can be used as an overlay.
 */

export interface ARImageResult {
  /** URL to use as the overlay source */
  url: string;
  /** Whether the image is likely AR-ready (transparent / front-facing) */
  arReady: boolean;
  /** Human-readable reason if not AR-ready */
  reason?: string;
}

/**
 * Heuristic: does the URL look like a transparent asset?
 * Transparent overlays are typically PNG or WebP with specific naming.
 */
function looksTransparent(url: string): boolean {
  const lower = url.toLowerCase();
  // Explicit transparent / overlay naming conventions
  if (/transparent|overlay|ar[-_]?asset|cutout|no[-_]?bg/i.test(lower)) return true;
  // PNG files are *more likely* transparent than JPEGs
  if (lower.endsWith(".png") || lower.includes(".png?")) return true;
  if (lower.endsWith(".webp") || lower.includes(".webp?")) return true;
  return false;
}

/**
 * Heuristic: does the URL look like the original upload / catalog photo?
 */
function isCatalogPhoto(url: string): boolean {
  return /\/main\.\w+/.test(url);
}

/**
 * Pick the best overlay image from a product's image set.
 *
 * Priority:
 *  1. An image explicitly named as transparent / overlay / ar-asset
 *  2. A PNG/WebP from additional_images (more likely transparent)
 *  3. The primary image_url as last resort (will be flagged as not AR-ready)
 */
export function pickAROverlayImage(
  imageUrl: string | null,
  additionalImages: string[] | null
): ARImageResult {
  const extras = additionalImages ?? [];
  const all = imageUrl ? [imageUrl, ...extras] : [...extras];

  if (all.length === 0) {
    return { url: "", arReady: false, reason: "No images available for this frame" };
  }

  // 1. Prefer explicitly named transparent / overlay assets
  const explicit = all.find(
    (u) => /transparent|overlay|ar[-_]?asset|cutout|no[-_]?bg/i.test(u)
  );
  if (explicit) {
    return { url: explicit, arReady: true };
  }

  // 2. Prefer PNG/WebP from additional images (skip catalog main photo)
  const transparentCandidate = extras.find(
    (u) => looksTransparent(u) && !isCatalogPhoto(u)
  );
  if (transparentCandidate) {
    return { url: transparentCandidate, arReady: true };
  }

  // 3. Any PNG/WebP at all
  const anyPng = all.find((u) => looksTransparent(u));
  if (anyPng) {
    return {
      url: anyPng,
      arReady: false,
      reason: "Using catalog image — may have a white background",
    };
  }

  // 4. Fall back to primary image
  return {
    url: all[0],
    arReady: false,
    reason: "No transparent overlay available — catalog image used",
  };
}

/**
 * At render-time, check whether a loaded image has a mostly-white
 * border (indicating a non-transparent catalog photo).
 * Returns true if the image appears to have an opaque white background.
 */
export function detectWhiteBackground(img: HTMLImageElement): boolean {
  try {
    const size = 64; // sample at low res for speed
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    // Sample corner pixels (top-left, top-right, bottom-left, bottom-right)
    const corners = [
      [0, 0],
      [size - 1, 0],
      [0, size - 1],
      [size - 1, size - 1],
      [2, 2],
      [size - 3, 2],
      [2, size - 3],
      [size - 3, size - 3],
    ];

    let whiteCount = 0;
    for (const [x, y] of corners) {
      const i = (y * size + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2],
        a = data[i + 3];
      // Opaque and near-white
      if (a > 240 && r > 230 && g > 230 && b > 230) {
        whiteCount++;
      }
    }

    // If 6+ of 8 corners are white, likely has a white background
    return whiteCount >= 6;
  } catch {
    return false;
  }
}

/**
 * Remove white background from an image by making near-white pixels transparent.
 * Returns a new canvas element with the processed image.
 */
export function removeWhiteBackground(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    // Near-white detection with soft edge
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    if (brightness > 240 && saturation < 20) {
      // Fully transparent for very white pixels
      data[i + 3] = 0;
    } else if (brightness > 220 && saturation < 30) {
      // Semi-transparent for off-white pixels (soft edge)
      const alpha = Math.round(((240 - brightness) / 20) * 255);
      data[i + 3] = Math.min(data[i + 3], Math.max(0, alpha));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
