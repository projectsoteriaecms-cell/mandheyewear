/**
 * Client-side mirror of edge function prompt logic.
 * Used to preview/edit prompts before sending to generate-product-image.
 * 
 * Unified prompt builder: always reference-aware, context-adaptive.
 */

import { isKnownBrand } from "./brand-classification";

export interface ProductForPrompt {
  name: string;
  brand?: string | null;
  color?: string | null;
  material?: string | null;
  style?: string | null;
  gender?: string | null;
  item_type?: string | null;
  // From frame_attributes join
  model_code?: string | null;
  frame_shape?: string | null;
  frame_material?: string | null;
}

export interface ShotPrompt {
  slug: string;
  label: string;
  prompt: string;
}

export const SHOT_LABELS: Record<string, string> = {
  hero: "Hero (3/4 View)",
  front: "Direct Front",
  side: "Side Profile",
  rear: "Rear / Interior",
  macro: "Macro Detail",
  packaging: "Luxury Packaging",
};

export const SHOT_SLUGS = ["hero", "front", "side", "rear", "macro", "packaging"];

function describeProduct(p: ProductForPrompt): string {
  const parts: string[] = [];
  if (p.brand) parts.push(p.brand);
  if (p.model_code) {
    parts.push(`Model ${p.model_code}`);
  } else {
    parts.push(p.name);
  }
  if (p.color) parts.push(`in ${p.color}`);
  if (p.frame_material || p.material) parts.push(`(${p.frame_material || p.material})`);
  if (p.frame_shape) parts.push(`${p.frame_shape} shape`);
  else if (p.style) parts.push(`${p.style} style`);
  if (p.gender && p.gender !== "unisex") parts.push(`for ${p.gender}`);
  return parts.join(" ");
}

interface PromptOptions {
  hasReference: boolean;
  isKnown: boolean;
}

/**
 * Unified frame prompt builder.
 * - When hasReference=true: instructs AI to preserve the exact frame from the reference photo
 * - Brand-aware: known brands get logo preservation notes; house brands get M&H packaging
 */
