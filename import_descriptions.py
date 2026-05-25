"""
M&H Frame Descriptions → Supabase Importer
───────────────────────────────────────────
Reads frame_descriptions.json + frame_data.json and upserts every frame into:
  • products        (sku, name, brand, tagline, description, color, material, ...)
  • frame_attributes (lens_width, bridge_size, lens_height, total_width, pd_range, ...)

SETUP:
  1. Get your service-role key from:
     Supabase Dashboard → Project Settings → API → "service_role" secret key
  2. Paste it below as SERVICE_ROLE_KEY
  3. Run:  python import_descriptions.py
  4. Optional dry-run:  python import_descriptions.py --dry-run
"""

import json
import re
import sys
import time
import urllib.request
import urllib.error

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG — paste your service-role key here (NEVER commit this key to git)
# ─────────────────────────────────────────────────────────────────────────────
SUPABASE_URL      = "https://ispizamxlrukxmysgyjv.supabase.co"
SERVICE_ROLE_KEY  = "YOUR_SERVICE_ROLE_KEY_HERE"
# ─────────────────────────────────────────────────────────────────────────────

DESCRIPTIONS_FILE = "frame_descriptions.json"
FRAME_DATA_FILE   = "frame_data.json"
DELAY_BETWEEN     = 0.1   # seconds between API calls


# ── Helpers ───────────────────────────────────────────────────────────────────

def rest_request(method: str, path: str, body=None) -> dict:
    """Make an authenticated request to the Supabase REST API."""
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "apikey": SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code} {path}: {err_body[:200]}")


def parse_mm(value: str) -> int | None:
    """Extract integer mm from strings like '46 mm (est.)' or '138 mm (calc.)'."""
    if not value or value.strip() in ("", "—", "-"):
        return None
    m = re.search(r"(\d+)", value)
    return int(m.group(1)) if m else None


def parse_pd_range(value: str):
    """Parse '58 – 76mm' → (58, 76). Returns (None, None) if unparseable."""
    numbers = re.findall(r"\d+", value or "")
    if len(numbers) >= 2:
        return int(numbers[0]), int(numbers[1])
    return None, None


def parse_rx_range(value: str):
    """Parse 'SPH: -8.00 to +6.00' → (-8.00, 6.00). Returns (None, None) if unparseable."""
    numbers = re.findall(r"[+-]?\d+\.?\d*", value or "")
    if len(numbers) >= 2:
        return float(numbers[0]), float(numbers[1])
    return None, None


def build_description_text(frame: dict) -> str:
    """Compose the plain-text description stored in products.description."""
    lines = []
    if frame.get("short_description"):
        lines.append(frame["short_description"])
    if frame.get("bullets"):
        for b in frame["bullets"]:
            lines.append(f"• {b}")
    return "\n".join(lines)


def build_description_html(frame: dict) -> str:
    """Compose rich HTML for products.description_html."""
    parts = []
    if frame.get("short_description"):
        parts.append(f"<p>{frame['short_description']}</p>")
    if frame.get("bullets"):
        items = "".join(f"<li>{b}</li>" for b in frame["bullets"])
        parts.append(f"<ul>{items}</ul>")
    sg = frame.get("style_guide", {})
    if sg.get("face_shapes") or sg.get("occasions"):
        guide = ""
        if sg.get("face_shapes"):
            guide += f"<strong>Best for:</strong> {sg['face_shapes']}"
        if sg.get("occasions"):
            guide += f"  •  <strong>Perfect for:</strong> {sg['occasions']}"
        parts.append(f"<p class='style-guide'>{guide}</p>")
    return "\n".join(parts)


