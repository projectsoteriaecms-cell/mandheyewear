#!/usr/bin/env node
/**
 * Splits a merged single-material GLB into two: the original opaque material
 * for the frame, and a new transparent glass material for the lenses.
 *
 * Why this exists: Meshy's image-to-3D never emits a separate lens material —
 * it photographs the REFLECTION off real glass and bakes that as an ordinary
 * opaque diffuse texture. Every generated frame comes back this way; it's not
 * a one-off defect. Confirmed on mh_506/mh_107/mh_1780: single material,
 * single primitive, alphaMode OPAQUE, across all three.
 *
 * How the split works (pure geometry, no texture/color heuristics — those
 * risk punching holes in bright metal specular highlights): region-growing
 * over triangle adjacency, merging triangles into a region while its normal
 * stays within ANGLE_THRESHOLD_DEG of the region's running average. A lens is
 * a large, near-planar slab, so it surfaces as the top few regions by area;
 * the frame (bridge, rim edge, temples, nose pads) fragments into many small
 * regions because it's thin and curved. Validated on the Cartier 30104
 * (rimless): the top 4 regions were two front/back-facing pairs at the two
 * lens X-positions -- 58.6% of the mesh, matching the visible lens silhouette
 * exactly when rasterized for a sanity check.
 *
 * NOT yet validated on full-rim shapes (aviator, Dario), where the lens sits
 * recessed inside a metal band rather than dominating the surface -- the
 * region should still surface as a top-area planar patch since the method is
 * shape-based, not frame-type-specific, but confirm with --dump-regions
 * before trusting the split blind on a new shape family.
 *
 * Usage:
 *   node scripts/split-lens-material.mjs <input.glb> <output.glb> [--dump-regions]
 */

import { readFileSync, writeFileSync } from "node:fs";

const ANGLE_THRESHOLD_DEG = 20;
const AREA_THRESHOLD_PCT = 5; // regions at/above this share of total mesh area count as "lens"

// Neutral, lightly-tinted clear glass, used when --keep-texture is not passed.
// There is no lens-tint column anywhere in the catalog schema (checked
// products.color and frame_attributes.front_color/temple_color -- both are
// FRAME colour, e.g. "Gold" for MH-107's metal, not its amber lenses), so
// this can't be sourced per-product. Fine for clear/lightly-tinted lenses
// (confirmed on the Cartier); wrong for anything with a visibly coloured
// lens, since it discards whatever was actually photographed.
const NEUTRAL_LENS_MATERIAL = {
  name: "lens_glass",
  pbrMetallicRoughness: {
    baseColorFactor: [0.88, 0.91, 0.93, 0.22],
    metallicFactor: 0,
    roughnessFactor: 0.08,
  },
  alphaMode: "BLEND",
  doubleSided: true,
};

// Keeps the frame's own baseColorTexture on the lens primitive instead of a
// flat tint. baseColorFactor's alpha multiplies the texture's (implicit 1.0)
// alpha, so this reproduces whatever colour was actually photographed --
// amber gradient, mirrored, whatever -- just made translucent. Trades the
// data-gap problem for inheriting any texture-baking artefacts (highlights,
// reflections) baked into that same region.
function texturedLensMaterial(baseColorTextureIndex, alpha) {
  return {
    name: "lens_glass_textured",
    pbrMetallicRoughness: {
      baseColorTexture: { index: baseColorTextureIndex },
      baseColorFactor: [1, 1, 1, alpha],
      metallicFactor: 0,
      roughnessFactor: 0.08,
    },
    alphaMode: "BLEND",
    doubleSided: true,
  };
}

function parseGLB(buf) {
  const total = buf.readUInt32LE(8);
  let offset = 12, json = null, bin = null;
  while (offset < total) {
    const len = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(data.toString("utf8"));
    else if (type === 0x004e4942) bin = Buffer.from(data);
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
  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(total, 8);
  let o = 12;
  out.writeUInt32LE(jsonPad.length, o);
  out.writeUInt32LE(0x4e4f534a, o + 4);
  jsonPad.copy(out, o + 8);
  o += 8 + jsonPad.length;
  out.writeUInt32LE(binPad.length, o);
  out.writeUInt32LE(0x004e4942, o + 4);
  binPad.copy(out, o + 8);
  return out;
}

function readVec3Accessor(json, bin, idx) {
  const acc = json.accessors[idx];
  const bv = json.bufferViews[acc.bufferView];
  const base = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const stride = bv.byteStride || 12;
  const out = [];
  for (let i = 0; i < acc.count; i++) {
    const o = base + i * stride;
    out.push([bin.readFloatLE(o), bin.readFloatLE(o + 4), bin.readFloatLE(o + 8)]);
  }
  return out;
}

function readIndices(json, bin, idx) {
  const acc = json.accessors[idx];
  const bv = json.bufferViews[acc.bufferView];
  const base = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const compSize = { 5121: 1, 5123: 2, 5125: 4 }[acc.componentType];
  const out = [];
  for (let i = 0; i < acc.count; i++) {
    const o = base + i * compSize;
    out.push(compSize === 1 ? bin.readUInt8(o) : compSize === 2 ? bin.readUInt16LE(o) : bin.readUInt32LE(o));
  }
  return { indices: out, componentType: acc.componentType, compSize };
}

function sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function cross(a, b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function vlen(a) { return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]); }
function norm(a) { const l = vlen(a) || 1; return [a[0]/l, a[1]/l, a[2]/l]; }
function dot(a, b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }

