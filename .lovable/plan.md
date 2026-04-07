
## Improve Stability & Temple Width Positioning

### Current issues
- **Stability**: `SMOOTH_FACTOR = 0.15` and `MAX_POSITION_DELTA = 0.05` may still allow too much jitter. The angle is also not being velocity-damped, causing rotational flicker.
- **Temple width**: `TEMPLE_PADDING = 1.35` on ear-to-ear distance may not be wide enough — real glasses temples extend slightly past the ears.

### Changes — single file: `src/shared/lib/glasses-overlay.ts`

1. **Lower smoothing factor** — `0.15 → 0.08` for much heavier smoothing (less reactive to noise)
2. **Tighten position damping** — `MAX_POSITION_DELTA: 0.05 → 0.03` to restrict per-frame jumps further
3. **Tighten size damping** — `MAX_SIZE_DELTA: 0.08 → 0.04`
4. **Smooth the angle too** — apply velocity damping to the angle (currently passed through raw), clamping to `0.02` radians per frame
5. **Widen temple padding** — `1.35 → 1.55` so the frame arms extend past the face edges to sit on the ears properly
6. **Multi-frame warmup** — skip the first 3 frames (use a frame counter) before showing the overlay, so initial jitter from the EMA cold-start is hidden

These are all constant tweaks and a small logic addition in the same file. No other files change.
