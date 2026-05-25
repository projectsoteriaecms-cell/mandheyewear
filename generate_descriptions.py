"""
M&H Frame Description Generator
─────────────────────────────────
Reads frame_data.json and generates full 6-layer framework descriptions
for every frame that has an image (PNG or JPG).

Outputs:
  frame_descriptions.json   — structured JSON for Supabase import
  frame_descriptions.md     — human-readable Markdown for review

Measurement gaps are handled:
  - lens_height    : estimated from shape + lens_width (standard method)
  - total_width    : calculated as (2 × lens_width) + bridge + 4mm
  - color          : extracted from raw_description keywords
"""

import os, json, re

BASE_DIR   = r"C:\Users\DELL\soteriaeyeclinic"
IN_JSON    = os.path.join(BASE_DIR, "frame_data.json")
OUT_JSON   = os.path.join(BASE_DIR, "frame_descriptions.json")
OUT_MD     = os.path.join(BASE_DIR, "frame_descriptions.md")

# ─── Lens Height Estimation ───────────────────────────
# Based on typical manufacturer specs by shape + lens_width bracket
def estimate_lens_height(shape: str, lw: int) -> int:
    table = {
        "Rectangular": [(50,34),(53,36),(56,38),(59,40),(99,42)],
        "Square":      [(50,38),(53,40),(56,42),(59,44),(99,46)],
        "Oval":        [(50,38),(53,40),(56,42),(59,44),(99,46)],
        "Cat-Eye":     [(50,32),(53,34),(56,36),(59,38),(99,40)],
        "Aviator":     [(50,42),(53,46),(56,48),(59,52),(99,54)],
        "Wayfarer":    [(50,38),(53,40),(56,42),(59,44),(99,46)],
    }
    brackets = table.get(shape, table["Rectangular"])
    for threshold, h in brackets:
        if lw <= threshold:
            return h
    return 40


# ─── Color Extraction ─────────────────────────────────
COLOR_KEYWORDS = [
    "MATTE BLACK","SHINY BLACK","DARK HAVANA","LIGHT HAVANA","OPAL CRYSTAL",
    "TRANSPARENT GREY","TRANSPARENT GRAY","TRANSPARENT BROWN",
    "SHINY TRANSPARENT GREY","TITANIUM","BORDEAUX","CRYSTAL","HAVANA",
    "BLACK","GOLD","SILVER","BROWN","GREY","GRAY","BLUE","RED","PINK",
    "TORTOISE","OLIVE","GREEN","WHITE","CHAMPAGNE","BRONZE","GUNMETAL",
    "STAINLESS STEEL","24K","SWAROVSKI",
]

def extract_color(raw: str, existing_color: str) -> str:
    if existing_color and len(existing_color) > 2:
        # Capitalise properly
        return existing_color.title()
    raw_up = raw.upper()
    for kw in COLOR_KEYWORDS:
        if kw in raw_up:
            return kw.title()
    return "See product image"


# ─── Headline Templates ───────────────────────────────
# Per brand/tier/shape — enough variety for 48+ frames

