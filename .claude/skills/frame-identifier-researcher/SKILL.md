---
name: frame-identifier-researcher
description: Parse, validate, and research optical frame specifications with comprehensive web research. Use this skill whenever the user mentions frame names, frame inventory, frame data entry, optical products, eyewear specifications, or asks to "help me name this frame", "parse this frame", "find specs for", "research this frame", "get the product image for", "what are the details for", or provides any frame name string (even casually like "I have a Ray-Ban RB3025"). Also trigger when the user wants to populate frame_attributes database fields or needs manufacturer verification. This skill handles everything from parsing the name to finding official product images and specifications.
---

# Frame Identifier & Researcher

Parse optical frame names, validate against industry standards, structure data for database insertion, and conduct comprehensive web research to verify specifications and find official product images.

## When to Use This Skill

Trigger whenever the user:
- Provides a frame name (e.g., "CARTIER CT0349O 001 55-18-145")
- Asks for frame specifications or details
- Needs to populate frame_attributes database fields
- Wants to verify frame information
- Requests product images for frames
- Mentions frame inventory, data entry, or eyewear specifications

## Core Capabilities

1. **Name Parsing**: Extract brand, model code, color code, size measurements
2. **Data Validation**: Check against industry standards and patterns
3. **Database Structuring**: Format data for frame_attributes table insertion
4. **Web Research**: Find official specifications and product images
5. **Verification**: Cross-reference multiple sources for accuracy

---

## Workflow

### Phase 1: Parse Frame Name

Extract components using industry naming patterns:

```
[BRAND] [MODEL_CODE] [COLOR_CODE] [LENS-BRIDGE-TEMPLE] [TYPE]
```

**Extract:**
1. **Brand**: First word(s) - CARTIER, RAY-BAN, VOGUE, etc.
2. **Model Code**: Alphanumeric after brand (e.g., CT0349O, RB3025, VO5421)
3. **Color Code**: Between model and size (e.g., 001, 9035/1U, W44)
4. **Size Measurements**: 
   - Lens width (first number, 40-62mm typical)
   - Bridge size (second number, 14-24mm typical)
   - Temple length (third number, 120-150mm typical)
5. **Type Suffix**: Optional (SUN, M, L, XL, 2N, 3N)

**Brand-Specific Model Patterns:**

| Brand | Pattern | Example |
|-------|---------|---------|
| Ray-Ban | RB + 4 digits | RB3025, RB2140 |
| Vogue | VO + 4 digits | VO5286, VO5421 |
| Cartier | CT + 4 digits + letter | CT0349O, CT0284O |
| Oakley | OX/OO + 4 digits | OX8156, OO9242 |
| Prada | VPR + 2-3 digits + letter | VPR09Z |
| Gucci | GG + 5 digits + letter | GG12190 |
| Tommy Hilfiger | TH + 4 digits | TH1891 |
| Versace | MOD + 4 digits | MOD3338 |

**Output parsed components in a clear structure:**
```
PARSED COMPONENTS:
- Brand: [brand]
- Model Code: [code]
- Color Code: [color]
- Lens Width: [X]mm
- Bridge Size: [Y]mm
- Temple Length: [Z]mm
- Type: [if present]
```

---

### Phase 2: Validate Against Standards

Check each component:

**Model Code Validation:**
- Alphanumeric only
- Matches brand pattern
- Typically 4-8 characters
- Normalize (remove spaces, uppercase)

**Size Validation:**
- Lens width: 40-62mm (most common 50-56mm)
- Bridge size: 14-24mm (most common 16-20mm)  
- Temple length: 120-150mm (most common 135-145mm)

**Flag any anomalies:**
- Sizes outside typical ranges
- Model code doesn't match brand pattern
- Missing components

---

### Phase 3: Web Research Strategy

**CRITICAL RESEARCH PRIORITY ORDER:**

1. **Official Brand Website** (HIGHEST PRIORITY)
   - Search: "[brand] [model_code] [color_code]"
   - Look for: Product pages, specifications, official images
   - Extract: Material, shape, dimensions, color descriptions

2. **Authorized Retailers** (SECONDARY)
   - Sunglass Hut, LensCrafters, SmartBuyGlasses, FramesDirect
   - Search: "[brand] [model_code]"
   - Collect: Additional product images, customer views (front/side/angle)

3. **Manufacturer/OEM Sources** (VERIFICATION)
   - Luxottica, Safilo, Marchon (if applicable)
   - Search: "[brand] technical specifications [model_code]"
   - Verify: Manufacturing details, material composition

**Image Requirements:**
- Find **at least 3 high-quality images** per frame
- Prioritize official product photos (no lifestyle shots)
- Include: Front view, side/temple view, angled view
- Note image sources and URLs

**Research Execution:**
```bash
# Use web_search tool
web_search "[brand] [model_code] official"
web_search "[brand] [model_code] [color_code] specifications"
web_search "[brand] [model_code] authorized retailer"

# Use web_fetch for product pages
web_fetch [product_page_url]
```

**Extract from research:**
- Frame shape (Aviator, Wayfarer, Cat Eye, Rectangle, etc.)
- Frame material (Acetate, Metal, Titanium, TR-90, etc.)
- Front color (full description)
- Temple color (if different from front)
- Additional dimensions (lens height if available)
- UPC/EAN codes (if available)
- Official product descriptions

---

### Phase 4: Handle Missing Data

**If certain details cannot be found:**

