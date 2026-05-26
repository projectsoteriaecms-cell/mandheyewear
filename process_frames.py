"""
M&H Frame Image Processor
Pipeline: HEIC -> PNG -> Remove Background -> Enhance -> Save

Background removal modes (set BG_REMOVAL_MODE below):

  "simple" — PIL-only flood-fill from borders (no extra installs needed).
             Works great for studio photos on white/light backgrounds.
             Zero disk space required. USE THIS when disk is low.

  "local"  — uses the rembg library (runs on your machine, no API credits needed)
             Install once:  pip install rembg onnxruntime
             First run downloads ~100 MB model automatically (u2netp = fast).
             Use model "u2net" for higher quality (~170 MB).

  "api"    — uses the remove.bg cloud API (50 free images/month on free tier)
             Set API_KEY to your remove.bg key.
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

# ─────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────
# Background removal mode: "simple" (PIL only), "local" (rembg), or "api" (remove.bg)
BG_REMOVAL_MODE = "simple"

# ── Local rembg settings (used when BG_REMOVAL_MODE = "local") ───────
# Models: "u2netp" = 4.7 MB fast model  |  "u2net" = 170 MB high-quality
REMBG_MODEL = "u2netp"

# ── remove.bg API settings (used when BG_REMOVAL_MODE = "api") ───────
API_KEY = "gzhhDAV2LQs7iAFEDpXVvKDe"

INPUT_FOLDER  = r"C:\Users\DELL\Downloads\M&H Store Images"
OUTPUT_FOLDER = r"C:\Users\DELL\soteriaeyeclinic\frame_images"

# Enhancement factors (conservative — preserve detail)
SHARPNESS  = 1.4
CONTRAST   = 1.15
BRIGHTNESS = 1.05

# Delay between API calls (only used in "api" mode)
API_DELAY = 1.0
# ─────────────────────────────────────────────────────────────────────


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


def remove_background_simple(png_bytes: bytes, tolerance: int = 30) -> bytes:
    """
    Lightweight background removal using BFS flood-fill from image borders.
    No extra libraries needed — only Pillow.

    How it works:
      1. Sample the average colour of the 4 corners to detect the studio background.
      2. BFS outward from every border pixel that is "close" to the background colour.
      3. Mark all reached pixels fully transparent.
      4. Apply a 1-pixel feather on the mask border for smooth edges.

    Works well for product photos shot on white / light-grey studio backgrounds.
    """
    from collections import deque

    img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # ── 1. Estimate background colour from corners ────────────────────────
    corners = [pixels[0, 0][:3], pixels[w-1, 0][:3],
               pixels[0, h-1][:3], pixels[w-1, h-1][:3]]
    bg_r = sum(c[0] for c in corners) // 4
    bg_g = sum(c[1] for c in corners) // 4
    bg_b = sum(c[2] for c in corners) // 4

    def is_bg(r, g, b):
        return abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b) < tolerance * 3

    # ── 2. BFS flood-fill from all four borders ───────────────────────────
    visited = [[False] * h for _ in range(w)]
    queue = deque()

    def seed(x, y):
        if not visited[x][y] and is_bg(*pixels[x, y][:3]):
            visited[x][y] = True
            queue.append((x, y))

    for x in range(w):
        seed(x, 0); seed(x, h - 1)
    for y in range(h):
        seed(0, y); seed(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if is_bg(*pixels[nx, ny][:3]):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    # ── 3. Write transparent pixels for background ────────────────────────
    for x in range(w):
        for y in range(h):
            if visited[x][y]:
                r, g, b, _ = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def remove_background_local(png_bytes: bytes) -> bytes:
    """Remove background using rembg (runs locally, no API key needed).

    Install:  pip install rembg[cli] onnxruntime
    First run downloads the model (~100 MB) automatically.
    """
    try:
        from rembg import remove as rembg_remove, new_session
    except ImportError:
        raise ImportError(
            "rembg is not installed. Run:  pip install rembg[cli] onnxruntime"
        )

    session = new_session(REMBG_MODEL)
    result_bytes = rembg_remove(png_bytes, session=session)
    return result_bytes


def remove_background_api(png_bytes: bytes, api_key: str) -> bytes:
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


def do_remove_background(png_bytes: bytes) -> bytes:
    """Dispatcher: uses simple PIL, local rembg, or remove.bg API based on BG_REMOVAL_MODE."""
    if BG_REMOVAL_MODE == "simple":
        return remove_background_simple(png_bytes)
    elif BG_REMOVAL_MODE == "local":
        return remove_background_local(png_bytes)
    else:
        return remove_background_api(png_bytes, API_KEY)


def process_all():
    register_heif()
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    if BG_REMOVAL_MODE == "api" and API_KEY == "YOUR_REMOVE_BG_API_KEY":
        print("ERROR: Please set your remove.bg API key at the top of this script.")
        return

    mode_labels = {"simple": "PIL flood-fill (no extra libs)", "local": "rembg (local AI)", "api": "remove.bg API"}
    print(f"Background removal mode: {mode_labels.get(BG_REMOVAL_MODE, BG_REMOVAL_MODE)}\n")

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
            result_bytes = do_remove_background(png_bytes)
            print("bg removed", end=" ", flush=True)

            # Step 3: Enhance
            img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
            img = enhance_image(img)
            print("enhanced", end=" ", flush=True)

            # Step 4: Save
            output_path = os.path.join(OUTPUT_FOLDER, f"{sku}.png")
            img.save(output_path, format="PNG", compress_level=6)
            print(f"-> saved {sku}.png")

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

        # Delay between API calls (only needed in API mode)
        if idx < total and BG_REMOVAL_MODE == "api":
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
    if BG_REMOVAL_MODE == "api" and API_KEY == "YOUR_REMOVE_BG_API_KEY":
        print("ERROR: Please set your remove.bg API key at the top of this script.")
        return

    mode_labels = {"simple": "PIL flood-fill (no extra libs)", "local": "rembg (local AI)", "api": "remove.bg API"}
    print(f"Background removal mode: {mode_labels.get(BG_REMOVAL_MODE, BG_REMOVAL_MODE)}\n")

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
            result_bytes = do_remove_background(png_bytes)
            print("bg removed", end=" ", flush=True)

            # Enhance
            img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
            img = enhance_image(img)
            print("enhanced", end=" ", flush=True)

            # Save as PNG
            output_path = os.path.join(OUTPUT_FOLDER, f"{sku}.png")
            img.save(output_path, format="PNG", compress_level=6)
            print(f"-> saved {sku}.png")

            # Delete original JPG now that PNG exists
            os.remove(filepath)
            print(f"   (removed original {filename})")

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

        if idx < total and BG_REMOVAL_MODE == "api":
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