def make_headline(brand: str, model: str, shape: str, tier: str,
                  color: str, lens_type: str) -> str:
    sun = lens_type == "Sunglasses"
    s   = shape.lower()
    b   = brand.lower()
    col = color.lower() if color not in ("See product image","") else ""

    headlines = {
        # Brand-specific overrides for luxury frames
        ("cartier","oval"):         "Precision in titanium. Cartier at its clearest.",
        ("cartier","rectangular"):  "Clean geometry. Quiet authority. Cartier.",
        ("cartier","square"):       "A Cartier square that commands the room.",
        ("gucci","rectangular"):    "Gucci's measured take on the classic rectangle.",
        ("gucci","square"):         "Compact Gucci square — confident, not loud.",
        ("gucci","oval"):           "Gucci rounds every edge without softening anything.",
        ("tom ford","rectangular"): "Tom Ford builds a frame worth keeping.",
        ("prada","rectangular"):    "Prada's architectural take on optical precision.",
        ("jimmy choo","rectangular"):"Jimmy Choo: dressed-up without trying too hard.",
        ("dunhill","rectangular"):  "Dunhill titanium — built to outlast the occasion.",
        ("burberry","rectangular"): "Burberry does restraint exceptionally well.",
        ("versace","rectangular"):  "Versace holds the line on quiet confidence.",
        ("dolce & gabbana","rectangular"): "Italian craft in every degree of this frame.",
        ("marc jacobs","wayfarer"): "Marc Jacobs reworks the classic for now.",
        ("marc jacobs","rectangular"): "Marc Jacobs — clean lines, considered weight.",
        ("hugo","rectangular"):     "Hugo keeps it sharp. Nothing extra.",
        ("dario martini","cat-eye"):"A cat-eye for the person who chooses deliberately.",
        ("dario martini","rectangular"): "Dario Martini. Italian line work, everyday weight.",
        ("clary gray","rectangular"):"Clary Gray gold: a frame that earns its finish.",
        ("linda farrow","cat-eye"): "Linda Farrow's cat-eye earns a second look.",
        ("ray-ban","aviator"):      "The aviator that defined the category.",
        ("tommy hilfiger","rectangular"): "Tommy's go-to: polished, versatile, consistent.",
        ("carrera","rectangular"):  "Carrera keeps pace. Clean sport-meets-city.",
        ("carrera ducati","rectangular"): "Carrera × Ducati. The road in a frame.",
        ("pierre cardin","rectangular"): "Pierre Cardin's classic fit, revisited.",
        ("vogue","cat-eye"):        "A Vogue cat-eye that holds the throwback right.",
        ("polo ralph lauren","rectangular"): "Ralph Lauren's Polo — preppy done precisely.",
        ("la martina","rectangular"): "La Martina: field-bred, boardroom-ready.",
        ("polaroid","rectangular"): "Polaroid keeps it simple and gets it right.",
        ("daniel hechter","rectangular"): "Daniel Hechter: French cut, everyday use.",
        ("ted baker","rectangular"): "Ted Baker's clean British take on the rectangle.",
        ("sandro","cat-eye"):       "Sandro's cat-eye: Parisian, not precious.",
        ("hackett bespoke","rectangular"): "Hackett: where classic fit meets modern taste.",
        ("s.t. dupont","rectangular"): "S.T. Dupont. The luxury of restraint.",
        ("swarovski","wayfarer"):   "A Swarovski wayfarer that shines without shouting.",
        ("macruona","rectangular"): None,  # uses rotation below
        ("m&h","rectangular"):      "M&H house frame — built for real-world wear.",
        ("guess","rectangular"):    "Guess brings the look without the weight.",
        ("puma","rectangular"):     "Puma stays sharp when the day runs long.",
    }

    # Macruona gets rotating headlines to avoid repetition across 20+ SKUs
    MACRUONA_HEADLINES = [
        "Everyday frame. Clean lines. Does the job.",
        "Full-rim prescription wear that earns its keep.",
        "Reliable fit. Consistent weight. No surprises.",
        "Built for the long week, not the photo shoot.",
        "Clean {shape} profile. Practical in every way.",
        "The frame that stays out of the way.",
        "A prescription frame that simply works.",
        "Solid build. Neutral profile. All-day comfortable.",
        "Lightweight and reliable — the practical choice.",
        "Clean edges. Secure fit. Ready for any day.",
    ]
    if b == "macruona":
        import hashlib
        idx = int(hashlib.md5(model.encode()).hexdigest(), 16) % len(MACRUONA_HEADLINES)
        h = MACRUONA_HEADLINES[idx]
        return h.replace("{shape}", s)

    # Try brand + shape first, then brand + any, then tier + shape
    key1 = (b, s)
    key2 = (b.split()[0] if " " in b else b, s)  # first word of brand + shape
    if key1 in headlines:
        return headlines[key1]
    if key2 in headlines:
        return headlines[key2]
    # Fallback by tier + shape
    tier_headlines = {
        ("Luxury","rectangular"):   "Refined geometry. Understated authority.",
        ("Luxury","oval"):          "A rimless presence that speaks for itself.",
        ("Luxury","square"):        "Compact square. Full confidence.",
        ("Luxury","cat-eye"):       "A luxury cat-eye that knows its power.",
        ("Premium","rectangular"):  "Bold construction. Statement proportions.",
        ("Premium","aviator"):      "The aviator silhouette — done with precision.",
        ("Premium","cat-eye"):      "A cat-eye with craft behind every curve.",
        ("Accessible","rectangular"):"Versatile. Comfortable. Exactly right for everyday.",
        ("Accessible","cat-eye"):   "A cat-eye that suits the whole week.",
        ("Value","rectangular"):    "Clean, comfortable, and built to last.",
        ("Value","square"):         "A square frame that delivers without fuss.",
    }
    key3 = (tier, shape)
    if key3 in tier_headlines:
        return tier_headlines[key3]
    return f"A {shape.lower()} frame designed for daily confidence."


# ─── Short Description Templates ─────────────────────

