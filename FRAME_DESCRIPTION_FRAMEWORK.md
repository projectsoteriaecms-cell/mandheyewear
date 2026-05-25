# M&H Optical Eyewear — Frame Description Framework
> Reference: Zeelool · Warby Parker · Zenni · Vogue Eyewear · Cartier (authorised retail)
> Last updated: May 2026

---

## 1. FRAMEWORK OVERVIEW

Every frame listing on M&H must contain **six layers** in this order:

| Layer | Purpose | Max Length |
|---|---|---|
| 1. Headline | Personality hook — the soul of the frame | 8 words |
| 2. Short Description | Style + occasion + vibe | 2–3 sentences |
| 3. Why You'll Love It | 3 bullet point features | 1 line each |
| 4. Frame Specifications | Technical measurements (Zeelool-style diagram data) | Table |
| 5. Fit & Compatibility | Size, PD range, RX range, progressive | Table |
| 6. Style Guide | Best for face shapes + occasions | 2 lines |

---

## 2. WRITING STYLE GUIDE

### Voice
- **Confident, not salesy** — describe what the frame IS, not what it will "do for you"
- **Precise, not vague** — "TR-90 lightweight nylon" not "premium material"
- **Warm, not clinical** — the specs table handles the numbers; the copy handles the feeling

### Tone by Brand Tier
| Tier | Brands | Tone |
|---|---|---|
| Luxury | Cartier, Gucci, Tom Ford, Burberry | Refined · Understated · Aspirational |
| Premium | Ray-Ban, Versace, Dolce & Gabbana, Giorgio Armani | Bold · Fashion-forward · Iconic |
| Accessible | Vogue, Tommy Hilfiger, Polo Ralph Lauren, Carrera | Fresh · Approachable · Trend-aware |
| Value | Macruona, Puma, Guess | Functional · Confident · Everyday |

### Reference Examples

**Warby Parker style (accessible luxury):**
> "The Percey takes a classic square silhouette and softens it — rounded edges, a polished acetate finish, and a bridge designed for medium-to-wide faces."

**Zeelool style (precise + clean):**
> "Lightweight TR-90 frame. Oval lens shape. Full-rim construction. Available in three colour ways."

**Vogue Eyewear style (fashion-forward):**
> "Inspired by '70s glamour, the Cat-Eye frames make a statement with their dramatically swept corners and bold colour palette."

**Target M&H Style (blend of all three):**
> "A modern rectangular frame with a slim profile — built for long days and sharp meetings. The [Brand] [Model] sits light on the face thanks to [material], making it equally at home in the boardroom or behind the wheel."

---

## 3. FRAME DESCRIPTION TEMPLATE

Use this exact template for every frame. Fields in `[brackets]` are dynamic.

```
### [BRAND] [MODEL]

**[HEADLINE — 8 words max]**

[Short description — 2-3 sentences. Lead with the frame shape and character. 
Second sentence: material and how it feels/wears. Third sentence: the person 
or occasion it suits best.]

**Why You'll Love It**
- [Feature 1 — construction or material highlight]
- [Feature 2 — comfort, fit, or wearability]
- [Feature 3 — style or versatility note]

---

**Frame Specifications**

| Measurement | Value |
|---|---|
| Lens Width | [XX] mm |
| Bridge Width | [XX] mm |
| Lens Height | [XX] mm |
| Total Frame Width | [XX] mm |
| Temple Length | [XX] mm |
| Frame Weight | [XX] g (if known) |

---

**Fit & Compatibility**

| Detail | Value |
|---|---|
| Size | [Small / Medium / Large] |
| PD Range | [XX – XX] mm |
| RX Range | [SPH: -X.00 to +X.00] |
| Progressive Lenses | [Yes / No] |
| Frame Shape | [Round / Rectangular / Cat-Eye / Aviator / Wayfarer / Oval / Square] |
| Frame Material | [Acetate / Metal / TR-90 / Titanium / Mixed] |
| Lens Material | [Polycarbonate / Trivex / CR-39] |
| Gender | [Men / Women / Unisex] |

---

**Style Guide**
Best for face shapes: [Oval / Round / Square / Heart / Diamond / Oblong]
Perfect for: [Work / Casual / Night out / Sport / All-day wear]
```

---

## 4. MEASUREMENT SIZE CHART

Map raw measurements to size labels (consistent across all M&H listings):

