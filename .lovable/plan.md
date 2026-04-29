
# Live AR Try-On — Hybrid MediaPipe + Snap Camera Kit Build Plan

## Why hybrid (the strategy)

We have two complementary engines already scaffolded in the repo:

- **MediaPipe FaceLandmarker** (`src/shared/hooks/useFaceMesh.ts`) — free, runs in-browser, gives us 478 landmarks, blendshapes (smile/blink), and a head transformation matrix. Perfect for: parametric 3D frames we render ourselves, smile-to-capture, fit/PD analytics, and a reliable fallback when Snap isn't loaded.
- **Snap Camera Kit + Lens Studio** (`src/shared/hooks/useCameraKit.ts`, `src/config/snap-lenses.ts`) — premium photoreal AR with proper occlusion, lighting, reflections, and per-SKU Lens Studio assets. Perfect for: hero/luxury frames where visual fidelity sells.

The hybrid contract: **one frame → one renderer**, chosen automatically per product based on what assets exist. The user never sees the plumbing — just "Try Live."

```text
Product selected
   │
   ├── Has snap_lens_id?  ──► Snap Camera Kit (photoreal lens)
   │
   ├── Has 3D measurements? ──► MediaPipe + ParametricGlasses3D (Three.js)
   │
   └── Has ar_overlay_url?  ──► MediaPipe + 2D overlay (current FaceMeshCanvas)
```

MediaPipe always runs underneath for analytics (smile capture, fit score, PD). Snap, when active, owns the visible render.

---

## What already exists (don't rebuild)

- `useFaceMesh` — landmarks, blendshapes, transformation matrix, grace frames, cleanup
- `FaceMeshCanvas` — 2D overlay + Three.js parametric path with `use3D` switch
- `ParametricGlasses3D` + `ThreeARScene` — head-tracked parametric frames
- `useCameraKit` — Camera Kit session lifecycle, lens switching, capture
- `CameraKitCanvas` — UI states (unsupported, denied, error, live)
- `ARLensSelector` — horizontal lens picker
- `snap-lenses.ts` — config schema with `apiToken`, `lensGroupId`, lens map
- `LiveARTryOn` — orchestrator (currently MediaPipe-only)
- `frame_attributes` table with `ar_overlay_url` and 3D measurement columns
- `segment-frame-image` and `enrich-frame-measurements` edge functions

## What's missing (this plan delivers)

1. A **renderer-routing layer** that picks Snap vs MediaPipe per product.
2. Real **Snap credentials** wired through Lovable Cloud secrets.
3. A **`snap_lens_id` column** on `frame_attributes` plus an admin tool to map products to Lens Studio lenses.
4. A **unified `LiveARStage` component** that swaps engines without remounting the camera.
5. **Lens Studio asset workflow** documentation and a starter template.
6. **PDP / Quick View entry points** and feature-flag rollout.

---

## Phase 1 — Snap account, secrets & SDK plumbing

Goal: get Camera Kit talking to a real Snap app from inside Lovable.

