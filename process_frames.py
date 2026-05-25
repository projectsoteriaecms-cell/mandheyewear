"""
M&H Frame Image Processor
Pipeline: HEIC -> PNG -> Remove Background (remove.bg) -> Enhance -> Save
"""

import os
import re
import io
import time
import json
import urllib.request
import urllib.error

import pillow_heif
from PIL import Image, ImageEnhance

# ─────────────────────────────────────────────
# CONFIG — paste your remove.bg API key here
# ─────────────────────────────────────────────
API_KEY = "gzhhDAV2LQs7iAFEDpXVvKDe"

INPUT_FOLDER  = r"C:\Users\DELL\Downloads\M&H Store Images"
OUTPUT_FOLDER = r"C:\Users\DELL\soteriaeyeclinic\frame_images"

# Enhancement factors (conservative — preserve detail)
SHARPNESS  = 1.4
CONTRAST   = 1.15
BRIGHTNESS = 1.05

# Delay between API calls (seconds) to avoid rate limiting
API_DELAY = 1.0
# ─────────────────────────────────────────────


def register_heif():
    pillow_heif.register_heif_opener()


def extract_sku(filename: str) -> str | None:
    """Extract MH-XXXX from any filename variant."""
    match = re.search(r'(MH-\d+)', filename, re.IGNORECASE)
    return match.group(1).upper() if match else None


