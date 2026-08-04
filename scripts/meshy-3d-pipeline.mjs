#!/usr/bin/env node
/**
 * Meshy AI image-to-3D pipeline for the M&H Eyewear frame catalog.
 *
 * One-at-a-time by design: submit a single product's photo(s), poll until
 * done, download the result into ./ar-3d-staging/ for manual review + import
 * into Lens Studio. Never writes into the live Lens Studio project directly.
 *
 * Safety guards (Meshy's own MCP server/skill pack explicitly do NOT provide
 * these — same REST calls, same credit cost, no dedup — so they live here):
 *   - manifest-based dedup: refuses to re-run an already-SUCCEEDED product
 *     unless --force is passed (prevents accidental double-spend)
 *   - balance check before AND after every run, with a hard floor (--min-balance)
 *   - --dry-run stops before any Meshy API call
 *
 * Usage:
 *   node --env-file=.env scripts/meshy-3d-pipeline.mjs <product-id-or-sku>
 *   node --env-file=.env scripts/meshy-3d-pipeline.mjs <product-id-or-sku> --dry-run
 *   node --env-file=.env scripts/meshy-3d-pipeline.mjs <product-id-or-sku> --force
 *   node --env-file=.env scripts/meshy-3d-pipeline.mjs <product-id-or-sku> --multi-image
 *   node --env-file=.env scripts/meshy-3d-pipeline.mjs <product-id-or-sku> --texture-prompt "glossy black acetate"
 *   node --env-file=.env scripts/meshy-3d-pipeline.mjs --check-balance
 */

import { writeFile, mkdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { normalizeGLBBuffer } from "./normalize-glb-pivot.mjs";

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const STAGING_DIR = path.resolve(process.cwd(), "ar-3d-staging");
const MANIFEST_PATH = path.join(STAGING_DIR, "manifest.json");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_MIN_BALANCE = 50; // a single generation costs ~30-40 credits

// Throws instead of calling process.exit() directly -- an abrupt exit while
// fetch's keep-alive sockets are still open crashes Node with an internal
// libuv assertion (UV_HANDLE_CLOSING). Throwing lets main().catch() report
// the error and exit naturally once pending handles close on their own.
function fail(msg) {
  throw new Error(msg);
}

if (!MESHY_API_KEY) fail("MESHY_API_KEY is not set. Run with: node --env-file=.env scripts/meshy-3d-pipeline.mjs ...");
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) fail("Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).");

const args = process.argv.slice(2);
// Flags that consume the following token, so it isn't mistaken for the
// product identifier.
const VALUE_FLAGS = new Set(["--texture-prompt", "--min-balance", "--polycount", "--target-width"]);
const identifier = args.find((a, i) => !a.startsWith("--") && !VALUE_FLAGS.has(args[i - 1]));

const texturePromptIdx = args.indexOf("--texture-prompt");
const texturePrompt = texturePromptIdx !== -1 ? args[texturePromptIdx + 1] : undefined;
const minBalanceIdx = args.indexOf("--min-balance");
const minBalance = minBalanceIdx !== -1 ? Number(args[minBalanceIdx + 1]) : DEFAULT_MIN_BALANCE;
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const useMultiImage = args.includes("--multi-image");
// Triangle budget per frame. Default sized so a handful of frames fit inside
// the Lens's 8MB cap (measured: Lens bytes land at roughly half the source GLB,
// on top of a ~5MB template baseline).
const polycountIdx = args.indexOf("--polycount");
const targetPolycount = polycountIdx !== -1 ? Number(args[polycountIdx + 1]) : 20000;
const checkBalanceOnly = args.includes("--check-balance");
const resumeIdx = args.indexOf("--resume-task");
const resumeTaskId = resumeIdx !== -1 ? args[resumeIdx + 1] : null;

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * Transient network failures are expensive here: a drop AFTER task submission
 * means credits are spent with nothing downloaded. Retrying reads costs
 * nothing and prevents that. (Hit this mid-batch: one `fetch failed` during
 * polling stranded a completed 30-credit model.)
 */
