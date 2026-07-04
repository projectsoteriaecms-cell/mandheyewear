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
  initialize: (canvasElement: HTMLCanvasElement) => Promise<boolean>;
  captureFrame: () => Promise<string | null>;
  cleanup: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
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
  const initialize = useCallback(async (canvasElement: HTMLCanvasElement): Promise<boolean> => {
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

      // Get camera stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

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

      // Apply the carousel Lens (contains all frame models)
      const lens = await cameraKit.lensRepository.loadLens(
        SNAP_CONFIG.carouselLensId,
        SNAP_CONFIG.lensGroupId
      );
      // NOTE: applyLens has an overload — (lens) alone resolves to Promise<void>,
      // shadowing the documented (lens, launchData?) => Promise<boolean> overload.
      // Pass launchData explicitly (even as undefined) to get the boolean result.
      const applied = await session.applyLens(lens, undefined);
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
  };
};

export type { CameraKitState, UseCameraKitReturn };