def gender_to_db(gender_str: str) -> str:
    """Normalise gender string to DB enum values."""
    g = (gender_str or "").lower().strip()
    if g == "male" or g == "men":
        return "male"
    if g == "female" or g == "women":
        return "female"
    return "unisex"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    dry_run = "--dry-run" in sys.argv

    if SERVICE_ROLE_KEY == "YOUR_SERVICE_ROLE_KEY_HERE":
        print("ERROR: Paste your Supabase service-role key into SERVICE_ROLE_KEY at the top of this script.")
        print("  Get it from: Supabase Dashboard → Project Settings → API → service_role")
        sys.exit(1)

    # ── Load source data ──────────────────────────────────────────────────────
    with open(DESCRIPTIONS_FILE, "r", encoding="utf-8") as f:
        descriptions = json.load(f)

    with open(FRAME_DATA_FILE, "r", encoding="utf-8") as f:
        frame_data = json.load(f)

    print(f"Loaded {len(descriptions)} frame descriptions to import.")
    if dry_run:
        print("DRY RUN — no changes will be made to Supabase.\n")

    # ── Fetch existing products for SKU → id mapping ─────────────────────────
    print("Fetching existing M&H products from Supabase...")
    existing_raw = rest_request("GET", "/rest/v1/products?brand_line=eq.m_and_h_fashion&select=id,sku&limit=500")
    existing_by_sku = {p["sku"]: p["id"] for p in (existing_raw if isinstance(existing_raw, list) else [])}
    print(f"  Found {len(existing_by_sku)} existing products in DB.\n")

    # ── Process each frame ────────────────────────────────────────────────────
    inserted = updated = failed = 0
    errors = []

    for sku, frame in descriptions.items():
        fd = frame_data.get(sku, {})

        # ── Build product record ──────────────────────────────────────────────
        description_text = build_description_text(frame)
        description_html = build_description_html(frame)
        gender           = gender_to_db(frame.get("fit", {}).get("gender", "Unisex"))
        color            = frame.get("color") or fd.get("color") or None
        if color == "See product image":
            color = None

        product_record = {
            "sku":             sku,
            "name":            f"{frame.get('brand', '')} {frame.get('model', '')}".strip(),
            "brand":           frame.get("brand"),
            "brand_line":      "m_and_h_fashion",
            "item_type":       "frames",
            "price":           frame.get("price_ngn", 0),
            "tagline":         frame.get("headline"),
            "description":     description_text,
            "description_html": description_html,
            "color":           color,
            "material":        frame.get("fit", {}).get("frame_material"),
            "style":           frame.get("fit", {}).get("frame_shape"),
            "gender":          gender,
            "is_active":       True,
            "record_type":     "inventory_item",
        }

        # ── Build frame_attributes record ─────────────────────────────────────
        specs       = frame.get("specs", {})
        fit         = frame.get("fit", {})
        style_guide = frame.get("style_guide", {})

        lens_height   = parse_mm(specs.get("lens_height", ""))
        total_width   = parse_mm(specs.get("total_frame_width", ""))
        pd_min, pd_max = parse_pd_range(fit.get("pd_range", ""))
        rx_min, rx_max = parse_rx_range(fit.get("rx_range", ""))

        lens_width_raw = fd.get("lens_width") or parse_mm(specs.get("lens_width", ""))
        bridge_raw     = fd.get("bridge_width") or parse_mm(specs.get("bridge_width", ""))
        temple_raw     = fd.get("temple_length") or parse_mm(specs.get("temple_length", ""))

        attr_record = {
            "model_code":          frame.get("model"),
            "frame_shape":         fit.get("frame_shape"),
            "frame_material":      fit.get("frame_material"),
            "front_color":         color,
            "lens_width":          lens_width_raw,
            "bridge_size":         bridge_raw,
            "temple_length":       temple_raw,
            "lens_height":         lens_height,
            "total_width":         total_width,
            "pd_range_min":        pd_min,
            "pd_range_max":        pd_max,
            "rx_sph_min":          rx_min,
            "rx_sph_max":          rx_max,
            "progressive_compatible": fit.get("progressive", "No") == "Yes",
            "size_label":          fit.get("size"),
            "best_for_faces":      style_guide.get("face_shapes"),
            "best_for_occasions":  style_guide.get("occasions"),
        }

        if dry_run:
            print(f"  [DRY] {sku}: {product_record['name']} — {frame.get('headline', '')[:50]}")
            continue

        try:
            # ── Upsert product ──────────────────────────────────────────────
            if sku in existing_by_sku:
                product_id = existing_by_sku[sku]
                rest_request("PATCH", f"/rest/v1/products?sku=eq.{sku}", product_record)
                print(f"  UPDATE {sku}: {product_record['name']}")
                updated += 1
            else:
                result = rest_request("POST", "/rest/v1/products", product_record)
                result_list = result if isinstance(result, list) else [result]
                product_id = result_list[0]["id"] if result_list else None
                print(f"  INSERT {sku}: {product_record['name']}")
                inserted += 1

            # ── Upsert frame_attributes ─────────────────────────────────────
            if product_id:
                attr_record["product_id"] = product_id
                rest_request(
                    "POST",
                    "/rest/v1/frame_attributes",
                    attr_record,
                )
            else:
                print(f"    WARN: could not get product_id for {sku} — skipping frame_attributes")

        except RuntimeError as e:
            print(f"  FAILED {sku}: {e}")
            errors.append({"sku": sku, "error": str(e)})
            failed += 1

        time.sleep(DELAY_BETWEEN)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 55)
    if dry_run:
        print(f"DRY RUN complete — {len(descriptions)} frames would be imported.")
    else:
        print(f"IMPORT DONE — inserted: {inserted}  updated: {updated}  failed: {failed}")
        if errors:
            print(f"\nErrors ({len(errors)}):")
            for e in errors:
                print(f"  {e['sku']}: {e['error']}")
    print("=" * 55)


if __name__ == "__main__":
    main()
