# Phase 1 Completion — Snap Camera Kit Credentials Wiring

## What you've provided
- **Lens Group ID**: `b7de1fc9-f3d3-4fbb-9a69-8227e9f70317` ✓

## What's still needed from you
- **Camera Kit Web API Token** — found at https://kit.snap.com → your app → **Camera Kit** → **API Tokens** tab. Copy the **Staging** (or **Production**) token. It's a long string starting with `eyJ...`.

## Steps once you paste the API token

1. **Add two frontend env vars** to the project (these are public/client-safe by Snap's design):
   - `VITE_SNAP_CAMERA_KIT_TOKEN` = `<the eyJ... token you paste>`
   - `VITE_SNAP_LENS_GROUP_ID` = `b7de1fc9-f3d3-4fbb-9a69-8227e9f70317`

   I'll prompt you with the secrets dialog — paste both values there.

2. **Verify config wiring** in `src/config/snap-lenses.ts` — already reads from `import.meta.env.VITE_SNAP_CAMERA_KIT_TOKEN` and `VITE_SNAP_LENS_GROUP_ID`, so no code change needed for the env plumbing.

3. **Health-check on `/try-on`**:
   - `isCameraKitConfigured()` will flip from `false` → `true` once both vars are present.
   - The "Running in MediaPipe mode" banner in `LiveARTryOn.tsx` will disappear.
   - `useCameraKit` will dynamically import `@snap/camera-kit`, bootstrap with your token, fetch the lens group, and render Snap's default group lens (or whatever lens you've already added to the group) into the canvas.

4. **Manual smoke test** (you do this in preview):
   - Navigate to `/try-on` → switch to Live AR mode.
   - Grant camera permission.
   - You should see the Snap-rendered camera feed in the canvas. If the lens group is empty, the feed renders without effects — that's expected and confirms the SDK pipe is alive.

5. **If the lens group is empty**, I'll add a tiny "No lenses in group yet" hint in the AR Lens Selector so it's obvious the pipe works but content is pending Phase 3 (Lens Studio authoring).

## Acceptance criteria for Phase 1 done
- `/try-on` Live AR mode initializes without the "MediaPipe mode" fallback banner.
- Browser console shows no Camera Kit init errors.
- Camera feed renders through the Snap canvas.
- Phase 2 (DB schema for `snap_lens_id` + per-product `ar_engine` routing) can begin immediately after.

## Technical notes
- No backend changes in this step — Camera Kit Web tokens are designed for browser use.
- Token is read at build time by Vite, so a redeploy/preview rebuild happens automatically when secrets change.
- `@snap/camera-kit` is already in `package.json`; no install needed.

## Next action
Reply with the **API Token** (or say "ready") and I'll trigger the secrets prompt for both `VITE_SNAP_CAMERA_KIT_TOKEN` and `VITE_SNAP_LENS_GROUP_ID` in one go.
