#!/usr/bin/env node
/**
 * Normalizes a GLB's mesh pivot to a consistent point (the geometric center
 * of its bounding box) and reports its real-world dimensions.
 *
 * Why this exists: raw Meshy output has its mesh origin wherever Meshy
 * happened to place it (observed: bottom of the bounding box, not center)
 * -- this varies per generation and is why every frame needed its own
 * hand-tuned position offset in Lens Studio. Recentering every model to the
 * SAME convention (geometric center at local origin) before it ever reaches
 * Lens Studio means every future frame behaves identically under one fixed,
 * calibrated-once offset -- fixing one frame's position never requires
 * touching any other frame.
 *
 * Usage:
 *   node scripts/normalize-glb-pivot.mjs <input.glb> <output.glb>
 */

import { readFileSync, writeFileSync } from "node:fs";

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;
const COMPONENT_TYPE_SIZES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

function parseGLB(buf) {
  if (buf.readUInt32LE(0) !== GLB_MAGIC) fail("Not a valid GLB file");
  const totalLength = buf.readUInt32LE(8);

  let offset = 12;
  let json = null;
  let binChunk = null;
  while (offset < totalLength) {
    const chunkLength = buf.readUInt32LE(offset);
    const chunkType = buf.readUInt32LE(offset + 4);
    const chunkData = buf.subarray(offset + 8, offset + 8 + chunkLength);
    if (chunkType === CHUNK_JSON) json = JSON.parse(chunkData.toString("utf8"));
    else if (chunkType === CHUNK_BIN) binChunk = Buffer.from(chunkData);
    offset += 8 + chunkLength;
  }
  if (!json || !binChunk) fail("GLB missing JSON or BIN chunk");
  return { json, binChunk };
}

function findPositionAccessorIndices(json) {
  const indices = [];
  (json.meshes || []).forEach((mesh) => {
    (mesh.primitives || []).forEach((prim) => {
      if (prim.attributes && "POSITION" in prim.attributes) {
        indices.push(prim.attributes.POSITION);
      }
    });
  });
  return [...new Set(indices)];
}

function readVec3Array(json, binChunk, accessorIndex) {
  const accessor = json.accessors[accessorIndex];
  const bufferView = json.bufferViews[accessor.bufferView];
  const componentSize = COMPONENT_TYPE_SIZES[accessor.componentType];
  const stride = bufferView.byteStride || componentSize * 3;
  const baseOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);

  if (accessor.componentType !== 5126) fail("Only FLOAT position accessors are supported");

  const verts = [];
  for (let i = 0; i < accessor.count; i++) {
    const o = baseOffset + i * stride;
    verts.push([binChunk.readFloatLE(o), binChunk.readFloatLE(o + 4), binChunk.readFloatLE(o + 8)]);
  }
  return { verts, accessor, bufferView, baseOffset, stride };
}

function writeVec3Array(binChunk, verts, baseOffset, stride) {
  verts.forEach((v, i) => {
    const o = baseOffset + i * stride;
    binChunk.writeFloatLE(v[0], o);
    binChunk.writeFloatLE(v[1], o + 4);
    binChunk.writeFloatLE(v[2], o + 8);
  });
}

// Loop rather than Math.min(...arr) -- spreading a 100k+ element vertex array
// overflows the call stack (hit this on a multi-image model with ~200k verts).
function computeBounds(verts) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const v of verts) {
    for (let a = 0; a < 3; a++) {
      if (v[a] < min[a]) min[a] = v[a];
      if (v[a] > max[a]) max[a] = v[a];
    }
  }
  return { min, max };
}

