import { useState, useCallback, useRef, useEffect } from "react";
import { SNAP_CONFIG, isCameraKitConfigured } from "@/config/snap-lenses";
import type { CameraKit, CameraKitSession } from "@snap/camera-kit";

interface CameraKitState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  /** True once the carousel Lens is applied and rendering. */
  isLensApplied: boolean;
  isSupported: boolean;
  permissionStatus: "prompt" | "granted" | "denied" | "unknown";
}

interface UseCameraKitReturn extends CameraKitState {
  initialize: (canvasElement: HTMLCanvasElement, frameIndex?: number | null) => Promise<boolean>;
  captureFrame: () => Promise<string | null>;
  cleanup: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  /** Switch the Lens to another carousel slot without tearing down the camera. */
  showFrame: (frameIndex: number) => Promise<boolean>;
}

/**
 * Check browser support for Camera Kit requirements
 */
const checkBrowserSupport = (): { supported: boolean; reason?: string } => {
  // Check for getUserMedia support
  if (!navigator.mediaDevices?.getUserMedia) {
    return { supported: false, reason: "Camera access not supported in this browser" };
  }

  // Check for WebGL2 support (required by Camera Kit)
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    return { supported: false, reason: "WebGL2 not supported in this browser" };
  }

  return { supported: true };
};

/**
 * Hook for managing the Snapchat Camera Kit session lifecycle.
 *
 * Applies the single published carousel Lens (all frame models live inside it;
 * users switch frames via the Lens's own carousel UI on the camera feed).
 */
