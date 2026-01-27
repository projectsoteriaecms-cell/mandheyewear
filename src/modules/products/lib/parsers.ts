import type { BrandLine, ItemType, ParsedDimensions } from "../types";

/**
 * Parse frame dimensions from various formats
 * Supports: "52-18-145", "52mm x 18mm x 145mm", "52/18/145"
 */
export function parseDimensions(dimString: string): ParsedDimensions {
  if (!dimString || typeof dimString !== "string") {
    return {};
  }

  const cleaned = dimString.trim().toLowerCase();

  // Pattern 1: "52-18-145" or "52/18/145"
  const dashSlashPattern = /^(\d+)\s*[-\/]\s*(\d+)\s*[-\/]\s*(\d+)$/;
  const dashSlashMatch = cleaned.match(dashSlashPattern);
  if (dashSlashMatch) {
    return {
      lens_width: parseInt(dashSlashMatch[1], 10),
      bridge_size: parseInt(dashSlashMatch[2], 10),
      temple_length: parseInt(dashSlashMatch[3], 10),
    };
  }

  // Pattern 2: "52mm x 18mm x 145mm" or "52 x 18 x 145"
  const xPattern = /^(\d+)\s*(?:mm)?\s*x\s*(\d+)\s*(?:mm)?\s*x\s*(\d+)\s*(?:mm)?$/;
  const xMatch = cleaned.match(xPattern);
  if (xMatch) {
    return {
      lens_width: parseInt(xMatch[1], 10),
      bridge_size: parseInt(xMatch[2], 10),
      temple_length: parseInt(xMatch[3], 10),
    };
  }

  // Pattern 3: Just numbers separated by spaces "52 18 145"
  const spacePattern = /^(\d+)\s+(\d+)\s+(\d+)$/;
  const spaceMatch = cleaned.match(spacePattern);
  if (spaceMatch) {
    return {
      lens_width: parseInt(spaceMatch[1], 10),
      bridge_size: parseInt(spaceMatch[2], 10),
      temple_length: parseInt(spaceMatch[3], 10),
    };
  }

  return {};
}

/**
 * Normalize brand line value to valid enum
 */
export function normalizeBrandLine(value: string): BrandLine | null {
  if (!value) return null;

  const cleaned = value.toLowerCase().trim().replace(/[\s_-]+/g, "_");

  // Direct matches
  if (cleaned === "soteria_medical" || cleaned === "soteria") {
    return "soteria_medical";
  }
  if (
    cleaned === "m_and_h_fashion" ||
    cleaned === "m&h" ||
    cleaned === "mh" ||
    cleaned === "m_h" ||
    cleaned === "mandh" ||
    cleaned === "m_and_h"
  ) {
    return "m_and_h_fashion";
  }

  // Partial matches
  if (cleaned.includes("soteria") || cleaned.includes("medical")) {
    return "soteria_medical";
  }
  if (cleaned.includes("fashion") || cleaned.includes("m&h") || cleaned.includes("mh")) {
    return "m_and_h_fashion";
  }

  return null;
}

/**
 * Normalize item type value to valid enum
 */
export function normalizeItemType(value: string): ItemType | null {
  if (!value) return null;

  const cleaned = value.toLowerCase().trim().replace(/[\s-]+/g, "_");

  const typeMap: Record<string, ItemType> = {
    frame: "frames",
    frames: "frames",
    eyeglasses: "frames",
    sunglasses: "frames",
    spectacles: "frames",

    lens: "lenses",
    lenses: "lenses",

    contact_lens: "contact_lenses",
    contact_lenses: "contact_lenses",
    contacts: "contact_lenses",
    contactlens: "contact_lenses",

    solution: "solutions",
    solutions: "solutions",
    lens_solution: "solutions",

    medication: "medications",
    medications: "medications",
    medicine: "medications",
    drug: "medications",
    drugs: "medications",

    accessory: "accessories",
    accessories: "accessories",
    case: "accessories",
    cloth: "accessories",
    cleaning_cloth: "accessories",

    cleanser: "cleanser",
    cleaner: "cleanser",

    packaging: "packaging",
    package: "packaging",
    box: "packaging",

    other: "other",
    misc: "other",
    miscellaneous: "other",
  };

  return typeMap[cleaned] || null;
}

/**
 * Parse price from various formats
 * Handles: "85000", "85,000", "₦85,000", "NGN 85000", "85000.00"
 */
export function parsePrice(value: string | number): number | null {
  if (typeof value === "number") {
    return value > 0 ? Math.round(value) : null;
  }

  if (!value || typeof value !== "string") return null;

  // Remove currency symbols, commas, and whitespace
  const cleaned = value
    .replace(/[₦NGN$€£]/gi, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();

  const num = parseFloat(cleaned);
  return !isNaN(num) && num > 0 ? Math.round(num) : null;
}