function assembleGLB(json, binChunk) {
  const jsonBuf = Buffer.from(JSON.stringify(json), "utf8");
  const jsonPadded = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
  const binPadded = Buffer.concat([binChunk, Buffer.alloc((4 - (binChunk.length % 4)) % 4, 0)]);

  const totalLength = 12 + 8 + jsonPadded.length + 8 + binPadded.length;
  const out = Buffer.alloc(totalLength);

  out.writeUInt32LE(GLB_MAGIC, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(totalLength, 8);

  let o = 12;
  out.writeUInt32LE(jsonPadded.length, o);
  out.writeUInt32LE(CHUNK_JSON, o + 4);
  jsonPadded.copy(out, o + 8);
  o += 8 + jsonPadded.length;

  out.writeUInt32LE(binPadded.length, o);
  out.writeUInt32LE(CHUNK_BIN, o + 4);
  binPadded.copy(out, o + 8);

  return out;
}

/**
 * glTF's spec unit is METRES; Lens Studio's scene unit is CENTIMETRES. Meshy
 * exports to spec, so a raw frame arrives ~0.14 units wide where the Eyewear
 * Try-On template's own frames are ~15 units wide -- a 100x mismatch.
 *
 * Baking the conversion into the mesh (rather than compensating with a scale
 * transform in the scene) is what makes every generated frame interchangeable
 * with the template's: all of them then sit at scale 1 in the same convention.
 * That matters because TrueSize.js force-overwrites the world scale of every
 * enabled Main Box child to ONE shared `defaultScale` on any depth-capable
 * device -- so a frame needing a different scale than its siblings is
 * physically unrepresentable there. Uniform units is the only stable fix.
 */
const METRES_TO_CENTIMETRES = 100;

/**
 * Normalizes a GLB for the try-on carousel: recenters mesh geometry on its own
 * bounding-box centre (Meshy's pivot placement is arbitrary per generation) and
 * converts metres to centimetres. Pure function, no file I/O -- used by the CLI
 * below and by meshy-3d-pipeline.mjs, so every generated frame is normalized
 * automatically at download time.
 */
export function normalizeGLBBuffer(buf, { unitScale = METRES_TO_CENTIMETRES, targetWidthCm = null } = {}) {
  const { json, binChunk } = parseGLB(buf);

  const posAccessorIndices = findPositionAccessorIndices(json);
  if (!posAccessorIndices.length) fail("No POSITION accessor found in GLB");
  if (posAccessorIndices.length > 1) {
    console.log(`Note: ${posAccessorIndices.length} separate POSITION accessors found (multi-part mesh) -- normalizing all against one shared bounding box.`);
  }

  // Pass 1: read all vertex sets and compute the OVERALL bounding box across
  // every position accessor, so a multi-part mesh normalizes as one object.
  const parts = posAccessorIndices.map((idx) => readVec3Array(json, binChunk, idx));
  const allVerts = parts.flatMap((p) => p.verts);
  const before = computeBounds(allVerts);
  const center = [
    (before.min[0] + before.max[0]) / 2,
    (before.min[1] + before.max[1]) / 2,
    (before.min[2] + before.max[2]) / 2,
  ];

  // Meshy's `auto_size` only ESTIMATES real-world size, and the estimate varies
  // between generations of the same product (observed 14.45cm vs 12.08cm for
  // MH-506 from single- vs multi-image). When the catalog knows the frame's true
  // width -- every product has lens_width + bridge_size -- scale to that instead
  // of trusting the estimate. Uniform, verifiable, and identical every rerun.
  const rawWidth = before.max[0] - before.min[0];
  const effectiveScale = targetWidthCm ? targetWidthCm / rawWidth : unitScale;

  const transform = (v) => [
    (v[0] - center[0]) * effectiveScale,
    (v[1] - center[1]) * effectiveScale,
    (v[2] - center[2]) * effectiveScale,
  ];

  // Pass 2: recentre and rescale every vertex in every part. Normals/tangents
  // are left untouched -- a uniform positive scale preserves their direction.
  const perPartBounds = parts.map((p) => {
    const normalized = p.verts.map(transform);
    writeVec3Array(binChunk, normalized, p.baseOffset, p.stride);
    const bounds = computeBounds(normalized);
    p.accessor.min = bounds.min;
    p.accessor.max = bounds.max;
    return bounds;
  });

  // Combine the per-part bounds rather than re-transforming every vertex again.
  const after = computeBounds(perPartBounds.flatMap((b) => [b.min, b.max]));

  const outBuf = assembleGLB(json, binChunk);
  return { outBuf, before, after, center, unitScale: effectiveScale, scaledToTarget: !!targetWidthCm };
}

function main() {
  const args = process.argv.slice(2);
  const twIdx = args.indexOf("--target-width");
  const targetWidthCm = twIdx !== -1 ? Number(args[twIdx + 1]) : null;
  // Guard the -1 sentinel: without it, `twIdx + 1` is 0 and the filter drops
  // the input path whenever --target-width isn't supplied.
  const valueIdx = twIdx === -1 ? -1 : twIdx + 1;
  const [inputPath, outputPath] = args.filter((a, i) => !a.startsWith("--") && i !== valueIdx);

  if (!inputPath || !outputPath) {
    fail("Usage: node scripts/normalize-glb-pivot.mjs <input.glb> <output.glb> [--target-width <cm>]");
  }

  const buf = readFileSync(inputPath);
  const { outBuf, before, after, center, unitScale, scaledToTarget } = normalizeGLBBuffer(buf, { targetWidthCm });

  const dims = (b) => b.max.map((mx, i) => (mx - b.min[i]).toFixed(2)).join(" x ");
  console.log(`Bounds before (raw glTF metres): ${dims(before)}`);
  console.log(`  min: [${before.min.map((n) => n.toFixed(4))}]`);
  console.log(`  max: [${before.max.map((n) => n.toFixed(4))}]`);
  console.log(`  pivot offset removed: [${center.map((n) => n.toFixed(4))}]`);
  console.log(
    scaledToTarget
      ? `Bounds after (scaled to real catalog width ${targetWidthCm}cm, x${unitScale.toFixed(2)}): ${dims(after)} cm`
      : `Bounds after (Lens Studio centimetres, x${unitScale}): ${dims(after)} cm`
  );
  console.log(`  min: [${after.min.map((n) => n.toFixed(3))}]`);
  console.log(`  max: [${after.max.map((n) => n.toFixed(3))}]`);

  writeFileSync(outputPath, outBuf);
  console.log(`\n✔ Wrote normalized GLB to ${outputPath} (${(outBuf.length / 1024 / 1024).toFixed(2)} MB)`);
}

if (import.meta.main) {
  main();
}
