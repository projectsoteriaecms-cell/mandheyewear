/**
 * Client-side mirror of edge function prompt logic.
 * Used to preview/edit prompts before sending to generate-product-image.
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

export function buildFramePrompts(product: ProductForPrompt): ShotPrompt[] {
  const desc = describeProduct(product);
  const branded = isKnownBrand(product.brand);
  const brandNote = branded
    ? `The frame is authentic ${product.brand}. You MUST visibly maintain any original subtle engravings, logos, or serial numbers on the frame itself. Do not remove them.`
    : "";

  const studioRule =
    "Seamless pure white studio background, soft professional commercial lighting, high resolution e-commerce product photography. No model, frame only.";

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
      prompt: `Slightly elevated rear view of ${desc} eyeglasses frame, looking at the back of the glasses. Purpose: show the hinges, the nose pads, and the inside of the temple arms. ${branded ? "This angle is crucial for showing inner-temple markings like model numbers or 'Made in Italy'. Ensure those original details are visible." : ""} ${studioRule}`,
    },
    {
      slug: "macro",
      label: SHOT_LABELS.macro,
      prompt: `Extreme close-up macro shot of ${desc} eyeglasses frame, focusing tightly on the temple hinge area or lens corner where the most prominent branding detail is located${branded ? ` (the ${product.brand} logo)` : ""}. Use dramatic lighting to highlight the metallic or engraved texture to prove authenticity and quality. ${studioRule}`,
    },
    {
      slug: "packaging",
      label: SHOT_LABELS.packaging,
      prompt: `Luxurious studio shot of ${desc} eyeglasses frame resting elegantly on top of a closed premium cylindrical hard case made of fine-grain leather${product.color ? ` in a color complementing ${product.color}` : ""}. ${branded ? `The original ${product.brand} brand logo is still visible on the frame. The brand name "${product.brand}" is cleanly featured on the leather case, showing credibility and authenticity.` : `The brand name "M&H Opticals" is cleanly embossed onto the top surface of the leather case.`} Seamless pure white studio background, soft professional commercial lighting, high resolution.`,
    },
  ];
}

export function buildReferenceFramePrompts(product: ProductForPrompt): ShotPrompt[] {
  const desc = describeProduct(product);
  const baseInstruction = `This is a reference photo of the actual "${desc}" eyeglasses frame. You MUST preserve the exact color, shape, material, proportions, and design details of this specific frame. Re-render it as a professional e-commerce product photo with:`;
  const studioRule = "Seamless pure white studio background, soft professional commercial lighting, high resolution. No model, frame only.";

  return [
    { slug: "hero", label: SHOT_LABELS.hero, prompt: `${baseInstruction} Classic three-quarter front view — the main e-commerce thumbnail. Sharp focus on the front frame and the near temple arm. ${studioRule}` },
    { slug: "front", label: SHOT_LABELS.front, prompt: `${baseInstruction} Direct head-on front view. Perfectly symmetrical composition. Temples open, extending straight back. ${studioRule}` },
    { slug: "side", label: SHOT_LABELS.side, prompt: `${baseInstruction} Pure 90-degree side profile view. Sharp focus along the entire length of the visible temple arm. ${studioRule}` },
    { slug: "rear", label: SHOT_LABELS.rear, prompt: `${baseInstruction} Slightly elevated rear view, looking at the back of the glasses. Show the hinges, nose pads, and inside of the temple arms. ${studioRule}` },
    { slug: "macro", label: SHOT_LABELS.macro, prompt: `${baseInstruction} Extreme close-up macro shot focusing tightly on the temple hinge area or lens corner. Use dramatic lighting to highlight texture and quality. ${studioRule}` },
    { slug: "packaging", label: SHOT_LABELS.packaging, prompt: `${baseInstruction} The frame resting elegantly on top of a closed premium cylindrical hard case made of fine-grain leather. The brand name "M&H Opticals" is cleanly embossed onto the top surface of the leather case. ${studioRule}` },
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

/** Get all prompts for a product based on its type and brand */
export function getProductPrompts(
  product: ProductForPrompt,
  referenceMode: boolean
): ShotPrompt[] {
  if (product.item_type !== "frames") {
    return [buildNonFramePrompt(product)];
  }
  return referenceMode
    ? buildReferenceFramePrompts(product)
    : buildFramePrompts(product);
}