def heic_to_png_bytes(filepath: str) -> bytes:
    """Open a HEIC file and return PNG bytes in memory."""
    img = Image.open(filepath).convert("RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def remove_background(png_bytes: bytes, api_key: str) -> bytes:
    """Send PNG bytes to remove.bg API, return result PNG bytes."""
    boundary = "----FormBoundary7MA4YWxkTrZu0gW"

    # Build multipart/form-data body manually (no requests needed)
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="size"\r\n\r\nauto\r\n'
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image_file"; filename="image.png"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode("utf-8") + png_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        "https://api.remove.bg/v1.0/removebg",
        data=body,
        headers={
            "X-Api-Key": api_key,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read()


def enhance_image(img: Image.Image) -> Image.Image:
    """Apply subtle sharpness, contrast and brightness enhancement."""
    img = ImageEnhance.Sharpness(img).enhance(SHARPNESS)
    img = ImageEnhance.Contrast(img).enhance(CONTRAST)
    img = ImageEnhance.Brightness(img).enhance(BRIGHTNESS)
    return img


def process_all():
    register_heif()
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    if API_KEY == "YOUR_REMOVE_BG_API_KEY":
        print("ERROR: Please set your remove.bg API key at the top of this script.")
        return

    # Find which SKUs are already done (skip them)
    done_skus = set()
    for f in os.listdir(OUTPUT_FOLDER):
        m = re.search(r'(MH-\d+)', f, re.IGNORECASE)
        if m:
            done_skus.add(m.group(1).upper())

    # Collect only HEIC files that haven't been processed yet
    all_files = []
    for f in os.listdir(INPUT_FOLDER):
        if not f.upper().endswith(".HEIC"):
            continue
        m = re.search(r'(MH-\d+)', f, re.IGNORECASE)
        if m and m.group(1).upper() not in done_skus:
            all_files.append(f)
        elif m:
            print(f"  SKIP (already done): {m.group(1).upper()}")
    all_files.sort()
    total = len(all_files)

    if total == 0:
        print(f"No HEIC files found in: {INPUT_FOLDER}")
        return

    print(f"Found {total} HEIC files to process.\n")

    succeeded = []
    failed    = []

    for idx, filename in enumerate(all_files, start=1):
        sku = extract_sku(filename)
        if not sku:
            print(f"  [{idx}/{total}] SKIP — could not extract SKU from: {filename}")
            failed.append((filename, "Could not extract SKU"))
            continue

        print(f"  [{idx}/{total}] Processing {sku}...", end=" ", flush=True)
        filepath = os.path.join(INPUT_FOLDER, filename)

        try:
            # Step 1: HEIC → PNG bytes
            png_bytes = heic_to_png_bytes(filepath)
            print("converted", end=" ", flush=True)

            # Step 2: Remove background
            result_bytes = remove_background(png_bytes, API_KEY)
            print("bg removed", end=" ", flush=True)

            # Step 3: Enhance
            img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
            img = enhance_image(img)
            print("enhanced", end=" ", flush=True)

            # Step 4: Save
            output_path = os.path.join(OUTPUT_FOLDER, f"{sku}.png")
            img.save(output_path, format="PNG", compress_level=6)
            print(f"→ saved {sku}.png ✓")

            succeeded.append(sku)

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            msg = f"remove.bg HTTP {e.code}: {body[:120]}"
            print(f"FAILED — {msg}")
            failed.append((filename, msg))

        except Exception as e:
            msg = str(e)
            print(f"FAILED — {msg}")
            failed.append((filename, msg))

        # Delay between API calls
        if idx < total:
            time.sleep(API_DELAY)

    # ── Summary ──────────────────────────────
    print("\n" + "=" * 50)
    print(f"DONE — {len(succeeded)}/{total} succeeded")
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for fname, reason in failed:
            print(f"  {fname}: {reason}")
    else:
        print("All files processed successfully!")
    print("=" * 50)


def process_existing_jpgs():
    """
    Remove background from the 19 original JPGs already in frame_images/.
    Saves each as PNG (transparent bg) and deletes the original JPG.
    Skips any JPG that already has a matching PNG (already processed).
    """
    if API_KEY == "YOUR_REMOVE_BG_API_KEY":
        print("ERROR: Please set your remove.bg API key at the top of this script.")
        return

    # Find all JPGs in output folder that don't yet have a PNG counterpart
    existing_pngs = {
        extract_sku(f)
        for f in os.listdir(OUTPUT_FOLDER)
        if f.lower().endswith(".png")
    }

    jpg_files = [
        f for f in os.listdir(OUTPUT_FOLDER)
        if f.lower().endswith(".jpg") and extract_sku(f) not in existing_pngs
    ]
    jpg_files.sort()
    total = len(jpg_files)

    if total == 0:
        print("No JPGs left to process in frame_images/ — all already have PNGs.")
        return

    print(f"\n{'='*50}")
    print(f"Processing {total} existing JPGs (remove background + enhance)...")
    print(f"{'='*50}\n")

    succeeded = []
    failed    = []

    for idx, filename in enumerate(jpg_files, start=1):
        sku = extract_sku(filename)
        filepath = os.path.join(OUTPUT_FOLDER, filename)

        print(f"  [{idx}/{total}] Processing {sku}...", end=" ", flush=True)

        try:
            # Read JPG → PNG bytes in memory
            img = Image.open(filepath).convert("RGBA")
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            png_bytes = buf.getvalue()
            print("converted", end=" ", flush=True)

            # Remove background
            result_bytes = remove_background(png_bytes, API_KEY)
            print("bg removed", end=" ", flush=True)

            # Enhance
            img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
            img = enhance_image(img)
            print("enhanced", end=" ", flush=True)

            # Save as PNG
            output_path = os.path.join(OUTPUT_FOLDER, f"{sku}.png")
            img.save(output_path, format="PNG", compress_level=6)
            print(f"→ saved {sku}.png ✓")

            # Delete original JPG now that PNG exists
            os.remove(filepath)
            print(f"           (removed original {filename})")

            succeeded.append(sku)

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            msg = f"remove.bg HTTP {e.code}: {body[:120]}"
            print(f"FAILED — {msg}")
            failed.append((filename, msg))

        except Exception as e:
            msg = str(e)
            print(f"FAILED — {msg}")
            failed.append((filename, msg))

        if idx < total:
            time.sleep(API_DELAY)

    print(f"\n{'='*50}")
    print(f"JPG cleanup DONE — {len(succeeded)}/{total} succeeded")
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for fname, reason in failed:
            print(f"  {fname}: {reason}")
    else:
        print("All JPGs processed and replaced with PNGs!")
    print(f"{'='*50}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--jpgs":
        # Run only the JPG cleanup pass
        process_existing_jpgs()
    elif len(sys.argv) > 1 and sys.argv[1] == "--all":
        # Run both passes
        process_all()
        process_existing_jpgs()
    else:
        # Default: process remaining HEIC files only
        process_all()