export const useCameraKit = (): UseCameraKitReturn => {
  const [state, setState] = useState<CameraKitState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    isLensApplied: false,
    isSupported: true,
    permissionStatus: "unknown",
  });

  // Store references to SDK objects
  const cameraKitRef = useRef<CameraKit | null>(null);
  const sessionRef = useRef<CameraKitSession | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // Kept so showFrame() can re-apply the same Lens with different launch params
  // instead of re-downloading it.
  const lensRef = useRef<Awaited<ReturnType<CameraKit["lensRepository"]["loadLens"]>> | null>(null);

  // Check browser support on mount
  useEffect(() => {
    const support = checkBrowserSupport();
    if (!support.supported) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: support.reason || "Browser not supported",
      }));
    }
  }, []);

  /**
   * Request camera permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());

      setState(prev => ({ ...prev, permissionStatus: "granted" }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Permission denied";
      setState(prev => ({
        ...prev,
        permissionStatus: "denied",
        error: `Camera access denied: ${errorMessage}`,
      }));
      return false;
    }
  }, []);

  /**
   * Initialize Camera Kit with canvas element and apply the carousel Lens
   */
  const initialize = useCallback(async (
    canvasElement: HTMLCanvasElement,
    frameIndex?: number | null,
  ): Promise<boolean> => {
    // Check if already initialized
    if (state.isInitialized) {
      return true;
    }

    // Check browser support
    const support = checkBrowserSupport();
    if (!support.supported) {
      setState(prev => ({
        ...prev,
        error: support.reason || "Browser not supported",
        isSupported: false,
      }));
      return false;
    }

    // Check if Camera Kit is configured
    if (!isCameraKitConfigured()) {
      setState(prev => ({
        ...prev,
        error: "Camera Kit not configured. Please add your Snap API Token and Lens Group ID.",
        isLoading: false,
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fire the camera permission prompt immediately, in parallel with the
      // SDK import/bootstrap below. It doesn't depend on Camera Kit at all,
      // and the prompt's user-reaction time is often the single slowest step
      // in this whole flow -- it shouldn't sit behind a network round-trip
      // to Snap's servers first.
      const mediaStreamPromise = navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Dynamically import Camera Kit to avoid issues if package not installed
      const { bootstrapCameraKit, createMediaStreamSource, Transform2D } = await import("@snap/camera-kit");

      // Bootstrap Camera Kit
      const cameraKit = await bootstrapCameraKit({
        apiToken: SNAP_CONFIG.apiToken,
      });

      cameraKitRef.current = cameraKit;

      // Create session with live render target
      const session = await cameraKit.createSession({
        liveRenderTarget: canvasElement,
      });

      sessionRef.current = session;

      // The Lens bundle (3D frame models/textures) is the largest network
      // fetch in this whole flow. It only depends on `cameraKit`, not on the
      // media stream or session source -- start it now so it downloads in
      // the background while we wait on camera permission below, instead of
      // waiting until after the camera is fully set up to even begin.
      const lensPromise = cameraKit.lensRepository.loadLens(
        SNAP_CONFIG.carouselLensId,
        SNAP_CONFIG.lensGroupId
      );

      // Await the camera stream (the prompt has been showing since the top
      // of this function). Permission failures are detected by error name so
      // the UI can show the dedicated "Camera Access Required" screen instead
      // of a generic error — a blocked camera can only be re-enabled by the
      // user via browser settings, so they need instructions, not a retry.
      let mediaStream: MediaStream;
      try {
        mediaStream = await mediaStreamPromise;
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        const isPermissionError =
          name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError";

        // Free the session created above so a later retry starts clean
        await sessionRef.current?.destroy().catch(() => undefined);
        sessionRef.current = null;
        cameraKitRef.current = null;
        lensRef.current = null;

        setState(prev => ({
          ...prev,
          isLoading: false,
          permissionStatus: isPermissionError ? "denied" : prev.permissionStatus,
          error: isPermissionError
            ? "Camera access is blocked for this site"
            : name === "NotFoundError"
              ? "No camera was found on this device"
              : err instanceof Error
                ? err.message
                : "Could not access the camera",
        }));
        return false;
      }

      mediaStreamRef.current = mediaStream;

      // Create source from media stream. cameraType "user" = front-facing;
      // Transform2D.MirrorX flips it so the preview matches a mirror (Camera Kit
      // requires the Transform2D class, not a plain { mirrorX: true } object).
      const source = createMediaStreamSource(mediaStream, {
        transform: Transform2D.MirrorX,
        cameraType: "user",
      });

      // Set source and start rendering
      await session.setSource(source);
      await session.setFPSLimit(30);
      await session.play("live");

      // Pick up the Lens fetch that's been running in the background since
      // before we even awaited the camera stream above -- this resolves
      // immediately if the download already finished, instead of starting a
      // fresh wait now.
      const lens = await lensPromise;
      lensRef.current = lens;

      // `frameIndex` opens the Lens directly on one carousel slot, which is what
      // makes a per-product "Try in AR" button work. Omitting it leaves the Lens
      // on its own first frame, with the user swiping to choose — the behaviour
      // when we don't know which product they came from.
      //
      // NOTE: applyLens has an overload — (lens) alone resolves to Promise<void>,
      // shadowing the documented (lens, launchData?) => Promise<boolean> overload.
      // Pass launchData explicitly (even as undefined) to get the boolean result.
      const applied = await session.applyLens(
        lens,
        typeof frameIndex === "number" ? { launchParams: { frameIndex } } : undefined,
      );
      if (!applied) {
        throw new Error("Lens could not be applied to the session");
      }

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        isLensApplied: true,
        permissionStatus: "granted",
        error: null,
      }));

      return true;
    } catch (error) {
      console.error("Camera Kit initialization failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize Camera Kit";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return false;
    }
  }, [state.isInitialized]);

  /**
   * Re-applies the already-downloaded Lens with a different `frameIndex`, so the
   * user can jump between products without the camera restarting. Falls back to
   * doing nothing (returning false) if the session isn't live yet — callers
   * should pass the index to initialize() in that case instead.
   */
  const showFrame = useCallback(async (frameIndex: number): Promise<boolean> => {
    const session = sessionRef.current;
    const lens = lensRef.current;
    if (!session || !lens) return false;

    try {
      const applied = await session.applyLens(lens, { launchParams: { frameIndex } });
      if (!applied) {
        console.warn(`Camera Kit: could not switch to frame ${frameIndex}`);
      }
      return applied;
    } catch (error) {
      console.error("Failed to switch AR frame:", error);
      return false;
    }
  }, []);

  /**
   * Capture current frame as base64 image
   */
  const captureFrame = useCallback(async (): Promise<string | null> => {
    const session = sessionRef.current;

    if (!session) {
      setState(prev => ({ ...prev, error: "Camera Kit not initialized" }));
      return null;
    }

    try {
      // CameraKitSession has no capture() method; the SDK instead exposes two
      // canvases via session.output — "capture" is the one designed for saving/
      // sharing (as opposed to "live", which may include lens-only UI chrome).
      return session.output.capture.toDataURL("image/png");
    } catch (error) {
      console.error("Failed to capture frame:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to capture frame",
      }));
      return null;
    }
  }, []);

  /**
   * Cleanup Camera Kit resources
   */
  const cleanup = useCallback(async (): Promise<void> => {
    try {
      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      // Destroy session
      if (sessionRef.current) {
        await sessionRef.current.destroy();
        sessionRef.current = null;
      }

      cameraKitRef.current = null;
      lensRef.current = null;

      setState(prev => ({
        ...prev,
        isInitialized: false,
        isLensApplied: false,
        error: null,
      }));
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    initialize,
    captureFrame,
    cleanup,
    requestPermission,
    showFrame,
  };
};

export type { CameraKitState, UseCameraKitReturn };