export function buildFramePrompts(product: ProductForPrompt, options?: PromptOptions): ShotPrompt[] {
  const { hasReference = false, isKnown = isKnownBrand(product.brand) } = options || {};
  const desc = describeProduct(product);
  const studioRule = "Seamless pure white studio background, soft professional commercial lighting, high resolution e-commerce product photography. No model, frame only.";

  if (hasReference) {
    // Reference-based: preserve exact frame design from the uploaded photo
    const baseInstruction = `This is a reference photo of the actual "${desc}" eyeglasses frame. You MUST preserve the exact color, shape, material, proportions, and design details of this specific frame. Re-render it as a professional e-commerce product photo with:`;
    
    const brandDetail = isKnown
      ? `Maintain any original ${product.brand} logos, engravings, or serial numbers visible on the frame.`
      : "";

    return [
      {
        slug: "hero",
        label: SHOT_LABELS.hero,
        prompt: `${baseInstruction} Classic three-quarter front view — the main e-commerce thumbnail. Sharp focus on the front frame and the near temple arm. ${brandDetail} ${studioRule}`,
      },
      {
        slug: "front",
        label: SHOT_LABELS.front,
        prompt: `${baseInstruction} Direct head-on front view. Perfectly symmetrical composition. Temples open, extending straight back. ${brandDetail} ${studioRule}`,
      },
      {
        slug: "side",
        label: SHOT_LABELS.side,
        prompt: `${baseInstruction} Pure 90-degree side profile view. Sharp focus along the entire length of the visible temple arm. ${brandDetail} ${studioRule}`,
      },
      {
        slug: "rear",
        label: SHOT_LABELS.rear,
        prompt: `${baseInstruction} Slightly elevated rear view, looking at the back of the glasses. Show the hinges, nose pads, and inside of the temple arms. ${isKnown ? "Show inner-temple markings like model numbers. " : ""}${studioRule}`,
      },
      {
        slug: "macro",
        label: SHOT_LABELS.macro,
        prompt: `${baseInstruction} Extreme close-up macro shot focusing tightly on the temple hinge area or lens corner${isKnown ? ` where the ${product.brand} logo is located` : ""}. Use dramatic lighting to highlight texture and quality. ${studioRule}`,
      },
      {
        slug: "packaging",
        label: SHOT_LABELS.packaging,
        prompt: `${baseInstruction} The frame resting elegantly on top of a closed premium cylindrical hard case made of fine-grain leather${product.color ? ` in a color complementing ${product.color}` : ""}. ${isKnown ? `The brand name "${product.brand}" is cleanly featured on the leather case.` : `The brand name "M&H Opticals" is cleanly embossed onto the top surface of the leather case.`} ${studioRule}`,
      },
    ];
  }

  // Text-only fallback (should rarely be used now that references are required)
  const brandNote = isKnown
    ? `The frame is authentic ${product.brand}. You MUST visibly maintain any original subtle engravings, logos, or serial numbers on the frame itself. Do not remove them.`
    : "";

  return [
    {
      slug: "hero",
      label: SHOT_LABELS.hero,
      prompt: `Professional product photo of ${desc} eyeglasses frame. Classic three-quarter front view — the main e-commerce thumbnail. Sharp focus on the front frame and the near temple arm. The lighting emphasizes the premium material finish. ${brandNote} ${studioRule}`,
    },
    {
      slug: "front",
      label: SHOT_LABELS.front,
      prompt: `Direct head-on front view of ${desc} eyeglasses frame. Perfectly symmetrical composition. The temples are open and extending straight back, slightly blurred by depth of field. Purpose: clearly show the shape of the lenses and the bridge fit. ${brandNote} ${studioRule}`,
    },
    {
      slug: "side",
      label: SHOT_LABELS.side,
      prompt: `Pure 90-degree side profile view of ${desc} eyeglasses frame. Sharp focus along the entire length of the visible temple arm. Purpose: show the thickness of the frame, the design of the temple arm, and the ear bend. ${brandNote} ${studioRule}`,
    },
    {
      slug: "rear",
      label: SHOT_LABELS.rear,
      prompt: `Slightly elevated rear view of ${desc} eyeglasses frame, looking at the back of the glasses. Purpose: show the hinges, the nose pads, and the inside of the temple arms. ${isKnown ? "This angle is crucial for showing inner-temple markings like model numbers or 'Made in Italy'. Ensure those original details are visible." : ""} ${studioRule}`,
    },
    {
      slug: "macro",
      label: SHOT_LABELS.macro,
      prompt: `Extreme close-up macro shot of ${desc} eyeglasses frame, focusing tightly on the temple hinge area or lens corner where the most prominent branding detail is located${isKnown ? ` (the ${product.brand} logo)` : ""}. Use dramatic lighting to highlight the metallic or engraved texture to prove authenticity and quality. ${studioRule}`,
    },
    {
      slug: "packaging",
      label: SHOT_LABELS.packaging,
      prompt: `Luxurious studio shot of ${desc} eyeglasses frame resting elegantly on top of a closed premium cylindrical hard case made of fine-grain leather${product.color ? ` in a color complementing ${product.color}` : ""}. ${isKnown ? `The original ${product.brand} brand logo is still visible on the frame. The brand name "${product.brand}" is cleanly featured on the leather case, showing credibility and authenticity.` : `The brand name "M&H Opticals" is cleanly embossed onto the top surface of the leather case.`} Seamless pure white studio background, soft professional commercial lighting, high resolution.`,
    },
  ];
}

export function buildNonFramePrompt(product: ProductForPrompt): ShotPrompt {
  const { name, brand, item_type } = product;
  let prompt: string;
  switch (item_type) {
    case "contact_lenses":
      prompt = `Product photo of ${name} contact lens box packaging${brand ? ` by ${brand}` : ""}. Clean studio shot, white background, e-commerce style, high resolution.`;
      break;
    case "lenses":
      prompt = `Product photo of ${name} optical lens${brand ? ` by ${brand}` : ""}. Clean studio shot, white background, e-commerce style, high resolution.`;
      break;
    case "solutions":
      prompt = `Product photo of ${name} eye care solution bottle${brand ? ` by ${brand}` : ""}. Clean studio shot, white background, e-commerce product photography.`;
      break;
    default:
      prompt = `Professional product photo of ${name}${brand ? ` by ${brand}` : ""}. Studio shot, white background, e-commerce style, high resolution.`;
  }
  return { slug: "primary", label: "Product Photo", prompt };
}

/** Get all prompts for a product based on its type, brand, and reference availability */
export function getProductPrompts(
  product: ProductForPrompt,
  hasReference: boolean
): ShotPrompt[] {
  if (product.item_type !== "frames") {
    return [buildNonFramePrompt(product)];
  }
  return buildFramePrompts(product, {
    hasReference,
    isKnown: isKnownBrand(product.brand),
  });
}