| Size Label | Lens Width | Total Frame Width |
|---|---|---|
| Narrow | ≤ 50mm | ≤ 128mm |
| Small | 51–53mm | 129–133mm |
| Medium | 54–56mm | 134–140mm |
| Large | 57–59mm | 141–146mm |
| Extra Large | ≥ 60mm | ≥ 147mm |

---

## 5. PD RANGE STANDARD

If PD data is not available from the manufacturer, use these defaults by size:

| Frame Size | Default PD Range |
|---|---|
| Narrow / Small | 54 – 68mm |
| Medium | 56 – 72mm |
| Large / XL | 58 – 76mm |

---

## 6. RX RANGE STANDARD

If RX data is not available, use these defaults by frame material:

| Material | Default RX Range | Progressive |
|---|---|---|
| Acetate (full rim) | -8.00 to +6.00 | Yes |
| Metal (full rim) | -8.00 to +6.00 | Yes |
| TR-90 | -6.00 to +4.00 | No |
| Rimless / Semi-rimless | -4.00 to +4.00 | No |
| Titanium | -8.00 to +6.00 | Yes |

---

## 7. FACE SHAPE GUIDE

| Frame Shape | Best Face Shapes | Avoid For |
|---|---|---|
| Round | Square, Oblong, Diamond | Round, Oval |
| Rectangular / Square | Oval, Round, Heart | Square, Oblong |
| Cat-Eye | Oval, Square, Diamond | Round, Heart |
| Aviator | Oval, Square, Diamond | Round |
| Wayfarer | Oval, Square, Round | Heart |
| Oval | All face shapes | None |

---

## 8. AI GENERATION PROMPT TEMPLATE

Use this prompt in Google AI Studio / Gemini to batch-generate descriptions.
Replace the values in `[brackets]` with the actual frame data.

```
You are a copywriter for M&H Optical Eyewear, a premium Nigerian eyewear retailer.
Your job is to write a product description for a frame using our brand framework.

BRAND TIER: [Luxury / Premium / Accessible / Value]
BRAND: [e.g. Gucci]
MODEL: [e.g. GG1221O]
FRAME SHAPE: [e.g. Rectangular]
FRAME MATERIAL: [e.g. Acetate]
COLOR: [e.g. Black with silver temples]
LENS WIDTH: [e.g. 55mm]
BRIDGE: [e.g. 17mm]
LENS HEIGHT: [e.g. 40mm]
TOTAL WIDTH: [e.g. 140mm]
TEMPLE: [e.g. 145mm]
GENDER: [e.g. Unisex]

Write the description following EXACTLY this structure:

1. HEADLINE (max 8 words — capture the personality of this frame)
2. SHORT DESCRIPTION (2-3 sentences — shape, material, who it suits)
3. WHY YOU'LL LOVE IT (exactly 3 bullet points)
4. Do NOT include the specs table — that will be added separately.

Tone: [Refined and understated / Bold and iconic / Fresh and approachable]
Do not use the words: stunning, amazing, perfect, sleek, elevate, game-changer.
Keep it factual, warm, and precise. Under 120 words total.
```

---

## 9. FIRST BATCH — 48 FRAMES TO DESCRIBE

These are the frames photographed in the first batch (HEIC images already processed).
Priority order for description generation:

| Priority | Brand Tier | SKUs |
|---|---|---|
| 1 — Luxury | Cartier, Gucci, Tom Ford | MH-1703, MH-470, MH-471, MH-474 |
| 2 — Premium | Burberry, Versace, D&G, Armani | MH-328, MH-330, MH-337, MH-338, MH-344 |
| 3 — Accessible | Ray-Ban, Tommy, Polo, Vogue | MH-350, MH-354, MH-355, MH-357, MH-358 |
| 4 — Rest | All remaining | MH-361 through MH-569 |

---

## 10. DATABASE FIELDS MAPPING

When saving descriptions to Supabase `products` table:

| Framework Field | DB Column |
|---|---|
| Headline | `tagline` (if column exists) or prepend to `description` |
| Short Description + Bullets | `description` |
| Frame Shape | `style` |
| Frame Material | `material` |
| Color | `color` |
| Lens Width | `frame_attributes.lens_width` |
| Bridge | `frame_attributes.bridge_width` |
| Lens Height | `frame_attributes.lens_height` |
| Total Width | `frame_attributes.total_width` |
| Temple | `frame_attributes.temple_length` |
| Gender | `gender` |
| Size Label | `frame_attributes.size` |
