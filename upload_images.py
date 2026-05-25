"""
M&H Frame Images → Supabase Storage Uploader
─────────────────────────────────────────────
Uploads processed PNGs from frame_images/ to the Supabase `product-images` bucket
and updates each product's image_url in the database.

Storage path per image:  {product_id}/main.png
Public URL format:       https://ispizamxlrukxmysgyjv.supabase.co/storage/v1/object/public/product-images/{product_id}/main.png

SETUP:
  1. Apply the migration in supabase/migrations/20260525120000_mh_frame_spec_enhancements.sql first
     (Supabase Dashboard → SQL Editor → paste → Run)
  2. Run import_descriptions.py first so products exist in the DB
  3. Paste your service-role key below
  4. Run:  python upload_images.py
  5. Optional dry-run:  python upload_images.py --dry-run
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────
SUPABASE_URL      = "https://ispizamxlrukxmysgyjv.supabase.co"
SERVICE_ROLE_KEY  = "YOUR_SERVICE_ROLE_KEY_HERE"
BUCKET_NAME       = "product-images"
IMAGES_FOLDER     = r"C:\Users\DELL\soteriaeyeclinic\frame_images"
DELAY_BETWEEN     = 0.5   # seconds between uploads (be gentle with the API)
SKIP_IF_HAS_IMAGE = True  # Set False to re-upload even if image_url already exists
# ─────────────────────────────────────────────────────────────────────────────


def rest_request(method: str, path: str, body=None) -> dict:
    """Authenticated Supabase REST API call."""
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "apikey": SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code} {path}: {err_body[:200]}")


def storage_upload(product_id: str, png_bytes: bytes) -> str:
    """Upload PNG bytes to Supabase Storage. Returns the public URL."""
    path = f"{product_id}/main.png"
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{path}"

    req = urllib.request.Request(
        url,
        data=png_bytes,
        headers={
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "image/png",
            "x-upsert": "true",  # overwrite if exists
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Storage upload HTTP {e.code}: {err_body[:200]}")

    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{path}"


def main():
    dry_run = "--dry-run" in sys.argv

    if SERVICE_ROLE_KEY == "YOUR_SERVICE_ROLE_KEY_HERE":
        print("ERROR: Paste your service-role key into SERVICE_ROLE_KEY at the top.")
        print("  Get it: Supabase Dashboard → Project Settings → API → service_role")
        sys.exit(1)

    # ── Find PNG files ────────────────────────────────────────────────────────
    png_files = sorted([
        f for f in os.listdir(IMAGES_FOLDER)
        if f.upper().endswith(".PNG") and f.upper().startswith("MH-")
    ])
    print(f"Found {len(png_files)} PNG files in {IMAGES_FOLDER}\n")

    if not png_files:
        print("No PNG files found. Run process_frames.py first.")
        return

    # ── Fetch existing products (sku → id + image_url) ────────────────────────
    print("Fetching product list from Supabase...")
    products_raw = rest_request(
        "GET",
        "/rest/v1/products?brand_line=eq.m_and_h_fashion&select=id,sku,image_url&limit=500"
    )
    products_by_sku = {
        p["sku"]: {"id": p["id"], "image_url": p.get("image_url")}
        for p in (products_raw if isinstance(products_raw, list) else [])
    }
    print(f"  Found {len(products_by_sku)} products in DB.\n")

    # ── Upload ────────────────────────────────────────────────────────────────
    uploaded = skipped = no_product = failed = 0
    errors = []

    for filename in png_files:
        sku = filename[:-4]  # strip .png

        if sku not in products_by_sku:
            print(f"  SKIP (no product): {sku}")
            no_product += 1
            continue

        product = products_by_sku[sku]
        product_id = product["id"]

        if SKIP_IF_HAS_IMAGE and product["image_url"]:
            print(f"  SKIP (already has image): {sku}")
            skipped += 1
            continue

        filepath = os.path.join(IMAGES_FOLDER, filename)

        if dry_run:
            print(f"  [DRY] Would upload {filename} -> {product_id}/main.png")
            continue

        print(f"  Uploading {sku}...", end=" ", flush=True)
        try:
            with open(filepath, "rb") as f:
                png_bytes = f.read()

            public_url = storage_upload(product_id, png_bytes)
            print("uploaded", end=" ", flush=True)

            # Update image_url in products table
            rest_request("PATCH", f"/rest/v1/products?id=eq.{product_id}", {
                "image_url": public_url
            })
            print(f"-> DB updated OK")
            uploaded += 1

        except RuntimeError as e:
            print(f"FAILED: {e}")
            errors.append({"sku": sku, "error": str(e)})
            failed += 1

        time.sleep(DELAY_BETWEEN)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 55)
    if dry_run:
        print(f"DRY RUN — {len(png_files)} images would be processed.")
    else:
        print(f"UPLOAD DONE — uploaded: {uploaded}  skipped: {skipped}  "
              f"no-product: {no_product}  failed: {failed}")
        if errors:
            print(f"\nErrors ({len(errors)}):")
            for e in errors:
                print(f"  {e['sku']}: {e['error']}")
    print("=" * 55)


if __name__ == "__main__":
    main()
