"""
Migrate additional_images (Gemini angles) from old Supabase project to new.
Downloads each public URL from old project and re-uploads to new project.
Skips images already on new project.

Old project : ispizamxlrukxmysgyjv
New project : znhrwzxthusqtqreawwq
"""

import json
import time
import urllib.request
import urllib.error

NEW_URL     = "https://znhrwzxthusqtqreawwq.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaHJ3enh0aHVzcXRxcmVhd3dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk4MzAxMiwiZXhwIjoyMDk2NTU5MDEyfQ.Cl0HtSNQuGIvAunlYxqfGJF7AtLD_ThjrnmL7yIoWBs"
BUCKET      = "product-images"
OLD_HOST    = "ispizamxlrukxmysgyjv.supabase.co"
NEW_HOST    = "znhrwzxthusqtqreawwq.supabase.co"
DELAY       = 0.3


def rest_get(path):
    url = f"{NEW_URL}{path}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {SERVICE_KEY}",
        "apikey": SERVICE_KEY,
    })
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"HTTP {e.code}: {e.read().decode()[:200]}")
        except Exception as e:
            if attempt < 3:
                time.sleep(3 * (attempt + 1))
            else:
                raise


def rest_patch(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{NEW_URL}{path}", data=data,
        headers={
            "Authorization": f"Bearer {SERVICE_KEY}",
            "apikey": SERVICE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="PATCH",
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                r.read()
            return
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"PATCH HTTP {e.code}: {e.read().decode()[:200]}")
        except Exception as e:
            if attempt < 3:
                time.sleep(3 * (attempt + 1))
            else:
                raise


def download(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return r.read()
        except Exception as e:
            if attempt < 3:
                time.sleep(3 * (attempt + 1))
            else:
                raise


def storage_upload(path, data, mime="image/png"):
    url = f"{NEW_URL}/storage/v1/object/{BUCKET}/{path}"
    req = urllib.request.Request(
        url, data=data,
        headers={
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": mime,
            "x-upsert": "true",
        },
        method="POST",
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                r.read()
            return f"{NEW_URL}/storage/v1/object/public/{BUCKET}/{path}"
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"Upload HTTP {e.code}: {e.read().decode()[:200]}")
        except Exception as e:
            if attempt < 3:
                time.sleep(3 * (attempt + 1))
            else:
                raise RuntimeError(f"Upload failed after {attempt+1} tries: {e}")


def main():
    print("Fetching products with additional_images ...")
    products = rest_get(
        "/rest/v1/products"
        "?select=id,sku,additional_images"
        "&limit=200"
    )
    with_extra = [p for p in products
                  if p.get("additional_images") and len(p["additional_images"]) > 0]
    print(f"  {len(with_extra)} products have additional_images\n")

    total_imgs = sum(len(p["additional_images"]) for p in with_extra)
    migrated = skipped = failed = 0
    errors = []

    for p in with_extra:
        sku = p["sku"]
        pid = p["id"]
        old_urls = p["additional_images"]

        # Skip entirely if all URLs already on new project
        if all(NEW_HOST in u for u in old_urls):
            skipped += len(old_urls)
            print(f"  SKIP (already new): {sku}  ({len(old_urls)} images)")
            continue

        print(f"  {sku}  ({len(old_urls)} images) ...", end=" ", flush=True)
        new_urls = []
        product_ok = True

        for old_url in old_urls:
            # Already migrated
            if NEW_HOST in old_url:
                new_urls.append(old_url)
                skipped += 1
                continue

            # Extract filename from old URL  e.g. .../product-images/<pid>/front.png
            filename = old_url.rsplit("/", 1)[-1]   # front.png
            storage_path = f"{pid}/{filename}"
            new_url = f"{NEW_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"

            try:
                img_bytes = download(old_url)
                storage_upload(storage_path, img_bytes)
                new_urls.append(new_url)
                migrated += 1
            except Exception as e:
                print(f"\n    FAIL {filename}: {e}")
                new_urls.append(old_url)   # keep old URL so product still works
                errors.append({"sku": sku, "file": filename, "error": str(e)})
                failed += 1
                product_ok = False

            time.sleep(DELAY)

        # Update DB with new URL array
        try:
            rest_patch(f"/rest/v1/products?id=eq.{pid}",
                       {"additional_images": new_urls})
            status = "OK" if product_ok else "partial"
            print(f"-> DB updated ({status})")
        except Exception as e:
            print(f"\n    DB PATCH FAILED: {e}")
            errors.append({"sku": sku, "file": "DB patch", "error": str(e)})

    print("\n" + "=" * 60)
    print(f"DONE  migrated:{migrated}  skipped:{skipped}  failed:{failed}")
    print(f"Total images processed: {migrated + skipped + failed} / {total_imgs}")
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for e in errors:
            print(f"  {e['sku']} / {e['file']}: {e['error']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
