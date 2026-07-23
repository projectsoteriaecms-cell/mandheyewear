// ─────────────────────────────────────────────────────────────────────────────
// Lens System Constants
// Single source of truth for lens taxonomy, gate rules, and display labels.
// ─────────────────────────────────────────────────────────────────────────────

// ── Lens Types ────────────────────────────────────────────────────────────────
export type LensType =
  | "frame_only"
  | "plano_clear"
  | "plano_tinted"
  | "plano_blue_light"
  | "plano_photochromic"
  | "sv_distance"
  | "sv_reading"
  | "sv_computer"
  | "bifocal"
  | "progressive"
  | "high_index"
  | "prism";

export type LensCoating =
  | "ar"
  | "uv400"
  | "scratch"
  | "blue_light"
  | "hydrophobic"
  | "photochromic_coating";

export type LensIndex = "1.50" | "1.56" | "1.61" | "1.67" | "1.74";

// ── Tier groupings ────────────────────────────────────────────────────────────
export type LensTier = "none" | "plano" | "single_vision" | "multifocal" | "specialty";

export const LENS_TIER_FOR: Record<LensType, LensTier> = {
  frame_only:          "none",
  plano_clear:         "plano",
  plano_tinted:        "plano",
  plano_blue_light:    "plano",
  plano_photochromic:  "plano",
  sv_distance:         "single_vision",
  sv_reading:          "single_vision",
  sv_computer:         "single_vision",
  bifocal:             "multifocal",
  progressive:         "multifocal",
  high_index:          "specialty",
  prism:               "specialty",
};

export const NEEDS_PRESCRIPTION: Record<LensType, boolean> = {
  frame_only:          false,
  plano_clear:         false,
  plano_tinted:        false,
  plano_blue_light:    false,
  plano_photochromic:  false,
  sv_distance:         true,
  sv_reading:          true,
  sv_computer:         true,
  bifocal:             true,
  progressive:         true,
  high_index:          true,
  prism:               true,
};

// Hard gate = cannot complete order online; must book in-clinic fitting
export const REQUIRES_FITTING: Record<LensType, boolean> = {
  frame_only:          false,
  plano_clear:         false,
  plano_tinted:        false,
  plano_blue_light:    false,
  plano_photochromic:  false,
  sv_distance:         false,
  sv_reading:          false,
  sv_computer:         false,
  bifocal:             true,
  progressive:         true,
  high_index:          false,  // recommended but not mandatory
  prism:               true,
};

// ── Display Labels ────────────────────────────────────────────────────────────
export const LENS_TIER_LABELS: Record<LensTier, string> = {
  none:          "Frame Only",
  plano:         "No Prescription (Plano)",
  single_vision: "Single Vision",
  multifocal:    "Bifocal / Progressive",
  specialty:     "Specialty Lenses",
};

export const LENS_TIER_DESCRIPTIONS: Record<LensTier, string> = {
  none:          "Frame supplied without any lenses. Ideal if you already have lenses or will add them later.",
  plano:         "Zero-power lenses for fashion, UV protection, or screen use. No prescription needed.",
  single_vision: "Corrects one distance — near, far, or intermediate. The most common prescription lens.",
  multifocal:    "Corrects multiple distances. Requires precise in-clinic measurements.",
  specialty:     "High-index or prism lenses for complex prescriptions. Optometrist review required.",
};

export const LENS_TYPE_LABELS: Record<LensType, string> = {
  frame_only:          "Frame Only (no lenses)",
  plano_clear:         "Clear Plano",
  plano_tinted:        "Tinted / Sunglasses",
  plano_blue_light:    "Blue Light Blocking",
  plano_photochromic:  "Photochromic (Transitions™)",
  sv_distance:         "Distance Vision (Myopia)",
  sv_reading:          "Reading Vision (Presbyopia)",
  sv_computer:         "Computer / Intermediate",
  bifocal:             "Bifocal",
  progressive:         "Progressive (Varifocal)",
  high_index:          "High-Index Thin Lens",
  prism:               "Prism Lens",
};