function segmentLensTriangles(positions, indices) {
  const triCount = indices.length / 3;
  const triNormal = new Array(triCount);
  const triArea = new Array(triCount);
  const triVerts = new Array(triCount);

  for (let t = 0; t < triCount; t++) {
    const i0 = indices[t*3], i1 = indices[t*3+1], i2 = indices[t*3+2];
    const p0 = positions[i0], p1 = positions[i1], p2 = positions[i2];
    const c = cross(sub(p1, p0), sub(p2, p0));
    triNormal[t] = norm(c);
    triArea[t] = vlen(c) / 2;
    triVerts[t] = [i0, i1, i2];
  }

  const edgeMap = new Map();
  const edgeKey = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);
  for (let t = 0; t < triCount; t++) {
    const [i0, i1, i2] = triVerts[t];
    for (const [a, b] of [[i0,i1],[i1,i2],[i2,i0]]) {
      const k = edgeKey(a, b);
      if (!edgeMap.has(k)) edgeMap.set(k, []);
      edgeMap.get(k).push(t);
    }
  }
  const triNeighbors = Array.from({ length: triCount }, () => []);
  for (const tris of edgeMap.values()) {
    if (tris.length === 2) {
      triNeighbors[tris[0]].push(tris[1]);
      triNeighbors[tris[1]].push(tris[0]);
    }
  }

  const cosThresh = Math.cos(ANGLE_THRESHOLD_DEG * Math.PI / 180);
  const visited = new Array(triCount).fill(false);
  const regions = [];

  for (let seed = 0; seed < triCount; seed++) {
    if (visited[seed]) continue;
    const region = [seed];
    visited[seed] = true;
    let avgNormal = [...triNormal[seed]];
    const queue = [seed];
    let qi = 0;
    while (qi < queue.length) {
      const t = queue[qi++];
      for (const n of triNeighbors[t]) {
        if (visited[n]) continue;
        if (dot(triNormal[n], avgNormal) / (vlen(avgNormal) || 1) >= cosThresh) {
          visited[n] = true;
          region.push(n);
          queue.push(n);
          avgNormal = [avgNormal[0]+triNormal[n][0], avgNormal[1]+triNormal[n][1], avgNormal[2]+triNormal[n][2]];
        }
      }
    }
    const totalArea = region.reduce((s, t) => s + triArea[t], 0);
    regions.push({ tris: region, area: totalArea });
  }

  const totalMeshArea = triArea.reduce((s, a) => s + a, 0);
  regions.sort((a, b) => b.area - a.area);

  const lensTris = new Set();
  const lensRegions = [];
  regions.forEach((r) => {
    if ((r.area / totalMeshArea) * 100 >= AREA_THRESHOLD_PCT) {
      lensRegions.push(r);
      r.tris.forEach((t) => lensTris.add(t));
    }
  });

  return { lensTris, regions, totalMeshArea, lensAreaPct: lensRegions.reduce((s,r)=>s+r.area,0) / totalMeshArea * 100 };
}