async function fetchWithRetry(url, options = {}, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      const waitMs = 2000 * (i + 1);
      console.log(`  network error (${err.message}); retrying in ${waitMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastErr;
}

async function checkBalance() {
  const res = await fetchWithRetry("https://api.meshy.ai/openapi/v1/balance", {
    headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
  });
  const json = await res.json();
  if (!res.ok) fail(`Meshy balance check failed: ${res.status} ${JSON.stringify(json)}`);
  return json.balance;
}

async function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return [];
  return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
}

async function fetchProduct(idOrSku) {
  const filter = UUID_RE.test(idOrSku) ? `id.eq.${idOrSku}` : `sku.eq.${idOrSku}`;
  const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,brand,color,style,image_url,additional_images,sku,frame_width,bridge_size,temple_length&or=(${filter})&limit=1`;
  const res = await fetchWithRetry(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) fail(`Supabase query failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  if (!rows.length) fail(`No product found matching "${idOrSku}"`);
  return rows[0];
}

/**
 * Real-world frame width in cm from the catalog's own measurements, using the
 * standard eyewear convention: two lenses plus the bridge between them.
 * (MH-506 is marked 54-19-140 -> 2*54 + 19 = 127mm = 12.7cm.)
 *
 * Meshy's `auto_size` only estimates real size and the estimate DRIFTS between
 * generations of the same product -- MH-506 came out 14.45cm from one photo and
 * 12.08cm from four. Scaling to the catalog spec instead makes the result exact,
 * identical on every rerun, and consistent across the whole catalog.
 *
 * Returns null when the product lacks measurements, in which case the caller
 * falls back to the plain metres->centimetres conversion.
 */
function parseMm(v) {
  if (v === null || v === undefined) return null;
  const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function catalogFrameWidthCm(product) {
  const lens = parseMm(product.frame_width);
  const bridge = parseMm(product.bridge_size);
  if (!lens || !bridge) return null;
  return (2 * lens + bridge) / 10;
}

/**
 * Automated quality gate on generated geometry.
 *
 * Reconstruction quality VARIES PER FRAME, and a bad result is not visually
 * obvious: MH-471 produced a thumbnail that looks perfect front-on, but the
 * mesh was only 1.94cm deep -- a flat cutout with no temple arms at all.
 * Front-facing thumbnails cannot reveal this; the depth measurement can.
 *
 * A well-formed frame's depth should approach its catalog temple length
 * (the arms are what create the depth). Observed across the pilot:
 *   MH-107  14.25cm deep vs 140mm temples = 102%  ✅ good
 *   MH-1780 12.53cm deep vs 145mm temples =  86%  ✅ acceptable
 *   MH-471   1.94cm deep vs 140mm temples =  14%  ❌ flat, no temples
 *
 * Flagging these automatically matters at catalog scale -- otherwise broken
 * models get imported silently and are only caught during on-device testing.
 */
function assessGeometry(product, after) {
  const templeMm = parseMm(product.temple_length);
  if (!templeMm) return { verdict: "unknown", reason: "no temple_length in catalog" };
  const depthCm = after.max[2] - after.min[2];
  const ratio = depthCm / (templeMm / 10);
  if (ratio < 0.5) {
    return {
      verdict: "FAILED",
      ratio,
      reason: `depth ${depthCm.toFixed(2)}cm is only ${(ratio * 100).toFixed(0)}% of the ${templeMm}mm temple length -- the model is flat and almost certainly has no temple arms`,
    };
  }
  if (ratio < 0.75) {
    return {
      verdict: "WEAK",
      ratio,
      reason: `depth ${depthCm.toFixed(2)}cm is ${(ratio * 100).toFixed(0)}% of the ${templeMm}mm temple length -- temples are likely short or partial`,
    };
  }
  return { verdict: "OK", ratio };
}

/** Single best shot — front-on product photo, preferred for the default single-image path. */
function pickSourceImage(product) {
  const additional = product.additional_images || [];
  const front = additional.find((u) => /front/i.test(u));
  if (front) return front;
  if (product.image_url) return product.image_url;
  if (additional.length) return additional[0];
  fail(`Product "${product.name}" has no usable image.`);
}

/**
 * Images for multi-image-to-3d.
 *
 * Two things learned the hard way on this catalog:
 *
 * 1. WORN/LIFESTYLE SHOTS HURT (MH-506, 2026-07-30). Multi-image reconstruction
 *    needs the SAME OBJECT FROM DIFFERENT VIEWPOINTS, unoccluded. This catalog's
 *    additional_images mix isolated product shots with shots of the frame WORN
 *    on a mannequin head or model (mannequin.png, lifestyle_*.png) and measurement
 *    drawings (spec_diagram.png) -- none of those are a second clean view of the
 *    frame itself. Feeding the worn shots alongside a clean product shot made
 *    Meshy reconcile a clean frame against images where a head hides most of
 *    it; the result collapsed to just the brow tips, far worse than a single
 *    clean image alone. These are excluded unconditionally.
 *
 * 2. `image_url` ("anchor.jpg") IS A GENUINE SECOND VIEW, and should always be
 *    paired with front.png when both exist (MH-1780, 2026-08-01). front.png is
 *    dead-on and gives Meshy almost no depth cue for temple arms, which is
 *    exactly why MH-1780's front-only generation scored 15% of its catalog
 *    temple length -- effectively no temples at all. anchor.jpg is a clean,
 *    unoccluded three-quarter studio shot with the temples clearly visible, the
 *    same kind of view multi-image reconstruction actually needs. Unlike the
 *    worn shots, it's isolated product photography, not a face wearing the
 *    frame -- so this is the STANDARD source pair going forward, not a one-off.
 */
const WORN_OR_NON_PHOTO = /mannequin|lifestyle|spec_diagram/i;

function pickSourceImages(product) {
  const isolated = (product.additional_images || []).filter((u) => !WORN_OR_NON_PHOTO.test(u));
  const front = isolated.find((u) => /front/i.test(u));
  const anchor = product.image_url || null;

  // front + anchor is the standard pair: a dead-on shot plus a genuine
  // three-quarter view. De-duped in case a product happens to reuse one URL
  // for both fields.
  const ordered = [...new Set([front, anchor].filter(Boolean))];

  if (!ordered.length) {
    // Neither of the standard pair exists -- fall back to whatever isolated
    // shots remain rather than failing outright.
    ordered.push(...isolated);
  }
  if (!ordered.length) fail(`Product "${product.name}" has no usable images.`);
  if (ordered.length === 1) {
    console.log(
      "  ⚠️  Only ONE usable image available (front/anchor pair incomplete, and\n" +
      "      worn/mannequin/diagram shots are excluded -- they degrade reconstruction).\n" +
      "      --multi-image gives no benefit here; this will behave like a single-image run."
    );
  }
  return ordered.slice(0, 4);
}

async function createMeshyTask({ imageUrl, imageUrls }) {
  const endpoint = imageUrls ? "multi-image-to-3d" : "image-to-3d";
  const body = {
    should_texture: true,
    enable_pbr: true,
    auto_size: true,
    target_formats: ["glb"],
    topology: "triangle",
    model_type: "standard",
    ai_model: "latest",
    // Meshy's default (~180k triangles per frame) blows the Lens size budget:
    // three frames came to 22MB against an 8MB cap. Eyewear occupies a small
    // part of the screen and needs nowhere near that density -- the earlier
    // GenAI models rendered fine at ~30k. Remeshing to a fixed budget keeps
    // every frame predictable instead of however dense the reconstruction
    // happened to come out.
    should_remesh: true,
    target_polycount: targetPolycount,
  };
  if (imageUrls) body.image_urls = imageUrls;
  else body.image_url = imageUrl;
  if (texturePrompt) body.texture_prompt = texturePrompt;

  const res = await fetch(`https://api.meshy.ai/openapi/v1/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MESHY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) fail(`Meshy task creation failed: ${res.status} ${JSON.stringify(json)}`);
  return { taskId: json.result, endpoint };
}

async function pollMeshyTask(taskId, endpoint, { timeoutMs = 10 * 60 * 1000, intervalMs = 8000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetchWithRetry(`https://api.meshy.ai/openapi/v1/${endpoint}/${taskId}`, {
      headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
    });
    const task = await res.json();
    if (!res.ok) fail(`Meshy poll failed: ${res.status} ${JSON.stringify(task)}`);

    process.stdout.write(`\r  ${task.status} — ${task.progress ?? 0}%   `);

    if (task.status === "SUCCEEDED") {
      console.log("");
      return task;
    }
    if (task.status === "FAILED" || task.status === "CANCELED") {
      console.log("");
      fail(`Meshy task ${task.status}: ${task.task_error?.message || "no error message"}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  fail(`Timed out waiting for Meshy task ${taskId} after ${timeoutMs / 1000}s. Check it later at https://api.meshy.ai/openapi/v1/${endpoint}/${taskId}`);
}

async function downloadFile(url, destPath) {
  const res = await fetchWithRetry(url);
  if (!res.ok) fail(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return buf.length;
}

async function updateManifest(entry) {
  let manifest = await loadManifest();
  manifest = manifest.filter((e) => e.productId !== entry.productId);
  manifest.push(entry);
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function main() {
  await mkdir(STAGING_DIR, { recursive: true });

  if (checkBalanceOnly) {
    const balance = await checkBalance();
    console.log(`Meshy credit balance: ${balance}`);
    return;
  }

  if (!identifier) fail("Usage: node --env-file=.env scripts/meshy-3d-pipeline.mjs <product-id-or-sku> [options]. Or: --check-balance");

  console.log("Checking Meshy credit balance...");
  const balanceBefore = await checkBalance();
  console.log(`  Balance: ${balanceBefore} credits`);
  if (balanceBefore < minBalance) {
    fail(`Balance (${balanceBefore}) is below the safety floor (${minBalance}). Refusing to run. Override with --min-balance <n> if this is intentional.`);
  }

  console.log(`Looking up product "${identifier}"...`);
  const product = await fetchProduct(identifier);
  console.log(`Found: ${product.name} (${product.brand || "no brand"}, sku ${product.sku})`);

  const manifest = await loadManifest();
  const existing = manifest.find((e) => e.productId === product.id);
  if (existing && existing.status === "SUCCEEDED" && !force) {
    fail(
      `"${product.name}" was already converted successfully on ${existing.finishedAt} ` +
      `(task ${existing.meshyTaskId}, ${existing.glbPath}). Refusing to re-run and spend credits again. ` +
      `Pass --force if you specifically want to regenerate it.`
    );
  }

  let imageUrl, imageUrls;
  if (useMultiImage) {
    imageUrls = pickSourceImages(product);
    console.log(`Source images (${imageUrls.length}):\n  ${imageUrls.join("\n  ")}`);
  } else {
    imageUrl = pickSourceImage(product);
    console.log(`Source image: ${imageUrl}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: stopping before any Meshy API call (no credits spent).\n");
    return;
  }

  let taskId, endpoint;
  if (resumeTaskId) {
    // Recovery path: the model was already generated and PAID FOR, but a
    // network drop lost it before download. Re-submitting would charge again,
    // so pick up the existing task instead.
    taskId = resumeTaskId;
    endpoint = useMultiImage ? "multi-image-to-3d" : "image-to-3d";
    console.log(`Resuming existing task ${taskId} — no new credits will be spent.`);
  } else {
    console.log(`Submitting to Meshy AI (${useMultiImage ? "multi-image-to-3D" : "image-to-3D"}, PBR + auto-size enabled)...`);
    ({ taskId, endpoint } = await createMeshyTask({ imageUrl, imageUrls }));
    console.log(`Task created: ${taskId}`);
  }

  console.log("Polling for completion (this can take a few minutes)...");
  const task = await pollMeshyTask(taskId, endpoint);

  const slug = slugify(product.sku || product.name);
  const glbPath = path.join(STAGING_DIR, `${slug}.glb`);
  const thumbPath = task.thumbnail_url ? path.join(STAGING_DIR, `${slug}_thumb.jpg`) : null;

  console.log(`Downloading model to ${glbPath}...`);
  const glbBytes = await downloadFile(task.model_urls.glb, glbPath);
  console.log(`  ${(glbBytes / 1024 / 1024).toFixed(2)} MB`);

  // Every raw Meshy model has its own arbitrary pivot point (observed: origin
  // at the bottom of the bounding box, not the center) -- recenter it here,
  // automatically, so every frame this pipeline produces behaves identically
  // once placed in Lens Studio. This is what makes the try-on positioning a
  // one-time calibration instead of a per-frame fight.
  const targetWidthCm = catalogFrameWidthCm(product);
  if (targetWidthCm) {
    console.log(`Normalizing: pivot -> centre, scaled to catalog spec ${targetWidthCm}cm wide (${product.frame_width}-${product.bridge_size}-${product.temple_length})...`);
  } else {
    console.log("Normalizing: pivot -> centre, metres -> centimetres (no catalog measurements for this product)...");
  }
  const rawBuf = await readFile(glbPath);
  const { outBuf, before, after } = normalizeGLBBuffer(rawBuf, { targetWidthCm });
  await writeFile(glbPath, outBuf);
  const dims = (b) => b.max.map((mx, i) => (mx - b.min[i]).toFixed(2)).join(" x ");
  console.log(`  Before (glTF metres): ${dims(before)}`);
  console.log(`  After  (Lens Studio cm): ${dims(after)} cm, pivot at geometric centre`);

  const quality = assessGeometry(product, after);
  if (quality.verdict === "FAILED") {
    console.log(`\n  ❌ QUALITY CHECK FAILED — ${quality.reason}`);
    console.log(`     Do not import this model; it needs regenerating (ideally from a side/three-quarter photo).`);
  } else if (quality.verdict === "WEAK") {
    console.log(`\n  ⚠️  QUALITY WARNING — ${quality.reason}`);
  } else if (quality.verdict === "OK") {
    console.log(`  ✅ Geometry check passed (depth is ${(quality.ratio * 100).toFixed(0)}% of temple length)`);
  }

  // Meshy serves thumbnails as PNG regardless of what you name the file. A
  // file whose CONTENT doesn't match its EXTENSION crashes Lens Studio's
  // texture compressor (EtcConvertor exit -2, "Failed to compress file"),
  // which previously took the whole render pipeline down. Detect the real
  // format from magic bytes and name it accordingly.
  let finalThumbPath = thumbPath;
  if (thumbPath) {
    await downloadFile(task.thumbnail_url, thumbPath);
    const head = await readFile(thumbPath);
    const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
    if (isPng && thumbPath.endsWith(".jpg")) {
      finalThumbPath = thumbPath.replace(/\.jpg$/, ".png");
      await writeFile(finalThumbPath, head);
      await rm(thumbPath, { force: true });
      console.log(`Thumbnail saved to ${finalThumbPath} (content is PNG — renamed so Lens Studio can compress it)`);
    } else {
      console.log(`Thumbnail saved to ${thumbPath}`);
    }
  }

  const balanceAfter = await checkBalance();

  await updateManifest({
    productId: product.id,
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    sourceImagesUsed: imageUrls || [imageUrl],
    endpoint,
    meshyTaskId: taskId,
    consumedCredits: task.consumed_credits,
    balanceBefore,
    balanceAfter,
    status: task.status,
    createdAt: task.created_at,
    finishedAt: task.finished_at,
    glbPath: path.relative(process.cwd(), glbPath),
    thumbnailPath: finalThumbPath ? path.relative(process.cwd(), finalThumbPath) : null,
    pivotNormalized: true,
    geometryVerdict: quality.verdict,
    geometryDepthRatio: quality.ratio ?? null,
    scaledToCatalogSpec: !!targetWidthCm,
    targetWidthCm,
    catalogSpec: `${product.frame_width ?? "?"}-${product.bridge_size ?? "?"}-${product.temple_length ?? "?"}`,
    dimensionsCm: {
      width: after.max[0] - after.min[0],
      height: after.max[1] - after.min[1],
      depth: after.max[2] - after.min[2],
    },
  });

  console.log(`\n✔ Done. Consumed ${task.consumed_credits} credits. Balance: ${balanceBefore} → ${balanceAfter}.`);
  console.log(`  Review the thumbnail, then manually import ${glbPath} into Lens Studio.`);
  console.log(`  Manifest updated: ${MANIFEST_PATH}\n`);
}

main().catch((err) => {
  console.error(`\n✖ ${err.message}\n`);
  process.exitCode = 1;
});
