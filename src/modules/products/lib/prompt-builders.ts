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
BACKGROUND: Pure white (#FFFFFF) studio seamless background — no exceptions. No grey, no bokeh, no blurred environments, no gradients, no shadows on the wall behind the subject. The background must be completely flat, bright white from edge to edge.
LIGHTING: Professional portrait lighting that beautifully renders deep/dark skin tones — warm, flattering, luminous. No harsh facial shadows. The frame must remain clearly visible and sharp against the face.
MOOD: Confident, stylish, aspirational. The standard of a premium African eyewear brand's editorial campaign.
FORBIDDEN: grey background, coloured background, bokeh background, blurred office or cafe or outdoor setting, any environment or scene behind the subject, vignette, gradient wash.
${brandDetail}`;

  // ── Shot 5: Lifestyle — Black/African Female Model ───────────────────────
  const lifestyleFemalePrompt = `${frameAnchor}

Create a PROFESSIONAL LIFESTYLE EDITORIAL PORTRAIT showing a Black/African woman wearing these exact frames.

FRAME ACCURACY (critical): The eyewear worn in the output must be IDENTICAL to the reference — exact colours, shape, and proportions. Do not alter the frame design in any way.

PERSON: A stylish Black/African woman, approximately 25–35 years old. Dark skin tone. Confident, elegant expression — looking slightly off-camera or directly at the viewer. Natural beauty — could have natural hair, braids, locs, or a headwrap. Modern and authentic.
STYLING: Elegant and contemporary — reflects premium modern African fashion sensibility. Could be smart casual, professional, or high-fashion editorial. Not stereotyped or traditional.
EYEWEAR FIT: Frame sitting level on the nose bridge, nose pads correctly positioned, temples running straight back. Properly and comfortably worn.
COMPOSITION: Close-up bust or portrait shot. Both the person's face and the frame are in sharp, equal focus. The frame is clearly readable as the product hero.
BACKGROUND: Pure white (#FFFFFF) studio seamless background — no exceptions. No grey, no bokeh, no blurred environments, no gradients, no shadows on the wall behind the subject. The background must be completely flat, bright white from edge to edge.
LIGHTING: Professional portrait lighting that beautifully renders deep/dark skin tones — warm, flattering, luminous. No harsh shadows. The frame must remain clearly visible and sharp.
MOOD: Sophisticated, confident, aspirational — the standard of a premium African eyewear brand lookbook. Authentic representation, not a generic stock photo aesthetic.
FORBIDDEN: grey background, coloured background, bokeh background, blurred lifestyle environment, any scene or setting behind the subject, vignette, gradient wash.
${brandDetail}`;

  // ── Shot 6: Technical Spec Diagram ──────────────────────────────────────
  const tw  = product.total_width    ?? null;
  const lw  = product.lens_width     ?? null;
  const lh  = product.lens_height    ?? null;
  const br  = product.bridge_size    ?? null;
  const tl  = product.temple_length  ?? null;

  const totalWidthVal  = tw ? `${tw}mm`  : null;
  const lensWidthVal   = lw ? `${lw}mm`  : null;
  const lensHeightVal  = lh ? `${lh}mm`  : null;
  const bridgeVal      = br ? `${br}mm`  : null;
  const templeVal      = tl ? `${tl}mm`  : null;

  // ── Product-specific silhouette context ──
  const shapeDesc = product.frame_shape
    ? `The frame has a ${product.frame_shape} lens shape — the silhouette you draw must faithfully reflect this shape.`
    : `Trace the exact lens shape visible in the reference photo — do not substitute a generic shape.`;

  const materialDesc = product.frame_material || product.material
    ? `Frame material: ${product.frame_material || product.material}. Reflect appropriate structural characteristics — acetate = thick rims, metal = thin wire rims, rimless = no lens border.`
    : ``;

  const styleDesc = product.style ? `Frame style: ${product.style}.` : ``;

  // ── Smart lens tint detection from actual product fields ──
  const colorLower = (product.color    || "").toLowerCase();
  const styleLower = (product.style    || "").toLowerCase();
  const nameLower  = (product.name     || "").toLowerCase();
  const matLower   = (product.frame_material || product.material || "").toLowerCase();

  const tintKeywords  = ["brown", "amber", "grey", "gray", "smoke", "green", "blue", "rose",
                         "gold tint", "gradient", "tinted", "dark", "mirror", "flash", "polarized", "sunglass", "sun"];
  const clearKeywords = ["clear", "transparent", "crystal", "optical", "reading", "prescription"];

  const looksLikeSunglass = tintKeywords.some(k  => colorLower.includes(k) || styleLower.includes(k) || nameLower.includes(k) || matLower.includes(k));
  const looksLikeClear    = clearKeywords.some(k => colorLower.includes(k) || styleLower.includes(k) || nameLower.includes(k));
  const isTinted = looksLikeSunglass && !looksLikeClear;

  const tintColor = (() => {
    if (colorLower.includes("brown") || colorLower.includes("amber")) return "warm gradient brown (darker at top, lighter at bottom)";
    if (colorLower.includes("grey") || colorLower.includes("gray") || colorLower.includes("smoke")) return "neutral smoke grey gradient";
    if (colorLower.includes("green")) return "soft green tint";
    if (colorLower.includes("blue"))  return "subtle blue tint";
    if (colorLower.includes("rose") || colorLower.includes("pink")) return "soft rose/pink tint";
    if (colorLower.includes("mirror") || colorLower.includes("flash")) return "mirrored reflective finish";
    if (colorLower.includes("gold"))  return "warm amber-gold tint";
    return product.color ? `${product.color} tint matching the product colour` : "neutral grey gradient tint";
  })();

  const lensRendering = isTinted
    ? `LENSES: Render the lenses with a semi-transparent ${tintColor} — light enough that the frame outline is still visible, but clearly coloured. This is specific to this product.`
    : `LENSES: Render the lenses as clean empty outlines only — no fill, no tint, fully transparent inside the lens rim.`;

  // ── Endpiece geometry formula ──
  const endpieceNote = (tw && lw && br)
    ? (() => {
        const endpiece = Math.round((tw - (2 * lw) - br) / 2);
        return endpiece > 0
          ? `GEOMETRY NOTE — Total Width is NOT (2 × Lens Width) + Bridge:\n  (2 × ${lw}mm) + ${br}mm = ${2*lw + br}mm, but actual Total Width = ${tw}mm.\n  The difference (${tw - (2*lw + br)}mm ÷ 2 ≈ ${endpiece}mm per side) is the endpiece/lug hardware.\n  The TOTAL WIDTH arrow MUST extend ≈${endpiece}mm beyond the outer lens edge on each side.`
          : "";
      })()
    : `GEOMETRY NOTE — Total frame width is NOT (2 × Lens Width) + Bridge. Endpiece/lug hardware adds ≈3–6mm per side. The TOTAL WIDTH arrow must always extend visibly beyond the outer lens edges.`;

  const hasMeasurements = totalWidthVal || lensWidthVal || lensHeightVal || bridgeVal || templeVal;

  const measurementBlock = hasMeasurements
    ? `EXACT MEASUREMENTS from the product database:\n` +
      (totalWidthVal ? `  • TOTAL WIDTH   = ${totalWidthVal}  → full outer span including endpiece hardware\n` : "") +
      (lensWidthVal  ? `  • LENS WIDTH    = ${lensWidthVal}   → interior width of ONE single lens opening\n` : "") +
      (bridgeVal     ? `  • BRIDGE        = ${bridgeVal}      → gap between the two lenses at the nose\n` : "") +
      (lensHeightVal ? `  • LENS HEIGHT   = ${lensHeightVal}  → vertical interior height of one lens opening\n` : "") +
      (templeVal     ? `  • TEMPLE LENGTH = ${templeVal}      → full temple arm length, hinge to tip\n` : "") +
      `Use ONLY these numbers. Do not round, invent, or substitute.`
    : `No measurements on file — a placeholder diagram will be used. Add lens_width, bridge_size, and total_width under Frame Attributes to enable AI generation.`;

  const specDiagramPrompt = `${frameAnchor}

══════════════════════════════════════════════════════════════════
TECHNICAL SPECIFICATION DIAGRAM — PRECISION ENGINEERING DRAW
Product: ${describeProduct(product)}
══════════════════════════════════════════════════════════════════

╔══════════════════════════════════════════════════════════════╗
║          MEASUREMENT ACCURACY CONTRACT — READ FIRST          ║
╚══════════════════════════════════════════════════════════════╝
Every measurement value below is FIXED and ABSOLUTE.
Do NOT round, adjust, estimate, or substitute any value.
Do NOT invent any value not present in this list.

${measurementBlock}

╔══════════════════════════════════════════════════════════════╗
║              ARROW SIZE HIERARCHY — CRITICAL RULE            ║
╚══════════════════════════════════════════════════════════════╝
${tw && lw && br ? `The three horizontal measurements have a strict visual size order:

  TOTAL WIDTH  (${tw}mm)  ══════════════════════════════════  ← LONGEST arrow
  LENS WIDTH   (${lw}mm)  ══════════════════                 ← SHORTER — visibly smaller
  BRIDGE       (${br}mm)  ════                               ← SHORTEST horizontal arrow

  TOTAL WIDTH must be at least 35–45% longer than LENS WIDTH arrow.
  If they look the same length → the diagram is WRONG.` :
  `TOTAL WIDTH must always be the longest horizontal arrow. BRIDGE must be the shortest.`}

${endpieceNote}

╔══════════════════════════════════════════════════════════════╗
║               FRAME SILHOUETTE — PRODUCT-SPECIFIC           ║
╚══════════════════════════════════════════════════════════════╝
${shapeDesc}
${materialDesc || "Draw rim thickness consistent with what is visible in the reference."}
${styleDesc || ""}
${lensRendering}

╔══════════════════════════════════════════════════════════════╗
║                        CANVAS LAYOUT                         ║
╚══════════════════════════════════════════════════════════════╝
Output: wide landscape canvas (~3:2 ratio), pure white #FFFFFF background.

━━━ LEFT PANEL — FRONT VIEW (65% of canvas width) ━━━━━━━━━━━━
Trace the EXACT silhouette of this specific frame. Match the actual product shape:
  Round → draw true circles · Cat-eye → lifted outer corners · Rectangular → rectangles
  Aviator → teardrop shapes · Browline → brow bar + lighter lower rim
  DO NOT substitute a generic rectangle.

Five measurement annotations:

  ➊ TOTAL WIDTH ARROW — above the top rim, LONGEST horizontal arrow
     Spans: outermost LEFT edge to outermost RIGHT edge (past hinge/endpiece lugs)
     Label: "TOTAL WIDTH ${totalWidthVal || ""}" above the arrow

  ➋ LENS WIDTH ARROW — INSIDE the left lens opening, SHORTER than TOTAL WIDTH
     Spans: interior width of one lens only — does not touch the rim or hinge
     Label: "LENS WIDTH ${lensWidthVal || ""}" below the arrow inside the lens

  ➌ BRIDGE ARROW — between the two lenses, SHORTEST horizontal arrow
     Spans: gap between innermost lens edges only
     Label: "BRIDGE ${bridgeVal || ""}" below the arrow

  ➍ LENS HEIGHT ARROW — OUTSIDE the frame, to the LEFT (never inside a lens)
     Vertical double-headed arrow spanning full interior lens height
     Use dashed extension lines from lens edges to the arrow
     Label: "LENS HEIGHT ${lensHeightVal || ""}" rotated 90° to the left

━━━ RIGHT PANEL — TEMPLE ARM VIEW (30% of canvas width) ━━━━━━━
Top-down OVERHEAD bird's-eye view of both temple arms (NOT a side view):
  Two parallel bars curving gently at the ear tip — thickness matches reference

  ➎ TEMPLE LENGTH ARROW — hinge pivot to tip of one arm
     Label: "TEMPLE LENGTH ${templeVal || ""}"

╔══════════════════════════════════════════════════════════════╗
║          FORBIDDEN — INSTANT FAILURE CONDITIONS              ║
╚══════════════════════════════════════════════════════════════╝
✗ TOTAL WIDTH arrow the same length as or shorter than LENS WIDTH arrow
✗ Any label value different from the exact numbers in the contract above
✗ Estimating, rounding, or inventing measurement values
✗ Generic rectangular silhouette when shape is specified otherwise
✗ LENS HEIGHT arrow inside a lens opening — must be OUTSIDE to the LEFT
✗ Temple arm drawn as a side view — must be TOP-DOWN overhead only
✗ Any label overlapping frame lines, rims, or arrows
✗ Background other than pure white #FFFFFF — no shadows, gradients, or textures
✗ Missing any arrow whose measurement is provided above

╔══════════════════════════════════════════════════════════════╗
║              FINAL SELF-CHECK BEFORE OUTPUTTING              ║
╚══════════════════════════════════════════════════════════════╝
□ TOTAL WIDTH arrow is visibly the LONGEST horizontal arrow?
□ LENS WIDTH arrow is visibly SHORTER than TOTAL WIDTH?
□ BRIDGE arrow is the SHORTEST horizontal arrow?
□ Every label shows the EXACT value from the contract above?
□ Frame silhouette MATCHES the specified shape?
□ LENS HEIGHT arrow is OUTSIDE the frame, to the LEFT?
□ Temple arm panel shows a TOP-DOWN (overhead) perspective?
□ No label overlaps any frame line or lens rim?
Correct any NO before outputting.`;

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