- User actions (you'll be guided in chat):
  1. Create a Camera Kit app at https://kit.snap.com
  2. Create a Lens Group, note the Group ID
  3. Generate a Web API Token
- Code/infra changes:
  - Migrate `snap-lenses.ts` to read from `import.meta.env.VITE_SNAP_CAMERA_KIT_TOKEN` and `VITE_SNAP_LENS_GROUP_ID` (already partially done) and add a small runtime config endpoint so we can swap groups without redeploys.
  - Add `@snap/camera-kit` to `package.json` (currently dynamically imported but not declared).
  - Confirm the Snap domain (`*.snapchat.com`, `*.snap.com`) is allowed in Vite/PWA `navigateFallbackDenylist` and CSP.
  - Add a `useCameraKit` health check that fails gracefully and falls back to MediaPipe.

Acceptance: visiting `/try-on` with `?engine=snap` shows the Snap LIVE feed with a starter lens applied, on desktop Chrome and iOS Safari 16+.

---

## Phase 2 — Database & admin: per-frame engine routing

Goal: each product knows which renderer to use.

- Migration on `frame_attributes`:
  - `snap_lens_id text null` — Lens Studio lens identifier
  - `snap_lens_group_id text null` — optional override
  - `ar_engine text not null default 'auto'` — enum-like: `auto | snap | parametric | overlay | none`
  - `ar_quality_tier smallint not null default 0` — 0 none, 1 overlay, 2 parametric, 3 snap
- Add a `getPreferredEngine(frameAttrs)` helper in `src/shared/lib/ar-image-utils.ts` implementing the routing tree above.
- Admin UI: extend the existing PDCA/admin product image manager with a "Live AR" tab where staff can:
  - Paste a Snap Lens ID and tier
  - Trigger `segment-frame-image` for an overlay
  - Trigger `enrich-frame-measurements` for parametric data
  - Preview the result inline

Acceptance: staff can flip a product from "overlay" → "snap" in 30 seconds and the storefront picks it up on next view.

---

## Phase 3 — Lens Studio asset pipeline

Goal: a repeatable way to ship per-frame photoreal lenses.

- Author a starter Lens Studio template (`docs/lens-studio/mh-frame-template.lsproj`-style instructions) that includes:
  - Face Mesh + Head Binding nodes
  - Material slots for `frame_color`, `frame_metalness`, `lens_tint`
  - Public attributes Snap exposes via `vendorData` so we can pass `productId`, `branchId`, `priceTier`
- Document a 3-step workflow in `docs/live-ar/lens-authoring.md`:
  1. Drop a frame GLB/FBX into the template
  2. Tweak material/scale, push to the M&H Lens Group
  3. Copy the new Lens ID into the admin Live AR tab
- Optional: an edge function `snap-lens-sync` that pulls the lens list from the Camera Kit Repository API nightly and reconciles `snap_lens_id` orphans.

Acceptance: a designer with no React knowledge can publish a new AR-ready frame end-to-end.

---

## Phase 4 — Unified `LiveARStage` component

Goal: replace the current MediaPipe-only `LiveARTryOn` body with a router.

- New `src/components/try-on/LiveARStage.tsx` that:
  - Always boots `useFaceMesh` (cheap, gives blendshapes + analytics)
  - Lazily boots `useCameraKit` only when the selected product resolves to `snap`
  - Mounts exactly one of: `<SnapLensCanvas/>`, `<ThreeARScene/>` (parametric), `<FaceMeshOverlay/>` (2D)
  - Shares one `<video>` element where possible to avoid double `getUserMedia` (Snap owns the canvas, MediaPipe reads frames from the same stream via `MediaStreamTrackProcessor` with a `<video>` fallback)
  - Exposes a single `onCapture` that grabs the visible canvas regardless of engine
- Update `LiveARTryOn` to render `LiveARStage` and keep the existing controls (smile capture, capture button, mode toggle).
- Engine indicator chip ("3D Try-On Active" / "Photoreal AR" / "AI Overlay") already exists — extend for Snap.

Acceptance: switching between a Snap-mapped frame and a parametric frame in the picker is seamless — no camera flicker, no permission re-prompt.

---

## Phase 5 — UX integration & entry points

Goal: surface Live AR everywhere a user is considering a frame.

- Add a "Try Live" button to:
  - PDP (`src/pages/ProductDetail.tsx`) next to "Add to Cart"
  - Quick View modal (`InlineTryOnModal.tsx`) as a third tab alongside Photo
  - Frame cards on `/shop` (icon-only on hover/long-press)
- Deep link: `/try-on?product=<id>&engine=live` opens directly into Live AR with that frame selected.
- Mobile: keep the current sticky compact stage behavior; ensure the camera respects `top-16` offset and pauses when the tab/page is hidden (`document.visibilitychange`).
- Capture flow: snapshot → save to `try_on_history` → existing share/cart/wishlist actions; no new commerce code needed.

Acceptance: from any frame card, the user is in Live AR with that frame on their face in ≤3 taps.

---

## Phase 6 — Performance, telemetry & rollout

Goal: ship safely.

- Lazy-load `@snap/camera-kit`, `three`, `@react-three/fiber`, and `@mediapipe/tasks-vision` via dynamic `import()` inside `LiveARStage` so the main bundle stays small.
- Dispose Three.js geometries/materials on unmount; reuse the Snap session across lens switches (already supported).
- Telemetry events (Meta Pixel + internal): `live_ar_opened`, `live_ar_engine_chosen` (snap/parametric/overlay), `live_ar_face_detected`, `live_ar_capture`, `live_ar_add_to_cart`.
- Feature flag `live_ar_enabled` in `app_settings` (default off in prod), staff-only first, then 10% → 100%.
- Add a `/live-ar-debug` route (admin-only via `RoleGuard`) showing FPS, current engine, landmark count, and Snap session state.

Acceptance: Lighthouse mobile perf on `/shop` unchanged; AR cold-start ≤3s on mid-range Android; no memory leak after 10 lens switches.

---

## Master checklist

```text
Phase 1 — Snap & SDK
[ ] Create Snap Camera Kit app + lens group (user)
[ ] Add VITE_SNAP_CAMERA_KIT_TOKEN + VITE_SNAP_LENS_GROUP_ID via secrets
[ ] Declare @snap/camera-kit in package.json
[ ] Allowlist Snap domains in PWA/CSP
[ ] Health check + graceful fallback in useCameraKit

Phase 2 — DB & admin
[ ] Migration: snap_lens_id, snap_lens_group_id, ar_engine, ar_quality_tier
[ ] getPreferredEngine() helper + unit tests
[ ] Admin "Live AR" tab on product manager
[ ] RLS: only branch_manager+ can edit AR fields

Phase 3 — Lens authoring
[ ] Lens Studio starter template + docs
[ ] Publish 3 pilot lenses (1 sunglass, 1 optical, 1 luxury)
[ ] Optional: snap-lens-sync edge function

Phase 4 — Unified stage
[ ] LiveARStage component with engine router
[ ] Shared MediaStream between MediaPipe + Snap
[ ] Engine indicator chip extended for Snap
[ ] Smile-to-capture works across all engines

Phase 5 — UX entry points
[ ] "Try Live" button on PDP, Quick View, shop cards
[ ] Deep link ?engine=live
[ ] Pause on tab hidden, sticky compact stage on mobile
[ ] Snapshot → try_on_history → share/cart

Phase 6 — Perf, telemetry, rollout
[ ] Dynamic imports for all heavy SDKs
[ ] Memory disposal verified (10× switch test)
[ ] Telemetry events wired
[ ] live_ar_enabled feature flag
[ ] /live-ar-debug admin route
[ ] Staff beta → 10% → 100%
```

---

## Decision needed before we start

I'd recommend kicking off with **Phase 1** so we can prove the Snap pipe end-to-end before spending time on schema and admin work. If you'd rather front-load the asset routing so existing parametric frames get cleaner UX immediately, we can start with Phase 2 + Phase 4 and treat Snap as an additive layer in Phase 3.

<lov-actions>
<lov-suggestion message="Start with Phase 1 — get Snap Camera Kit credentials wired and a starter lens running">Start Phase 1 (Snap plumbing)</lov-suggestion>
<lov-suggestion message="Start with Phase 2 + 4 — schema, engine router, and unified LiveARStage first; Snap comes later">Start with routing & unified stage</lov-suggestion>
<lov-suggestion message="Do Phase 3 first — set up the Lens Studio template and authoring docs so design can start producing assets in parallel">Start with Lens Studio pipeline</lov-suggestion>
</lov-actions>
