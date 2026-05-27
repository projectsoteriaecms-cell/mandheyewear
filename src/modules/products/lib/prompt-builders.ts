/**
 * Client-side mirror of edge function prompt logic.
 * Used to preview/edit prompts before sending to generate-product-image.
 *
 * Balanced 6-shot gallery:
 *   hero            — studio 3/4 hero, frame only (white bg)
 *   front           — studio dead-on, frame only (white bg)
 *   mannequin       — frame on dark abstract display mannequin head
 *   lifestyle_male  — Black/African male model wearing the frame
 *   lifestyle_female — Black/African female model wearing the frame
 *   spec_diagram    — technical dimension illustration
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
  // Measurements (mm) from frame_attributes
  total_width?: number | null;
  lens_width?: number | null;
  lens_height?: number | null;
  bridge_size?: number | null;
  temple_length?: number | null;
}

export interface ShotPrompt {
  slug: string;
  label: string;
  prompt: string;
}

export const SHOT_LABELS: Record<string, string> = {
  hero:             "Hero (3/4 View)",
  front:            "Direct Front",
  mannequin:        "Mannequin Display",
  lifestyle_male:   "Lifestyle — Male",
  lifestyle_female: "Lifestyle — Female",
  spec_diagram:     "Spec Diagram",
};

export const SHOT_SLUGS = [
  "hero",
  "front",
  "mannequin",
  "lifestyle_male",
  "lifestyle_female",
  "spec_diagram",
];

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
  isKnown?: boolean;
}

/**
 * Unified frame prompt builder — mirrors the edge function's buildFramePrompts.
 * - hasReference=true: instructs AI to treat attached image as ground truth
 * - isKnown: branded frames get logo preservation notes
 */