function main() {
  const args = process.argv.slice(2);
  const dumpRegions = args.includes("--dump-regions");
  const keepTexture = args.includes("--keep-texture");
  const alphaIdx = args.indexOf("--alpha");
  const alpha = alphaIdx !== -1 ? Number(args[alphaIdx + 1]) : (keepTexture ? 0.5 : 0.22);
  // Guard the -1 sentinel: without it, alphaIdx+1 is 0 when --alpha is absent,
  // which would drop the first positional arg (inputPath) instead of nothing.
  const alphaValueIdx = alphaIdx === -1 ? -1 : alphaIdx + 1;
  const [inputPath, outputPath] = args.filter((a, i) => !a.startsWith("--") && i !== alphaValueIdx);
  if (!inputPath || !outputPath) {
    console.error("Usage: node scripts/split-lens-material.mjs <input.glb> <output.glb> [--dump-regions] [--keep-texture] [--alpha 0.5]");
    process.exit(1);
  }

  const buf = readFileSync(inputPath);
  const { json, bin } = parseGLB(buf);

  if (json.meshes.length !== 1 || json.meshes[0].primitives.length !== 1) {
    console.error("Expected exactly one mesh with one primitive (Meshy's merged output) -- got a different shape, refusing to guess.");
    process.exit(1);
  }
  const prim = json.meshes[0].primitives[0];
  const positions = readVec3Accessor(json, bin, prim.attributes.POSITION);
  const { indices, componentType, compSize } = readIndices(json, bin, prim.indices);

  const { lensTris, regions, totalMeshArea, lensAreaPct } = segmentLensTriangles(positions, indices);

  console.log(`Triangles: ${indices.length/3}  |  classified as lens: ${lensTris.size} (${lensAreaPct.toFixed(1)}% of surface area)`);
  if (dumpRegions) {
    console.log("Top 8 regions:");
    regions.slice(0, 8).forEach((r, i) => console.log(`  [${i}] ${(r.area/totalMeshArea*100).toFixed(1)}%  (${r.tris.length} tris)`));
  }
  if (lensTris.size === 0) {
    console.error("No region reached the area threshold -- refusing to write a no-op split. Try --dump-regions to see what was found.");
    process.exit(1);
  }

  // Partition the index buffer, preserving original triangle order within
  // each group.
  const lensIdx = [];
  const frameIdx = [];
  const triCount = indices.length / 3;
  for (let t = 0; t < triCount; t++) {
    const dest = lensTris.has(t) ? lensIdx : frameIdx;
    dest.push(indices[t*3], indices[t*3+1], indices[t*3+2]);
  }

  // Append two new index bufferViews to the binary chunk (attributes are
  // shared unchanged -- only the index lists differ per primitive).
  const parts = [bin];
  let cursor = bin.length;
  // pad to a 4-byte boundary before appending
  const pad4 = (n) => (4 - (n % 4)) % 4;
  if (pad4(cursor)) { const p = Buffer.alloc(pad4(cursor), 0); parts.push(p); cursor += p.length; }

  function writeIndexBuffer(idxArray) {
    const useShort = idxArray.every((v) => v <= 0xFFFF) && componentType !== 5125;
    const ct = useShort ? 5123 : 5125;
    const sz = useShort ? 2 : 4;
    const dataBuf = Buffer.alloc(idxArray.length * sz);
    idxArray.forEach((v, i) => (useShort ? dataBuf.writeUInt16LE(v, i*sz) : dataBuf.writeUInt32LE(v, i*sz)));
    const bvIndex = json.bufferViews.length;
    json.bufferViews.push({ buffer: 0, byteOffset: cursor, byteLength: dataBuf.length, target: 34963 });
    parts.push(dataBuf);
    cursor += dataBuf.length;
    const padLen = pad4(cursor);
    if (padLen) { const p = Buffer.alloc(padLen, 0); parts.push(p); cursor += padLen; }
    const accIndex = json.accessors.length;
    json.accessors.push({ bufferView: bvIndex, componentType: ct, count: idxArray.length, type: "SCALAR" });
    return accIndex;
  }

  const frameIndicesAccessor = writeIndexBuffer(frameIdx);
  const lensIndicesAccessor = writeIndexBuffer(lensIdx);

  const frameMaterialIndex = prim.material ?? 0;
  let lensMaterial = NEUTRAL_LENS_MATERIAL;
  if (keepTexture) {
    const frameTexIndex = json.materials[frameMaterialIndex]?.pbrMetallicRoughness?.baseColorTexture?.index;
    if (frameTexIndex === undefined) {
      console.error("--keep-texture requested but the frame material has no baseColorTexture to inherit.");
      process.exit(1);
    }
    lensMaterial = texturedLensMaterial(frameTexIndex, alpha);
  } else {
    lensMaterial = { ...NEUTRAL_LENS_MATERIAL, pbrMetallicRoughness: { ...NEUTRAL_LENS_MATERIAL.pbrMetallicRoughness, baseColorFactor: [0.88, 0.91, 0.93, alpha] } };
  }
  const lensMaterialIndex = json.materials.length;
  json.materials.push(lensMaterial);

  // Frame keeps the original material; lens gets the new transparent one.
  // Both share the existing vertex attribute accessors.
  json.meshes[0].primitives = [
    { attributes: prim.attributes, indices: frameIndicesAccessor, material: prim.material ?? 0 },
    { attributes: prim.attributes, indices: lensIndicesAccessor, material: lensMaterialIndex },
  ];

  const newBin = Buffer.concat(parts);
  if (json.buffers?.[0]) json.buffers[0].byteLength = newBin.length;

  const outBuf = assembleGLB(json, newBin);
  writeFileSync(outputPath, outBuf);
  console.log(`Frame triangles: ${frameIdx.length/3}, Lens triangles: ${lensIdx.length/3}`);
  console.log(`✔ ${outputPath} (${(outBuf.length/1024/1024).toFixed(2)} MB)`);
}

main();