1. **Leave field blank** with notation:
   ```
   frame_material: [NOT FOUND - requires manual verification]
   ```

2. **Document research attempts:**
   ```
   RESEARCH NOTES:
   - Searched official Cartier website - no public product page found
   - Checked LensCrafters, Sunglass Hut - model not listed
   - May be discontinued or regional exclusive
   ```

3. **Never guess or assume** - blank is better than incorrect

**For color codes:**
- If official color name not found, note: `front_color: [Color code 001 - official name not found]`
- If can infer from images: `front_color: Gold (inferred from product images)`

---

### Phase 5: Structure Output

Generate two formats:

#### A. Human-Readable Report

```markdown
# Frame Research Report: [Brand] [Model]

## Parsed Details
- **Brand**: [brand]
- **Model Code**: [code]
- **Color Code**: [color_code]
- **Full Name**: [complete frame name]

## Measurements
- **Lens Width**: [X]mm
- **Bridge Size**: [Y]mm
- **Temple Length**: [Z]mm
- **Lens Height**: [if found]mm

## Specifications
- **Frame Shape**: [shape]
- **Frame Material**: [material]
- **Front Color**: [color description]
- **Temple Color**: [color description]

## Product Images
1. [Image 1 URL] - [Source: Official/Retailer]
2. [Image 2 URL] - [Source: Official/Retailer]
3. [Image 3 URL] - [Source: Official/Retailer]

## Research Sources
- Official Brand Website: [URL or "Not found"]
- Authorized Retailers: [List]
- Additional Sources: [List]

## Data Completeness
✅ Complete: [list fields]
⚠️ Needs Verification: [list fields with notes]
```

#### B. Database-Ready JSON

```json
{
  "product_id": null,
  "brand": "[brand]",
  "model_code": "[normalized_code]",
  "color_code": "[color]",
  "full_description": "[complete frame name]",
  "frame_attributes": {
    "model_code": "[code]",
    "frame_shape": "[shape or null]",
    "lens_width": [number or null],
    "bridge_size": [number or null],
    "temple_length": [number or null],
    "lens_height": [number or null],
    "frame_material": "[material or null]",
    "front_color": "[color or null]",
    "temple_color": "[color or null]"
  },
  "product_images": [
    {"url": "[url1]", "source": "[source1]", "type": "front"},
    {"url": "[url2]", "source": "[source2]", "type": "side"},
    {"url": "[url3]", "source": "[source3]", "type": "angle"}
  ],
  "research_notes": "[any important findings or gaps]",
  "verified": false,
  "requires_manual_review": [boolean]
}
```

---

## Quality Checks

Before finalizing output:

✅ **Parsing Accuracy**
- All components extracted correctly
- Model code matches brand pattern
- Sizes within expected ranges

✅ **Research Completeness**
- Official brand website searched
- At least 2 authorized retailers checked
- Minimum 3 product images found

✅ **Data Integrity**
- No guessed values
- Missing fields clearly marked
- Sources documented

✅ **Image Quality**
- Official product photos (not lifestyle)
- High resolution where possible
- Multiple angles captured

---

## Edge Cases

### Discontinued Models
- Search for archived product pages
- Check secondary market (eBay, Poshmark) for images
- Note: "Model appears discontinued - [date] or earlier"

### Regional Exclusives
- Search region-specific brand sites (.co.uk, .eu, .jp)
- Check international retailers
- Note: "May be regional exclusive to [region]"

### Limited Editions
- Search with "limited edition" keyword
- Check brand press releases
- Note: "Limited edition - [collection name/year]"

### Multiple Colorways
- **Focus only on specified color code**
- Don't research other variants unless explicitly asked
- Note if other colors exist: "Available in [X] colorways"

---

## Example Output

For input: `CARTIER CT0349O 001 55-18-145`

**Phase 1 - Parsed:**
```
Brand: CARTIER
Model: CT0349O
Color: 001
Lens: 55mm | Bridge: 18mm | Temple: 145mm
```

**Phase 2 - Validation:**
```
✅ Model matches Cartier pattern (CT####O)
✅ Sizes within normal ranges
✅ Color code format valid (Cartier 001 = polished gold)
```

**Phase 3 - Research:**
```
[Execute web searches]
- cartier.com search for CT0349O
- LensCrafters search
- Sunglass Hut search
[Fetch product pages and extract data]
```

**Phase 4 - Handle Missing:**
```
If frame_shape not found:
frame_shape: [NOT FOUND - requires manual verification]
```

**Phase 5 - Output both report and JSON**

---

## Error Handling

**Unparseable input:**
```
ERROR: Cannot parse frame name
Provided: [user input]
Expected format: [BRAND] [MODEL] [COLOR] [LENS-BRIDGE-TEMPLE]
Please provide a properly formatted frame name.
```

**No research results:**
```
WARNING: No official sources found for this frame
- Model may be discontinued
- May be counterfeit/replica
- May have incorrect model code
Recommendation: Verify frame authenticity and model number
```

**Partial data:**
```
PARTIAL SUCCESS: Frame parsed but incomplete data
Missing: [list]
Action: Proceed with available data and flag for manual review
```

---

## Integration Notes

This skill uses:
- `web_search` for finding sources
- `web_fetch` for retrieving product pages
- `image_search` for finding additional product images

For database insertion, use the JSON output's `frame_attributes` object directly.

For manual review workflow, flag items where `requires_manual_review: true`.