export function buildFramePrompts(
  product: ProductForPrompt,
  options?: PromptOptions
): ShotPrompt[] {
  const { hasReference = false, isKnown = isKnownBrand(product.brand) } = options || {};
  const desc = describeProduct(product);

  // ── Shared studio rules for white-background product shots ──
  const studioRule = [
    "STUDIO RULES (non-negotiable):",
    "• Background: seamless pure white #FFFFFF — no gradient, no texture, no vignette.",
    "• Lighting: large soft overhead softbox, neutral 5500K white balance, gentle diffused highlights. No harsh specular hot spots.",
    "• Shadow: a single very soft, low-opacity contact shadow directly beneath the frame — subtle realistic ground shadow only. No cast shadows anywhere else.",
    "• Lenses: clear and fully transparent unless the product is sunglasses (in which case preserve the original lens tint from the reference).",
    "• Composition: frame perfectly centred, occupying ≈70% of the canvas width, equal white margin on all four sides.",
    "• Focus: tack-sharp across the entire frame — every hinge screw, nose-pad edge, and temple tip must be razor sharp.",
    "• Output: square 1:1 crop, ultra-high resolution, commercial e-commerce catalog quality.",
    "• Absolutely no: model, face, hands, props, packaging, cases, text overlays, watermarks, or any object other than the eyewear frame itself.",
  ].join(" ");

  const brandDetail = isKnown
    ? `Preserve any original ${product.brand} logos, engravings, etched model numbers, or temple-tip markings EXACTLY as they appear.`
    : "";

  const frameAnchor = hasReference
    ? `The attached image is the actual reference photo of the "${desc}" eyewear. You MUST preserve the EXACT color, shape, material finish, proportions, hinge style, bridge style, and every visible design detail of this specific frame — treat it as the absolute ground truth.`
    : `Create a professional product photograph of the "${desc}" eyewear — ${product.color ? `${product.color}, ` : ""}${product.style || "eyeglasses"} style${product.brand ? `, by ${product.brand}` : ""}.`;

  // ── Shot 1: Studio Hero ──────────────────────────────────────────────────
  const heroPrompt = `${frameAnchor}

Re-render it as the MAIN e-commerce hero shot — the first image a customer sees on the product page.

View: Classic 3/4 front-left angle. The frame faces the viewer and is turned approximately 20–25° to the left (camera-right). Both temples are open at 90° and fully visible — the near temple is in tack-sharp focus, the far temple recedes naturally.
Purpose: Show the complete frame design, colour, material, and personality in a single compelling thumbnail image.
${brandDetail}
${studioRule}`;

  // ── Shot 2: Studio Front ─────────────────────────────────────────────────
  const frontPrompt = `${frameAnchor}

Re-render it as a DIRECT FRONT VIEW studio product photograph — perfectly symmetrical.

View: Camera positioned dead-centre at lens-height. Frame faces straight ahead. Both temples open and extending straight back. The lens openings are fully visible, bridge centred.
Purpose: Show the exact frame shape, lens height, bridge width, nose-pad position, and bilateral symmetry with zero distortion.
${brandDetail}
${studioRule}`;

  // ── Shot 3: Mannequin Display ────────────────────────────────────────────
  const mannequinPrompt = `${frameAnchor}

Create a MANNEQUIN DISPLAY SHOT — the frame fitted on a professional eyewear display mannequin head, exactly as seen in premium optical boutiques and brand lookbooks.

MANNEQUIN: A matte black or dark charcoal plastic eyewear display bust head — abstract, sculptural, no hair, no expression (similar to a luxury retail display form). The head occupies the upper 60–70% of the frame. The glasses sit naturally on the mannequin: nose pads resting on the nose bridge, temples running back over where the ears would be, sitting at the correct angle.
FRAME ACCURACY: The frame must be IDENTICAL to the reference — exact colours, shape, and proportions. The mannequin simply provides wearing context.
COMPOSITION: Portrait crop, mannequin centred, frame clearly the visual hero. Show the 3/4 front angle naturally as it would appear when displayed.
BACKGROUND: Pure white or very light neutral grey studio background. Soft professional lighting that shows both the mannequin form and the frame detail equally well.
${brandDetail}
DO NOT show a human face — the mannequin must be an abstract sculptural display form only.`;

  // ── Shot 4: Lifestyle — Black/African Male Model ─────────────────────────
  const lifestyleMalePrompt = `${frameAnchor}

Create a PROFESSIONAL LIFESTYLE EDITORIAL PORTRAIT showing a Black/African man wearing these exact frames.

FRAME ACCURACY (critical): The eyewear worn in the output must be IDENTICAL to the reference — exact colours, shape, and proportions. Do not alter the frame design in any way.

PERSON: A well-groomed Black/African man, approximately 28–35 years old. Dark skin tone. Confident, composed expression — looking slightly off-camera or directly at the viewer. Natural, modern appearance.
STYLING: Smart casual or professional — clean contemporary style that reflects a modern African professional or lifestyle aesthetic.
EYEWEAR FIT: Frame sitting level on the nose bridge, nose pads correctly positioned, temples running straight back over the ears. Properly and comfortably worn.
COMPOSITION: Close-up bust or portrait shot. Both the person's face and the frame are in sharp, equal focus. The frame is clearly readable as the product hero.
BACKGROUND: Clean light grey or soft white studio backdrop. Alternatively: subtly blurred neutral lifestyle environment (soft bokeh — office, cafe, outdoor natural light).
LIGHTING: Professional portrait lighting that beautifully renders deep/dark skin tones — warm, flattering, luminous. No harsh facial shadows. The frame must remain clearly visible and sharp against the face.
MOOD: Confident, stylish, aspirational. The standard of a premium African eyewear brand's editorial campaign.
${brandDetail}`;

  // ── Shot 5: Lifestyle — Black/African Female Model ───────────────────────
  const lifestyleFemalePrompt = `${frameAnchor}

Create a PROFESSIONAL LIFESTYLE EDITORIAL PORTRAIT showing a Black/African woman wearing these exact frames.

FRAME ACCURACY (critical): The eyewear worn in the output must be IDENTICAL to the reference — exact colours, shape, and proportions. Do not alter the frame design in any way.

PERSON: A stylish Black/African woman, approximately 25–35 years old. Dark skin tone. Confident, elegant expression — looking slightly off-camera or directly at the viewer. Natural beauty — could have natural hair, braids, locs, or a headwrap. Modern and authentic.
STYLING: Elegant and contemporary — reflects premium modern African fashion sensibility. Could be smart casual, professional, or high-fashion editorial. Not stereotyped or traditional.
EYEWEAR FIT: Frame sitting level on the nose bridge, nose pads correctly positioned, temples running straight back. Properly and comfortably worn.
COMPOSITION: Close-up bust or portrait shot. Both the person's face and the frame are in sharp, equal focus. The frame is clearly readable as the product hero.
BACKGROUND: Clean light grey or soft white studio backdrop. Alternatively: subtly blurred neutral lifestyle environment with elegant warmth.
LIGHTING: Professional portrait lighting that beautifully renders deep/dark skin tones — warm, flattering, luminous. No harsh shadows. The frame must remain clearly visible and sharp.
MOOD: Sophisticated, confident, aspirational — the standard of a premium African eyewear brand lookbook. Authentic representation, not a generic stock photo aesthetic.
${brandDetail}`;

  // ── Shot 6: Technical Spec Diagram ──────────────────────────────────────
  const totalWidthVal  = product.total_width  ? `${product.total_width}mm`  : null;
  const lensWidthVal   = product.lens_width   ? `${product.lens_width}mm`   : null;
  const lensHeightVal  = product.lens_height  ? `${product.lens_height}mm`  : null;
  const bridgeVal      = product.bridge_size  ? `${product.bridge_size}mm`  : null;
  const templeVal      = product.temple_length ? `${product.temple_length}mm` : null;

  const hasMeasurements = totalWidthVal || lensWidthVal || lensHeightVal || bridgeVal || templeVal;

  const measurementBlock = hasMeasurements
    ? `\nUSE THESE EXACT MEASUREMENTS (from product database — render them as label values on the diagram):\n` +
      (totalWidthVal ? `  • TOTAL WIDTH    = ${totalWidthVal}  ← outermost edge of left temple to outermost edge of right temple\n` : "") +
      (lensWidthVal  ? `  • LENS WIDTH     = ${lensWidthVal}   ← horizontal width of one single lens opening only\n` : "") +
      (bridgeVal     ? `  • BRIDGE         = ${bridgeVal}      ← gap between the two lens openings across the nose bridge\n` : "") +
      (lensHeightVal ? `  • LENS HEIGHT    = ${lensHeightVal}  ← vertical height of one lens opening\n` : "") +
      (templeVal     ? `  • TEMPLE LENGTH  = ${templeVal}      ← full length of one temple arm from hinge to tip\n` : "") +
      `\nThese are the numbers that must appear on the diagram — do not invent or approximate different values.`
    : `\nNo exact measurements on file — estimate from reference image using standard conventions (total width 125–145mm, lens width 48–58mm, bridge 14–22mm, lens height 35–50mm, temple length 135–155mm).`;

  const specDiagramPrompt = `${frameAnchor}

Using this reference to accurately trace the frame's silhouette and proportions, create a TECHNICAL SPECIFICATION DIAGRAM — the kind shown on Zeelool, SmartBuyGlasses, and Oakley product pages.

This is a TECHNICAL ILLUSTRATION — NOT a product photo. It must look like a precise product design drawing made in Adobe Illustrator.
${measurementBlock}

LAYOUT — two drawings side by side on a pure white canvas:

LEFT — FRONT VIEW (larger, occupying ~65% of canvas width):
  • Clean outline drawing of the complete frame front — two lens openings, bridge, nose pads, hinges. Outlines only, no shading, no colour fill.
  • TOTAL WIDTH arrow: a long double-headed horizontal arrow above the frame spanning the FULL outer width (temple hinge to temple hinge). Label: "TOTAL WIDTH${totalWidthVal ? ` ${totalWidthVal}` : ""}". This arrow is LONGER than the LENS WIDTH arrow.
  • LENS WIDTH arrow: a shorter double-headed horizontal arrow INSIDE one lens opening (left lens), spanning only the interior width of that single lens. Label: "LENS WIDTH${lensWidthVal ? ` ${lensWidthVal}` : ""}". This arrow must visibly be SHORTER than the TOTAL WIDTH arrow above — they are different measurements and must not look the same.
  • BRIDGE arrow: a small double-headed horizontal arrow across the nose bridge gap between the two lenses. Label: "BRIDGE${bridgeVal ? ` ${bridgeVal}` : ""}".
  • LENS HEIGHT arrow: a double-headed vertical arrow along the side of one lens opening showing its vertical height. Label: "LENS HEIGHT${lensHeightVal ? ` ${lensHeightVal}` : ""}".

RIGHT — SIDE VIEW (smaller, occupying ~30% of canvas width):
  • Clean outline of one temple arm in profile — showing the arm from the hinge end to the curved ear tip.
  • TEMPLE LENGTH arrow: a double-headed horizontal arrow spanning the full length of the temple arm. Label: "TEMPLE LENGTH${templeVal ? ` ${templeVal}` : ""}".

VISUAL STYLE:
• Pure white background (#FFFFFF) — no grey, no shadow, no border.
• Thin precise black lines only (1–1.5px weight, consistent throughout).
• Dimension lines: standard technical drawing style — thin lines with small flat arrowheads at each end, using dotted or dashed extension lines where needed.
• Labels: clean sans-serif font (Helvetica or similar), small (8–10pt equivalent), positioned neatly beside each arrow with clear spacing.
• NO colour fill, NO shading, NO gradients, NO photographic elements — pure outline technical illustration only.
• The two drawings (front view + side view) should be clearly separated with clean white space between them.`;

  return [
    { slug: "hero",             label: SHOT_LABELS.hero,             prompt: heroPrompt },
    { slug: "front",            label: SHOT_LABELS.front,            prompt: frontPrompt },
    { slug: "mannequin",        label: SHOT_LABELS.mannequin,        prompt: mannequinPrompt },
    { slug: "lifestyle_male",   label: SHOT_LABELS.lifestyle_male,   prompt: lifestyleMalePrompt },
    { slug: "lifestyle_female", label: SHOT_LABELS.lifestyle_female, prompt: lifestyleFemalePrompt },
    { slug: "spec_diagram",     label: SHOT_LABELS.spec_diagram,     prompt: specDiagramPrompt },
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
