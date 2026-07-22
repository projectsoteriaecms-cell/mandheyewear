/**
 * Unified try-on recording layer.
 *
 * There are three try-on entry points that historically shared no common
 * seam: the AI photo flow (/try-on), Live AR (Camera Kit / MediaPipe), and
 * the inline modal on product cards. Each produced a TryOnResult and then did
 * its own thing with it -- so nothing was logged, and history lived only in
 * React state until the next refresh.
 *
 * Everything now funnels through recordTryOn(). One call site per path, one
 * canonical shape, one place that decides what gets tracked and persisted.
 *
 * Two destinations, deliberately:
 *
 *   platform_events -- ALWAYS. The activity/funnel log. user_id is nullable
 *     there, so this works for logged-out visitors, and it already feeds the
 *     observability dashboard built in phase 2. This is the pathway that makes
 *     try-on visible.
 *
 *   ar_photo_tryons -- ONLY for authenticated photo try-ons. That table
 *     requires user_id, frame_id AND user_photo_url to all be NOT NULL, which
 *     Live AR structurally cannot satisfy: there is no uploaded photo, and in
 *     Camera Kit mode frames are switched inside the Lens so there is often no
 *     selected frame at all. Rather than loosen the constraints or write
 *     placeholder rows, live captures are logged to platform_events only and
 *     the richer per-generation columns (cost, timing, provider) stay
 *     meaningful for the flow they were designed for.
 */

import { supabase } from "@/integrations/supabase/client";
import { track } from "@/shared/lib/telemetry";
import { emit } from "@/shared/lib/events";

/** Which entry point produced this try-on. */
export type TryOnSource =
  | "photo_ai"
  | "live_ar_camerakit"
  | "live_ar_mediapipe"
  | "inline_modal";

export const isLiveSource = (source: TryOnSource): boolean =>
  source === "live_ar_camerakit" || source === "live_ar_mediapipe";

export interface TryOnRecord {
  source: TryOnSource;
  success: boolean;
  /** Absent for Camera Kit captures where the frame is chosen inside the Lens. */
  frameId?: string;
  frameName?: string;
  /** Photo flow only -- the source photo the composite was generated from. */
  userPhotoUrl?: string;
  /** Photo flow only -- the generated composite. */
  generatedImageUrl?: string;
  angle?: string;
  generationTimeMs?: number;
  usedFrameReference?: boolean;
  errorMessage?: string;
}

/**
 * Records one try-on attempt. Fire-and-forget: never throws, never blocks the
 * UI. A failed log must not break a try-on that otherwise worked.
 */
export const recordTryOn = async (record: TryOnRecord): Promise<void> => {
  const eventType = record.success ? "tryon.completed" : "tryon.failed";

  // 1. Activity log -- always, all sources, anonymous included.
  void track(eventType, {
    source: record.source,
    frameId: record.frameId ?? null,
    frameName: record.frameName ?? null,
    angle: record.angle ?? null,
    generationTimeMs: record.generationTimeMs ?? null,
    usedFrameReference: record.usedFrameReference ?? null,
    error: record.errorMessage ?? null,
  });

  // 2. Event bus -- lets other modules react without importing personalization.
  if (record.success) {
    emit("personalization.tryon_completed", {
      source: record.source,
      frameId: record.frameId,
      frameName: record.frameName,
    });
  }

  // 3. Rich persistence -- photo flow only, and only when signed in.
  //    Live AR is intentionally excluded (see file header).
  if (!record.success || isLiveSource(record.source)) return;
  if (!record.frameId || !record.userPhotoUrl) return;

  // The photo flow hands around data: URLs for freshly-uploaded photos, which
  // are megabytes of base64. Only persist real storage URLs -- a data URL here
  // would bloat the row for no lookup value. The attempt is still counted in
  // platform_events above either way.
  if (!/^https?:\/\//i.test(record.userPhotoUrl)) return;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return; // anonymous: platform_events already has it

    const { error } = await supabase.from("ar_photo_tryons").insert({
      user_id: userId,
      frame_id: record.frameId,
      user_photo_url: record.userPhotoUrl,
      user_photo_uploaded_at: new Date().toISOString(),
      photo_angle: record.angle ?? "front",
      face_detected: true,
      generated_image_url: record.generatedImageUrl ?? null,
      generation_provider: record.source === "inline_modal" ? "gemini_inline" : "gemini",
      generation_time_ms: record.generationTimeMs ?? null,
      gemini_used_frame_reference: record.usedFrameReference ?? null,
    });

    if (error) {
      // Best-effort: surface for debugging, but the try-on itself succeeded.
      console.error("[tryOnRecorder] failed to persist try-on:", error.message);
    }
  } catch (err) {
    console.error("[tryOnRecorder] unexpected persistence error:", err);
  }
};

/** Records that a user opened a try-on surface, for funnel drop-off analysis. */
export const recordTryOnStarted = (source: TryOnSource, frameId?: string): void => {
  void track("tryon.started", { source, frameId: frameId ?? null });
};
