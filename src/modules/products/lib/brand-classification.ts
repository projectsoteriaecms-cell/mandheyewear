/**
 * Shared brand classification for PDCA image quality gate.
 * Known/luxury brands can use text-to-image AI generation.
 * House brands (M&H, etc.) require reference photos first.
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
]);

export function isKnownBrand(brand: string | null | undefined): boolean {
  if (!brand) return false;
  return LUXURY_BRANDS.has(brand.toUpperCase().trim());
}

/** Minimum reference photos required for house brand AI generation */
export const MIN_REFERENCE_PHOTOS = 2;

export type ImageReadinessStatus =
  | "complete"           // Full gallery exists
  | "ready_ai"           // Known brand, can generate from text
  | "ready_ai_ref"       // House brand with 2+ references
  | "needs_photos_0"     // House brand, 0 references
  | "needs_photos_1";    // House brand, 1 reference

export function getImageReadiness(
  brand: string | null | undefined,
  imageUrl: string | null,
  additionalImages: string[] | null
): ImageReadinessStatus {
  const totalImages = (imageUrl ? 1 : 0) + (additionalImages?.length ?? 0);

  if (totalImages >= 6) return "complete";

  if (isKnownBrand(brand)) return "ready_ai";

  // House brand
  if (totalImages >= MIN_REFERENCE_PHOTOS) return "ready_ai_ref";
  if (totalImages === 1) return "needs_photos_1";
  return "needs_photos_0";
}

export const READINESS_LABELS: Record<ImageReadinessStatus, string> = {
  complete: "Complete",
  ready_ai: "Ready for AI",
  ready_ai_ref: "Ready for AI (ref)",
  needs_photos_0: "Needs Photos (0/2)",
  needs_photos_1: "Needs Photos (1/2)",
};

export const READINESS_COLORS: Record<ImageReadinessStatus, string> = {
  complete: "bg-green-600 hover:bg-green-700 text-white",
  ready_ai: "bg-primary/80 hover:bg-primary text-primary-foreground",
  ready_ai_ref: "bg-blue-600 hover:bg-blue-700 text-white",
  needs_photos_0: "bg-destructive hover:bg-destructive/80 text-destructive-foreground",
  needs_photos_1: "bg-amber-500 hover:bg-amber-600 text-white",
};