export const LENS_TYPE_DESCRIPTIONS: Record<LensType, string> = {
  frame_only:          "No lenses included — useful if you already have lenses or plan to get them fitted in-store.",
  plano_clear:         "Standard clear lens with no power. Great for protection or cosmetic use.",
  plano_tinted:        "Tinted lens that blocks UV rays. Perfect as sunglasses.",
  plano_blue_light:    "Blocks high-energy blue light from screens. Clear or very slightly tinted.",
  plano_photochromic:  "Clear indoors, automatically darkens in sunlight.",
  sv_distance:         "Corrects nearsightedness — you can't see clearly in the distance.",
  sv_reading:          "Corrects farsightedness or reading difficulty — you can't see up close clearly.",
  sv_computer:         "Optimised for screen distance (40–70 cm). Reduces eye strain.",
  bifocal:             "Two zones: distance on top, reading at the bottom. Visible dividing line.",
  progressive:         "Seamless transition from distance to reading. Requires precise fitting at our clinic.",
  high_index:          "Thinner, lighter lenses for strong prescriptions (>±4.00 D). Recommended consultation.",
  prism:               "Corrects binocular alignment issues. Must be prescribed and fitted by our optometrist.",
};

// ── Coatings ──────────────────────────────────────────────────────────────────
export const COATING_LABELS: Record<LensCoating, string> = {
  ar:                  "Anti-Reflection (AR)",
  uv400:               "UV400 Protection",
  scratch:             "Scratch Resistant",
  blue_light:          "Blue Light Filter",
  hydrophobic:         "Hydrophobic (Easy Clean)",
  photochromic_coating:"Photochromic Tint",
};

export const COATING_DESCRIPTIONS: Record<LensCoating, string> = {
  ar:                  "Eliminates glare and reflections. Highly recommended for all lenses.",
  uv400:               "Blocks 100% of UV-A and UV-B rays.",
  scratch:             "Hard coating that extends lens life.",
  blue_light:          "Filters blue-violet light from screens and LED lighting.",
  hydrophobic:         "Water and oil repellent surface — easier to clean, stays clearer longer.",
  photochromic_coating:"Adds light-reactive tinting to your prescription lens.",
};

export const RECOMMENDED_COATINGS: LensCoating[] = ["ar", "uv400", "scratch"];

// ── Lens Index ────────────────────────────────────────────────────────────────
export const LENS_INDEX_LABELS: Record<LensIndex, string> = {
  "1.50": "Standard (1.50) — up to ±2.00 D",
  "1.56": "Mid-index (1.56) — up to ±4.00 D",
  "1.61": "High (1.61) — up to ±6.00 D",
  "1.67": "Ultra-high (1.67) — up to ±8.00 D",
  "1.74": "Ultra-thin (1.74) — above ±8.00 D",
};

// Recommended minimum index based on prescription strength
export function recommendedIndex(maxPower: number): LensIndex {
  const abs = Math.abs(maxPower);
  if (abs <= 2)  return "1.50";
  if (abs <= 4)  return "1.56";
  if (abs <= 6)  return "1.61";
  if (abs <= 8)  return "1.67";
  return "1.74";
}

// ── Tier ordering (for the picker) ────────────────────────────────────────────
export const TIER_ORDER: LensTier[] = ["none", "plano", "single_vision", "multifocal", "specialty"];

export const TYPES_IN_TIER: Record<LensTier, LensType[]> = {
  none:          ["frame_only"],
  plano:         ["plano_clear", "plano_tinted", "plano_blue_light", "plano_photochromic"],
  single_vision: ["sv_distance", "sv_reading", "sv_computer"],
  multifocal:    ["bifocal", "progressive"],
  specialty:     ["high_index", "prism"],
};

// ── Pricing (NGN — override in DB / admin settings later) ────────────────────
// These are base prices for the lens only; frame price is separate.
export const LENS_BASE_PRICES: Record<LensType, number> = {
  frame_only:          0,
  plano_clear:         0,
  plano_tinted:        2000,
  plano_blue_light:    3000,
  plano_photochromic:  8000,
  sv_distance:         5000,
  sv_reading:          5000,
  sv_computer:         6000,
  bifocal:             18000,
  progressive:         35000,
  high_index:          15000,
  prism:               25000,
};

export const COATING_PRICES: Record<LensCoating, number> = {
  ar:                  2000,
  uv400:               1000,
  scratch:             1500,
  blue_light:          2500,
  hydrophobic:         2000,
  photochromic_coating:6000,
};

export function calculateLensPrice(type: LensType, coatings: LensCoating[]): number {
  // Frame-only means no lens at all -- a coating is a lens treatment, so it
  // cannot apply here regardless of what's sitting in coatings state. Without
  // this guard, the configurator's default coatings (AR + UV400) silently
  // priced themselves into a "no lenses" order, since frame_only jumps
  // straight from tier selection to the summary and never visits the
  // coatings step where a visitor could see or clear them.
  if (type === "frame_only") return 0;
  return LENS_BASE_PRICES[type] + coatings.reduce((sum, c) => sum + (COATING_PRICES[c] ?? 0), 0);
}
