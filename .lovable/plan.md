

## Upgrade Live AR to Modern MediaPipe Vision Tasks API

### What's Changing

You're currently using the **legacy** `@mediapipe/face_mesh` package (v0.4, 2021-era). Google has since released the modern **`@mediapipe/tasks-vision`** API which is actively maintained and unlocks powerful features your current setup can't do.

### What You'll Get

1. **Face Blendshapes (52 expressions)** — detect smiles, blinks, eyebrow raises, jaw open, etc. This enables:
   - "Smile to capture" — auto-snap a photo when the user smiles
   - Expression-based frame recommendations ("these frames look great when you smile")
   - Fun UI reactions (sparkle effects when user winks)

2. **Facial Transformation Matrix** — a full 4×4 3D pose matrix giving exact head rotation (pitch/yaw/roll) and translation. This means:
   - **Proper 3D-aware frame tilting** — frames follow head turns accurately, not just 2D angle
   - **Head pose guidance** — "turn slightly left to see the side profile"
   - **Occlusion handling** — hide parts of frames behind the nose/face when turning

3. **Better performance** — the new API uses WebAssembly more efficiently, supports GPU delegate, and has a cleaner lifecycle (no more WASM deletion errors)

4. **Face geometry mesh** — proper UV-mapped 3D mesh for future upgrades (e.g., sunglasses lens tint that follows face contours)

### Technical Plan

**Step 1 — Swap the dependency**
- Remove: `@mediapipe/face_mesh`, `@mediapipe/camera_utils`
- Add: `@mediapipe/tasks-vision`

**Step 2 — Rewrite `useFaceMesh` hook** (`src/shared/hooks/useFaceMesh.ts`)
- Use `FaceLandmarker` from `@mediapipe/tasks-vision` instead of legacy `FaceMesh`
- Use `FilesetResolver.forVisionTasks()` to load WASM
- Run in `VIDEO` mode with `requestAnimationFrame` loop (replaces the Camera util)
- Expose blendshapes and transformation matrix in the returned state
- Keep the same external API shape (`start`, `stop`, `videoRef`, `faceData`, `setOnResults`) so downstream components don't break

**Step 3 — Update `FaceMeshCanvas`** (`src/components/try-on/FaceMeshCanvas.tsx`)
- Adapt the results handler to the new `FaceLandmarkerResult` shape (`.faceLandmarks[0]` instead of `.multiFaceLandmarks[0]`)
- Pass transformation matrix to `computeGlassesTransform` for 3D-aware positioning

**Step 4 — Enhance `glasses-overlay.ts`** (`src/shared/lib/glasses-overlay.ts`)
- Accept optional transformation matrix for true 3D rotation
- Use yaw from the matrix to scale frame width (perspective foreshortening when turning head)
- Use pitch to adjust vertical offset

**Step 5 — Add "Smile to Capture" feature**
- New `useBlendshapes` utility that reads the `mouthSmileLeft` + `mouthSmileRight` blendshape scores
- When smile score > 0.6 for 500ms, auto-trigger capture with a visual countdown
- Toggle on/off via a small button in the AR UI

**Step 6 — Add Head Pose Guidance overlay**
- Small directional indicator in the AR canvas: "Turn left ←" / "Look straight"
- Uses yaw/pitch from the transformation matrix
- Helps users see frames from different angles

### Files Modified
| File | Change |
|------|--------|
| `package.json` | Swap mediapipe packages |
| `src/shared/hooks/useFaceMesh.ts` | Full rewrite to `FaceLandmarker` API |
| `src/components/try-on/FaceMeshCanvas.tsx` | Adapt to new result shape + blendshapes |
| `src/shared/lib/glasses-overlay.ts` | Add 3D matrix support |
| `src/components/try-on/LiveARTryOn.tsx` | Add smile-capture toggle + head pose UI |

### What Stays the Same
- All downstream components (ARFrameSelector, TryOnHistory, capture flow) — unchanged
- White background removal logic — unchanged
- The overall UX flow — unchanged, just better tracking