def make_short_desc(brand, model, shape, material, color, tier,
                    lw, bw, tl, lens_type) -> str:
    sun  = lens_type == "Sunglasses"
    s    = shape.lower()
    mat  = material.lower()
    col  = color if color != "See product image" else "a refined colorway"
    lux  = tier == "Luxury"
    prem = tier == "Premium"
    acc  = tier == "Accessible"
    val  = tier == "Value"

    # Brand voice maps
    if brand in ("Cartier",):
        if "rimless" in model.lower() or "oval" in s:
            s1 = (f"The {model} is Cartier's answer to invisible precision — "
                  f"a {material.lower()} rimless construction that carries the face "
                  f"without competing with it.")
        else:
            s1 = (f"A {shape.lower()} optical frame in {material.lower()}, "
                  f"the {model} brings Cartier's signature proportional exactness "
                  f"to everyday wear.")
        s2 = (f"The {lw}mm lens width and {bw}mm bridge sit close to the face, "
              f"reducing the visual weight that heavier frames carry.")
        s3 = ("Built for the wearer who values presence without performance — "
              "at home in both a client meeting and a quiet evening.")
        return f"{s1} {s2} {s3}"

    if brand in ("Gucci",):
        s1 = (f"The {model} takes Gucci's design vocabulary — "
              f"considered proportions, {material.lower()} construction — "
              f"and translates it into a frame suited to long, demanding days.")
        s2 = (f"At {lw}mm wide with a {bw}mm bridge, it balances "
              f"the face without overpowering it.")
        s3 = ("The result is a frame that carries its label lightly, "
              "letting the wearer do the talking.")
        return f"{s1} {s2} {s3}"

    if brand in ("Tom Ford",):
        s1 = (f"Tom Ford's {model} is a {shape.lower()} frame built around "
              f"the assumption that detail is everything.")
        s2 = (f"The {mat} front holds a {lw}mm lens width that reads as "
              f"architecturally confident rather than merely large.")
        s3 = ("Suited to anyone who dresses with intention and expects their "
              "eyewear to keep up.")
        return f"{s1} {s2} {s3}"

    if brand in ("Prada",):
        s1 = (f"The {model} applies Prada's architectural discipline to the "
              f"{shape.lower()} frame format — clean angles, "
              f"precise {mat} construction.")
        s2 = (f"A {lw}mm lens width gives it presence without crowding the face.")
        s3 = ("Suited to environments that reward quiet precision: the office, "
              "a presentation, a gallery.")
        return f"{s1} {s2} {s3}"

    if brand in ("Burberry",):
        s1 = (f"Burberry's {model} is a {shape.lower()} frame that references "
              f"the house's commitment to understated quality.")
        s2 = (f"Built in {mat}, with {lw}mm lenses and a {bw}mm bridge, "
              f"it sits comfortably across a range of face widths.")
        s3 = ("The kind of frame that works on a Monday morning or a Friday evening.")
        return f"{s1} {s2} {s3}"

    if brand in ("Versace",):
        s1 = (f"The {model} channels Versace's bold design confidence "
              f"into a {shape.lower()} optical frame built for daily wear.")
        s2 = (f"At {lw}mm width with {mat} construction, "
              f"it carries its proportions deliberately.")
        s3 = ("Best for the wearer who brings the same energy to every room.")
        return f"{s1} {s2} {s3}"

    if brand in ("Dolce & Gabbana",):
        s1 = (f"The {model} is a {shape.lower()} {mat} frame "
              f"that runs Italian craft through a modern daily-wear silhouette.")
        s2 = (f"The {lw}mm lens and {bw}mm bridge combination "
              f"makes it versatile across face geometries.")
        s3 = ("Dress it up or wear it through a full working week — "
              "it holds its line either way.")
        return f"{s1} {s2} {s3}"

    if brand in ("Ray-Ban",):
        if "aviator" in s:
            s1 = (f"The {model} is the Ray-Ban aviator — "
                  f"the frame that hasn't needed updating because it got it right.")
            s2 = (f"A {lw}mm teardrop lens in {mat.lower()} sits on a flat bridge, "
                  f"giving the face a long, open look.")
            s3 = ("Worn by pilots, worn by icons, and reliably right for both "
                  "the weekend and the working week.")
        elif "wayfarer" in s:
            s1 = (f"The Ray-Ban {model} takes the original Wayfarer silhouette "
                  f"and reframes it for now.")
            s2 = (f"At {lw}mm with {mat.lower()} construction, "
                  f"it's versatile enough for any occasion.")
            s3 = ("Sunglasses that earn their status by working everywhere.")
        else:
            s1 = (f"The Ray-Ban {model} brings classic {shape.lower()} proportions "
                  f"to a frame built for daily, reliable use.")
            s2 = (f"At {lw}mm wide with a {bw}mm bridge, "
                  f"it fits a wide range of faces without adjustment.")
            s3 = "Consistent, trusted, and built for the long run."
        return f"{s1} {s2} {s3}"

    if brand in ("Jimmy Choo",):
        s1 = (f"The {model} brings Jimmy Choo's tailored aesthetic into "
              f"a {shape.lower()} optical frame designed for the modern professional.")
        s2 = (f"The {mat.lower()} construction keeps it light at {lw}mm wide, "
              f"comfortable enough for a full day's wear.")
        s3 = ("Equally at home in a boardroom as at a dinner table.")
        return f"{s1} {s2} {s3}"

    if brand in ("Dunhill",):
        s1 = (f"The {model} is Dunhill's take on the {shape.lower()} optical frame — "
              f"titanium construction, clean geometry, zero compromise.")
        s2 = (f"At {lw}mm wide with a {bw}mm bridge, "
              f"the proportions sit confidently on any face width.")
        s3 = ("Built for the kind of person who expects their accessories "
              "to outlast the occasion and the suit.")
        return f"{s1} {s2} {s3}"

    if brand in ("Clary Gray",):
        s1 = (f"The {model} in 24-karat gold finish is Clary Gray's statement "
              f"on what a {shape.lower()} frame can carry.")
        s2 = (f"At {lw}mm wide, the proportions are generous without becoming "
              f"theatrical — this is statement through quality, not volume.")
        s3 = ("Made for the wearer who understands what real gold weight "
              "feels like on the face.")
        return f"{s1} {s2} {s3}"

    if brand in ("Hugo",):
        s1 = (f"Hugo's {model} is a {shape.lower()} optical frame designed "
              f"to keep up with the pace of professional life.")
        s2 = (f"The {mat.lower()} construction and {lw}mm lens width "
              f"strike the right balance between presence and everyday wearability.")
        s3 = ("Clean, purposeful, and suited to both a boardroom and a bar.")
        return f"{s1} {s2} {s3}"

    if brand in ("Dario Martini",):
        if "cat-eye" in s:
            s1 = (f"The Dario Martini {model} is an Italian cat-eye "
                  f"built for the wearer who knows that detail is the point.")
            s2 = (f"At {lw}mm wide with upswept corners, "
                  f"it lifts the face subtly without announcing itself.")
            s3 = ("Pairs well with sharp dressing and confident personal style.")
        else:
            s1 = (f"The {model} is Dario Martini's {shape.lower()} frame "
                  f"— Italian optical craft at an accessible price point.")
            s2 = (f"The {mat.lower()} build and {lw}mm lens width give it "
                  f"enough heft to read as intentional without being heavy.")
            s3 = ("A frame that works through a full working week without complaint.")
        return f"{s1} {s2} {s3}"

    if brand in ("Linda Farrow",):
        s1 = (f"Linda Farrow's {model} is a cat-eye built around considered "
              f"proportions — the sweep at the outer corners is measured, not dramatic.")
        s2 = (f"The {lw}mm width keeps it wearable across face shapes "
              f"that typically struggle with angular frames.")
        s3 = ("The kind of frame that photographers notice before they ask about it.")
        return f"{s1} {s2} {s3}"

    if brand in ("Tommy Hilfiger",):
        s1 = (f"The {model} is Tommy Hilfiger's everyday {shape.lower()} "
              f"— polished enough for the office, relaxed enough for the weekend.")
        s2 = (f"The {mat.lower()} frame sits at {lw}mm wide with a {bw}mm bridge, "
              f"fitting a wide range of faces without adjustment.")
        s3 = ("A reliable all-rounder that earns its place in any collection.")
        return f"{s1} {s2} {s3}"

    if brand in ("Pierre Cardin",):
        s1 = (f"The {model} brings Pierre Cardin's classic European shaping "
              f"to a full-rim {shape.lower()} frame built for everyday use.")
        s2 = (f"At {lw}mm wide with {mat.lower()} construction, "
              f"it carries its proportions confidently without being showy.")
        s3 = "French design sense at a price that makes daily wear sensible."
        return f"{s1} {s2} {s3}"

    if brand in ("Carrera",):
        s1 = (f"Carrera's {model} is a {shape.lower()} frame built around "
              f"the brand's racing-heritage precision.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"it sits light on the face while holding its shape all day.")
        s3 = ("Equally suited to the office and the weekend — "
              "the versatility that makes Carrera a consistent choice.")
        return f"{s1} {s2} {s3}"

    if brand in ("Carrera Ducati",):
        s1 = (f"The Carrera × Ducati {model} brings motorsport precision "
              f"into a {shape.lower()} frame built for the wearer who moves fast.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"the lightweight build matches the brand's performance DNA.")
        s3 = ("Built for days that don't slow down.")
        return f"{s1} {s2} {s3}"

    if brand in ("Vogue",):
        if "cat-eye" in s:
            s1 = (f"The Vogue {model} pulls from '70s cat-eye geometry "
                  f"and grounds it in a wearable {lw}mm width.")
            s2 = (f"The {mat.lower()} construction keeps it light enough "
                  f"to wear through a full day without fatigue.")
            s3 = ("A throwback silhouette that reads current rather than nostalgic.")
        else:
            s1 = (f"The Vogue {model} is a {shape.lower()} frame "
                  f"that delivers fashion sensibility at a practical price point.")
            s2 = (f"At {lw}mm wide in {mat.lower()}, "
                  f"the fit is versatile and the weight stays comfortable.")
            s3 = "For the wearer who wants their look to lead."
        return f"{s1} {s2} {s3}"

    if brand in ("Polo Ralph Lauren","Ralph Lauren",):
        s1 = (f"The {model} carries Ralph Lauren's signature blend "
              f"of prep and polish into a {shape.lower()} frame built for daily wear.")
        s2 = (f"The {mat.lower()} construction sits at {lw}mm wide, "
              f"fitting most face widths with the bridge at {bw}mm.")
        s3 = "From the office to the polo field to the dinner table."
        return f"{s1} {s2} {s3}"

    if brand in ("Sandro",):
        if "cat-eye" in s:
            s1 = (f"Sandro's {model} is a Parisian cat-eye that lands "
                  f"the '60s silhouette without over-committing to nostalgia.")
            s2 = (f"The {lw}mm width sits right for both wider and medium "
                  f"face shapes, making it more versatile than the shape suggests.")
        else:
            s1 = (f"The Sandro {model} is a {shape.lower()} optical frame "
                  f"with the kind of clean French-label restraint "
                  f"the brand is known for.")
            s2 = (f"At {lw}mm in {mat.lower()}, "
                  f"it wears lightly and reads as considered.")
        s3 = "Works as well with weekend dressing as it does with tailoring."
        return f"{s1} {s2} {s3}"

    if brand in ("La Martina",):
        s1 = (f"The {model} draws on La Martina's polo heritage — "
              f"a {shape.lower()} frame built for the active professional.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"the proportions are clean without being austere.")
        s3 = ("Moves between the field and the boardroom without adjustment.")
        return f"{s1} {s2} {s3}"

    if brand in ("Daniel Hechter",):
        s1 = (f"The Daniel Hechter {model} is a {shape.lower()} frame "
              f"with the measured proportions that French label DNA demands.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, it carries a clean everyday "
              f"weight without becoming anonymous.")
        s3 = ("Suits any prescription range and holds up across a full working week.")
        return f"{s1} {s2} {s3}"

    if brand in ("Ted Baker",):
        s1 = (f"Ted Baker's {model} is a {shape.lower()} optical frame "
              f"with the British label's characteristic mix of craft and wit.")
        s2 = (f"The {mat.lower()} frame runs {lw}mm wide "
              f"— right in the sweet spot for a clean, everyday fit.")
        s3 = ("As comfortable in a creative studio as in a client meeting.")
        return f"{s1} {s2} {s3}"

    if brand in ("Polaroid",):
        s1 = (f"The Polaroid {model} is a {shape.lower()} frame "
              f"designed for straightforward, all-day prescription wear.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"the fit is consistent and the weight stays easy throughout the day.")
        s3 = "Practical, dependable, and priced for daily use."
        return f"{s1} {s2} {s3}"

    if brand in ("S.T. Dupont",):
        s1 = (f"S.T. Dupont's {model} is a {shape.lower()} frame "
              f"that channels the house's watchmaking precision into eyewear.")
        s2 = (f"The {mat.lower()} construction at {lw}mm wide "
              f"carries a refined weight — enough to feel considered, "
              f"not enough to become a burden.")
        s3 = "For the wearer who notices the difference quality makes over time."
        return f"{s1} {s2} {s3}"

    if brand in ("Hackett Bespoke",):
        s1 = (f"Hackett Bespoke's {model} brings the brand's Savile Row "
              f"sensibility to a {shape.lower()} frame built for the modern gentleman.")
        s2 = (f"At {lw}mm wide with {mat.lower()} construction, "
              f"the proportions are classic without being dated.")
        s3 = ("Equally suited to a formal meeting and a long, "
              "thoughtful Saturday.")
        return f"{s1} {s2} {s3}"

    if brand in ("Swarovski",):
        s1 = (f"The Swarovski {model} brings the house's crystal craft "
              f"into a {shape.lower()} frame designed to be noticed for all the right reasons.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"the proportions keep it wearable day-to-day, "
              f"not just for special occasions.")
        s3 = "A frame that adds a moment of sparkle to the everyday."
        return f"{s1} {s2} {s3}"

    if brand in ("Linda Farrow",):
        s1 = (f"The {model} is Linda Farrow's considered take on the cat-eye — "
              f"architectural without being theatrical.")
        s2 = (f"At {lw}mm wide, it works across face shapes that "
              f"typically find the silhouette challenging.")
        s3 = "The kind of frame that says something before you do."
        return f"{s1} {s2} {s3}"

    if brand in ("Macruona",):
        s1 = (f"The Macruona {model} is a full-rim {shape.lower()} frame "
              f"built for reliable, everyday prescription wear.")
        s2 = (f"At {lw}mm wide with {mat.lower()} construction "
              f"and a {bw}mm bridge, it fits a broad range of faces comfortably.")
        s3 = ("Functional, well-proportioned, and built to handle a full "
              "working week without complaint.")
        return f"{s1} {s2} {s3}"

    if brand in ("M&H",):
        s1 = (f"The M&H {model} is our in-house {shape.lower()} frame — "
              f"designed to the same specification standards as our branded range.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"it covers the full prescription range with a clean, neutral silhouette.")
        s3 = "The go-to choice when wearability and value both matter."
        return f"{s1} {s2} {s3}"

    if brand in ("Guess",):
        s1 = (f"The Guess {model} is a {shape.lower()} frame "
              f"that delivers the brand's fashion instinct at an everyday price.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"the proportions are easy to wear and pair with most styles.")
        s3 = ("Sharp enough for the office, relaxed enough for the weekend.")
        return f"{s1} {s2} {s3}"

    if brand in ("Puma",):
        s1 = (f"The Puma {model} is a {shape.lower()} frame designed for "
              f"active days and full-pace schedules.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, it sits securely "
              f"and stays comfortable whether you're moving or sitting still.")
        s3 = ("Works for the commute, the office, and everything in between.")
        return f"{s1} {s2} {s3}"

    # Generic fallback by tier
    if tier == "Luxury":
        s1 = (f"The {brand} {model} is a {shape.lower()} frame that carries "
              f"the house's commitment to precise construction.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"the balance between presence and wearability is exact.")
        s3 = ("Suited to any environment where quality is appreciated "
              "rather than announced.")
        return f"{s1} {s2} {s3}"
    if tier == "Premium":
        s1 = (f"The {brand} {model} is a {shape.lower()} frame built with "
              f"the precision the brand's design reputation demands.")
        s2 = (f"At {lw}mm wide in {mat.lower()}, "
              f"it commands attention without overplaying its hand.")
        s3 = ("A frame for the wearer who dresses intentionally.")
        return f"{s1} {s2} {s3}"
    if tier == "Accessible":
        s1 = (f"The {brand} {model} is a {shape.lower()} frame designed "
              f"for consistent, all-day prescription wear.")
        s2 = (f"At {lw}mm wide in {mat.lower()} with a {bw}mm bridge, "
              f"the fit is reliable and the look is clean.")
        s3 = "Versatile enough for the whole week, comfortable enough for all of it."
        return f"{s1} {s2} {s3}"
    # Value
    s1 = (f"A full-rim {shape.lower()} frame at {lw}mm wide, "
          f"built for practical, everyday prescription use.")
    s2 = (f"The {mat.lower()} construction and {bw}mm bridge "
          f"give it a stable, comfortable fit across most face shapes.")
    s3 = "Straightforward, dependable, and built to last."
    return f"{s1} {s2} {s3}"


# ─── Bullet Templates ─────────────────────────────────

def make_bullets(brand, shape, material, tier, color, lens_type,
                 rim_type, lw, bw, tl, size_label, progressive) -> list:
    sun  = lens_type == "Sunglasses"
    mat  = material.lower()
    s    = shape.lower()
    lux  = tier in ("Luxury",)
    prem = tier in ("Luxury","Premium")

    # Bullet 1: Construction / material
    if "titanium" in mat:
        b1 = "Full titanium frame — ultra-light at under 20g with exceptional corrosion resistance"
    elif "acetate" in mat:
        b1 = "Hand-polished acetate construction — rich colour depth and comfortable temple flexibility"
    elif "metal" in mat:
        b1 = "Precision metal frame — thin profile, light weight, and long-term structural integrity"
    elif "tr-90" in mat:
        b1 = "TR-90 nylon frame — impact-resistant, flexible, and one of the lightest materials in production"
    else:
        b1 = f"Full-rim {mat} construction — durable, stable, and built for everyday wear"

    # Bullet 2: Fit / comfort
    if lw <= 52:
        b2 = (f"Compact {lw}mm lens width suits narrower faces and smaller frame preferences "
              f"without sacrificing lens area")
    elif lw <= 56:
        b2 = (f"Medium {lw}mm lens width sits in the versatile fit range — "
              f"works well on oval, round, and heart-shaped faces")
    elif lw <= 59:
        b2 = (f"Wider {lw}mm lens profile flatters oval and oblong faces; "
              f"the generous size gives the prescription more working area")
    else:
        b2 = (f"Oversized {lw}mm lens format — designed to make a proportional statement "
              f"while maintaining full optical clarity")
    if progressive == "Yes":
        b2 += " — progressive lens compatible"

    # Bullet 3: Style / versatility
    if sun:
        b3_map = {
            "Luxury":    "A sunglass pair that reads as luxury from across a room — equally appropriate at the airport or on a terrace",
            "Premium":   "Sun protection built into a frame with enough character to stand alone as a style statement",
            "Accessible":"UV400 sun lens keeps eyes protected; the silhouette keeps the look current",
            "Value":     "Practical sun protection with a clean silhouette that pairs with casual and smart-casual dressing",
        }
        b3 = b3_map.get(tier, "Reliable sun protection with a classic silhouette")
    else:
        style_map = {
            ("Luxury","rectangular"):   "Boardroom-precise proportions that read as intentional from any angle",
            ("Luxury","oval"):          "Rimless construction adds nothing to the face — and that restraint is the point",
            ("Luxury","square"):        "Compact square silhouette projects quiet authority in professional settings",
            ("Luxury","cat-eye"):       "A cat-eye silhouette that complements strong personal style without competing with it",
            ("Premium","rectangular"):  "Bold rectangular frame that carries the brand's fashion confidence into daily wear",
            ("Premium","cat-eye"):      "An upswept corner that lifts the eyes — flattering, distinctive, deliberately chosen",
            ("Premium","aviator"):      "The dropped-lens aviator shape flatters a wide range of face structures",
            ("Accessible","rectangular"):"Clean profile works across professional and casual dressing — no adjustment needed",
            ("Accessible","cat-eye"):   "The '70s cat-eye silhouette updated for current wardrobes — pairs with both casual and work dressing",
            ("Accessible","wayfarer"):  "The wayfarer shape works on most face types; this one delivers the classic look at a practical price",
            ("Value","rectangular"):    "Neutral profile pairs with any wardrobe — the frame that complements without competing",
        }
        key = (tier, s)
        b3 = style_map.get(key, f"The {shape.lower()} silhouette works across professional and casual dressing alike")

    return [b1, b2, b3]


# ─── Style Guide ──────────────────────────────────────

FACE_SHAPE_MAP = {
    "Rectangular": "Oval, Round, Heart",
    "Square":      "Oval, Round, Heart",
    "Cat-Eye":     "Oval, Square, Diamond",
    "Aviator":     "Oval, Square, Diamond",
    "Wayfarer":    "Oval, Square, Round",
    "Oval":        "All face shapes",
    "Round":       "Square, Oblong, Diamond",
}

OCCASION_MAP = {
    ("Luxury","Optical"):      "Work / Client meetings / Fine dining",
    ("Luxury","Sunglasses"):   "Travel / Leisure / Special occasions",
    ("Premium","Optical"):     "Work / Creative settings / Going out",
    ("Premium","Sunglasses"):  "Leisure / Travel / Casual dressing",
    ("Accessible","Optical"):  "Work / Casual / All-day wear",
    ("Accessible","Sunglasses"):"Outdoor / Casual / Driving",
    ("Value","Optical"):       "Daily wear / Work / Casual",
    ("Value","Sunglasses"):    "Casual / Outdoor / Everyday",
}


def make_style_guide(shape, tier, lens_type):
    faces = FACE_SHAPE_MAP.get(shape, "Oval, Round, Square")
    key   = (tier, lens_type)
    occ   = OCCASION_MAP.get(key, "Work / Casual / All-day wear")
    return f"Best for face shapes: {faces}", f"Perfect for: {occ}"


# ─── Full Description Builder ─────────────────────────

def build_description(f: dict) -> dict:
    brand    = f["brand"]
    model    = f["model"]
    shape    = f["frame_shape"]
    material = f["frame_material"]
    tier     = f["tier"]
    lw       = f["lens_width"]  or 54
    bw       = f["bridge_width"] or 17
    tl       = f["temple_length"] or 140
    lens_type= f["lens_type"]
    rim_type = f["rim_type"]
    size_lbl = f["size_label"]
    prog     = f["progressive"]
    pd_range = f["pd_range"]
    rx_range = f["rx_range"]
    gender   = f["gender"]
    price    = f["price_ngn"]

    color    = extract_color(f["raw_description"], f.get("color","") or "")
    lh       = estimate_lens_height(shape, lw)
    tw       = lw * 2 + bw + 4

    headline  = make_headline(brand, model, shape, tier, color, lens_type)
    short_desc= make_short_desc(brand, model, shape, material, color, tier,
                                lw, bw, tl, lens_type)
    bullets   = make_bullets(brand, shape, material, tier, color, lens_type,
                             rim_type, lw, bw, tl, size_lbl, prog)
    sg_faces, sg_occ = make_style_guide(shape, tier, lens_type)

    return {
        "sku":         f["sku"],
        "brand":       brand,
        "model":       model,
        "color":       color,
        "tier":        tier,
        "price_ngn":   price,
        "headline":    headline,
        "short_description": short_desc,
        "bullets":     bullets,
        "specs": {
            "lens_width":       f"{lw} mm",
            "bridge_width":     f"{bw} mm",
            "lens_height":      f"{lh} mm (est.)",
            "total_frame_width":f"{tw} mm (calc.)",
            "temple_length":    f"{tl} mm",
            "frame_weight":     "—",
        },
        "fit": {
            "size":            size_lbl,
            "pd_range":        pd_range,
            "rx_range":        rx_range,
            "progressive":     prog,
            "frame_shape":     shape,
            "frame_material":  material,
            "lens_material":   "Polycarbonate" if lens_type == "Optical" else "Polycarbonate (tinted)",
            "gender":          gender,
        },
        "style_guide": {
            "face_shapes": sg_faces.replace("Best for face shapes: ",""),
            "occasions":   sg_occ.replace("Perfect for: ",""),
        },
        "image_file":   f.get("image_file",""),
    }


def format_markdown(d: dict) -> str:
    b = d["bullets"]
    sp= d["specs"]
    fi= d["fit"]
    sg= d["style_guide"]

    lines = [
        f"### {d['brand']} {d['model']}",
        "",
        f"**{d['headline']}**",
        "",
        d["short_description"],
        "",
        "**Why You'll Love It**",
        f"- {b[0]}",
        f"- {b[1]}",
        f"- {b[2]}",
        "",
        "---",
        "",
        "**Frame Specifications**",
        "",
        "| Measurement | Value |",
        "|---|---|",
        f"| Lens Width | {sp['lens_width']} |",
        f"| Bridge Width | {sp['bridge_width']} |",
        f"| Lens Height | {sp['lens_height']} |",
        f"| Total Frame Width | {sp['total_frame_width']} |",
        f"| Temple Length | {sp['temple_length']} |",
        f"| Frame Weight | {sp['frame_weight']} |",
        "",
        "---",
        "",
        "**Fit & Compatibility**",
        "",
        "| Detail | Value |",
        "|---|---|",
        f"| Size | {fi['size']} |",
        f"| PD Range | {fi['pd_range']} |",
        f"| RX Range | {fi['rx_range']} |",
        f"| Progressive Lenses | {fi['progressive']} |",
        f"| Frame Shape | {fi['frame_shape']} |",
        f"| Frame Material | {fi['frame_material']} |",
        f"| Lens Material | {fi['lens_material']} |",
        f"| Gender | {fi['gender']} |",
        "",
        "---",
        "",
        "**Style Guide**",
        f"Best for face shapes: {sg['face_shapes']}",
        f"Perfect for: {sg['occasions']}",
        "",
        "---",
        "",
    ]
    return "\n".join(lines)


# ─── Main ─────────────────────────────────────────────

def main():
    with open(IN_JSON, encoding="utf-8") as f:
        data = json.load(f)

    # Process all frames with images (PNG or JPG)
    target_frames = [v for v in data.values() if v["image_ready"]]
    target_frames.sort(key=lambda x: (-x["price_ngn"], x["sku"]))

    descriptions = {}
    for fr in target_frames:
        desc = build_description(fr)
        descriptions[fr["sku"]] = desc

    # ── Save JSON ──────────────────────────────────────
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(descriptions, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(descriptions)} descriptions -> {OUT_JSON}")

    # ── Save Markdown ──────────────────────────────────
    with open(OUT_MD, "w", encoding="utf-8") as f:
        f.write("# M&H Optical Eyewear — Frame Descriptions\n\n")
        f.write(f"_Generated from frame_data.json — {len(descriptions)} frames_\n\n")
        f.write("---\n\n")

        # Priority sections
        sections = [
            ("Luxury", "Luxury Frames"),
            ("Premium", "Premium Frames"),
            ("Accessible", "Accessible Frames"),
            ("Value", "Value Frames"),
        ]
        for tier_key, tier_title in sections:
            tier_frames = [d for d in descriptions.values()
                           if data[d["sku"]]["tier"] == tier_key]
            tier_frames.sort(key=lambda x: -x["price_ngn"])
            if not tier_frames:
                continue
            f.write(f"## {tier_title}\n\n")
            for d in tier_frames:
                f.write(format_markdown(d))
    print(f"Saved Markdown review -> {OUT_MD}")

    # ── Summary ────────────────────────────────────────
    by_tier = {}
    for d in descriptions.values():
        t = data[d["sku"]]["tier"]
        by_tier[t] = by_tier.get(t, 0) + 1

    print(f"\nDescriptions generated:")
    for t in ("Luxury","Premium","Accessible","Value"):
        print(f"  {t:12s}: {by_tier.get(t,0)}")


if __name__ == "__main__":
    main()
