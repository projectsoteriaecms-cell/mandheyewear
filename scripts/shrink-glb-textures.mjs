#!/usr/bin/env node
/**
 * Downscales the textures embedded in a GLB and repacks it.
 *
 * Why: Meshy returns 2048x2048 PBR maps regardless of how small the object
 * renders. For eyewear — which occupies a modest part of a phone screen — that
 * is far more detail than can ever be resolved, and it dominates the Lens size
 * budget (measured: 7.34MB of textures against 0.70MB of geometry on a
 * 20k-triangle frame). Snap caps a Lens at 8MB total, so this is the difference
 * between a few frames fitting and none.
 *
 * Geometry is left untouched — reduce that with Meshy's `target_polycount`
 * (see meshy-3d-pipeline.mjs), which produces proper topology rather than
 * naive decimation.
 *
 * Usage:
 *   node scripts/shrink-glb-textures.mjs <input.glb> <output.glb> [--size 512] [--quality 88]
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

// ffmpeg ships with the project toolchain on this machine; fall back to PATH.
const FFMPEG_CANDIDATES = [
  "C:/Users/DELL/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe",
  "ffmpeg",
];

function resolveFfmpeg() {
  for (const c of FFMPEG_CANDIDATES) {
    try {
      execFileSync(c, ["-version"], { stdio: "ignore" });
      return c;
    } catch { /* try next */ }
  }
  throw new Error("ffmpeg not found — needed to resize embedded textures");
}

function parseGLB(buf) {
  if (buf.readUInt32LE(0) !== GLB_MAGIC) throw new Error("Not a GLB file");
  const total = buf.readUInt32LE(8);
  let offset = 12, json = null, bin = null;
  while (offset < total) {
    const len = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === CHUNK_JSON) json = JSON.parse(data.toString("utf8"));
    else if (type === CHUNK_BIN) bin = Buffer.from(data);
    offset += 8 + len;
  }
  if (!json || !bin) throw new Error("GLB missing JSON or BIN chunk");
  return { json, bin };
}

function assembleGLB(json, bin) {
  const jsonBuf = Buffer.from(JSON.stringify(json), "utf8");
  const jsonPad = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
  const binPad = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4, 0)]);
  const total = 12 + 8 + jsonPad.length + 8 + binPad.length;
  const out = Buffer.alloc(total);
  out.writeUInt32LE(GLB_MAGIC, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(total, 8);
  let o = 12;
  out.writeUInt32LE(jsonPad.length, o);
  out.writeUInt32LE(CHUNK_JSON, o + 4);
  jsonPad.copy(out, o + 8);
  o += 8 + jsonPad.length;
  out.writeUInt32LE(binPad.length, o);
  out.writeUInt32LE(CHUNK_BIN, o + 4);
  binPad.copy(out, o + 8);
  return out;
}

/** Which image index (if any) each material uses as its normal map. */
function findNormalMapImages(json) {
  const normalImages = new Set();
  (json.materials || []).forEach((m) => {
    const texIdx = m.normalTexture?.index;
    if (texIdx === undefined) return;
    const src = json.textures?.[texIdx]?.source;
    if (src !== undefined) normalImages.add(src);
  });
  return normalImages;
}

function main() {
  const args = process.argv.slice(2);
  const [input, output] = args.filter((a) => !a.startsWith("--"));
  if (!input || !output) {
    console.error("Usage: node scripts/shrink-glb-textures.mjs <input.glb> <output.glb> [--size 512] [--quality 88]");
    process.exit(1);
  }
  const sizeIdx = args.indexOf("--size");
  const size = sizeIdx !== -1 ? Number(args[sizeIdx + 1]) : 512;
  const qIdx = args.indexOf("--quality");
  const quality = qIdx !== -1 ? Number(args[qIdx + 1]) : 88;

  const ffmpeg = resolveFfmpeg();
  const buf = readFileSync(input);
  const { json, bin } = parseGLB(buf);

  const images = json.images || [];
  if (!images.length) {
    console.log("No embedded images — nothing to do.");
    writeFileSync(output, buf);
    return;
  }

  const normalImages = findNormalMapImages(json);
  const work = mkdtempSync(path.join(tmpdir(), "glbtex-"));

  try {
    // Resize each embedded image, keeping the new bytes in memory.
    const replacements = new Map(); // bufferView index -> Buffer
    let beforeBytes = 0, afterBytes = 0;

    images.forEach((img, i) => {
      if (img.bufferView === undefined) return;
      const bv = json.bufferViews[img.bufferView];
      const src = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
      beforeBytes += bv.byteLength;

      const ext = img.mimeType === "image/png" ? "png" : "jpg";
      const inFile = path.join(work, `in_${i}.${ext}`);
      const outFile = path.join(work, `out_${i}.jpg`);
      writeFileSync(inFile, src);

      // Normal maps carry directional data rather than colour; lossy
      // compression distorts lighting, so give them extra quality headroom.
      const q = normalImages.has(i) ? Math.min(96, quality + 8) : quality;
      // ffmpeg's -q:v scale is 2 (best) .. 31 (worst); map from 0-100.
      const qv = Math.max(2, Math.min(31, Math.round(31 - (q / 100) * 29)));

      execFileSync(ffmpeg, [
        "-y", "-loglevel", "error",
        "-i", inFile,
        "-vf", `scale=${size}:${size}:flags=lanczos`,
        "-q:v", String(qv),
        outFile,
      ]);

      const resized = readFileSync(outFile);
      afterBytes += resized.length;
      replacements.set(img.bufferView, resized);
      img.mimeType = "image/jpeg";

      const kind = normalImages.has(i) ? " (normal map)" : "";
      console.log(`  [${i}] ${(bv.byteLength / 1024 / 1024).toFixed(2)} MB -> ${(resized.length / 1024 / 1024).toFixed(2)} MB${kind}`);
    });

    // Rebuild the binary chunk. Every bufferView offset shifts, so recompute
    // them all in order rather than trying to patch in place.
    const parts = [];
    let cursor = 0;
    json.bufferViews.forEach((bv) => {
      const data = replacements.has(json.bufferViews.indexOf(bv))
        ? replacements.get(json.bufferViews.indexOf(bv))
        : bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
      const pad = (4 - (data.length % 4)) % 4;
      bv.byteOffset = cursor;
      bv.byteLength = data.length;
      parts.push(data);
      if (pad) parts.push(Buffer.alloc(pad, 0));
      cursor += data.length + pad;
    });

    const newBin = Buffer.concat(parts);
    if (json.buffers?.[0]) json.buffers[0].byteLength = newBin.length;

    const outBuf = assembleGLB(json, newBin);
    writeFileSync(output, outBuf);

    console.log(`\n  textures: ${(beforeBytes / 1024 / 1024).toFixed(2)} MB -> ${(afterBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`✔ ${path.basename(input)} ${(buf.length / 1024 / 1024).toFixed(2)} MB -> ${path.basename(output)} ${(outBuf.length / 1024 / 1024).toFixed(2)} MB`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main();
