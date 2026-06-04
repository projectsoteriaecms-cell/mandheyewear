/**
 * Shared brand classification for PDCA image quality gate.
 * All brands need at least 1 reference (the anchor) to start AI generation.
 * A product is "complete" once it has 5 or more total images.
 */

export const LUXURY_BRANDS = new Set([
  "GUCCI", "VERSACE", "PRADA", "EMPORIO ARMANI", "BURBERRY", "CARTIER",
  "MONT BLANC", "DOLCE & GABBANA", "TOM FORD", "MARC JACOBS", "SWAROVSKI",
  "MIU MIU", "CAROLINA HERRERA", "TIFFANY & CO", "BALENCIAGA", "BVLGARI",
  "JIMMY CHOO", "CHOPARD", "GENTLE MONSTER", "CHROME HEART", "LINDA FARROW",
  "MCM", "MOSCHINO",
  "POLAROID", "CARRERA", "CARRERA DUCATI", "TED BAKER", "TOMMY HILFIGER",
  "RAYBAN", "RAY-BAN", "POLO RALPH LAUREN", "HUGO", "HUGO BOSS",
  "DAVID BECKHAM", "VICTORIA BECKHAM", "GUESS", "OAKLEY", "ARNETTE",
  "VOGUE", "LEVI", "PUMA", "CALVIN KLEIN", "SANDRO", "DKNY",
  "ARMANI EXCHANGE",
  "DANIEL HECHTER", "JOHN RICHMOND", "LA MARTINA", "WILLIAMS MORRIS",
  "COLUMBIA", "PIERRE CARDIN", "MIRAFLEX",
  "JIMMY FAIRLY",
  "FREIGEIST",
]);

export function isKnownBrand(brand: string | null | undefined): boolean {
  if (!brand) return false;
  return LUXURY_BRANDS.has(brand.toUpperCase().trim());
}

/** Minimum reference photos required for house brand AI generation */
export const MIN_REFERENCE_PHOTOS = 1;

/** Minimum reference photos required for known brand AI generation */
export const MIN_REFERENCE_PHOTOS_KNOWN = 1;

/** Total images at which a product gallery is considered complete */
export const COMPLETE_IMAGE_THRESHOLD = 5;

/** Returns true if the product is a house brand (M&H, unknown, or no brand) */
export function isHouseBrand(brand: string | null | undefined): boolean {
  if (!brand) return true;
  const normalized = brand.toUpperCase().trim();
  if (normalized.includes("M&H")) return true;
  return !LUXURY_BRANDS.has(normalized);
}

export type ImageReadinessStatus =
  | "complete"           // 5+ images
  | "ready_ai"           // Has anchor (known brand), can generate
  | "ready_ai_ref"       // House brand with anchor, can generate
  | "needs_photos_0";    // No anchor uploaded yet — must engage manually

export function getImageReadiness(
  brand: string | null | undefined,
  imageUrl: string | null,
  additionalImages: string[] | null
): ImageReadinessStatus {
  const totalImages = (imageUrl ? 1 : 0) + (additionalImages?.length ?? 0);

  if (totalImages >= COMPLETE_IMAGE_THRESHOLD) return "complete";

  if (totalImages < 1) return "needs_photos_0";

  return isKnownBrand(brand) ? "ready_ai" : "ready_ai_ref";
}

export const READINESS_LABELS: Record<ImageReadinessStatus, string> = {
  complete: "Complete",
  ready_ai: "Ready for AI",
  ready_ai_ref: "Ready for AI (ref)",
  needs_photos_0: "Needs Anchor",
};

export const READINESS_COLORS: Record<ImageReadinessStatus, string> = {
  complete: "bg-green-600 hover:bg-green-700 text-white",
  ready_ai: "bg-primary/80 hover:bg-primary text-primary-foreground",
  ready_ai_ref: "bg-blue-600 hover:bg-blue-700 text-white",
  needs_photos_0: "bg-destructive hover:bg-destructive/80 text-destructive-foreground",
};
