import { useState, useCallback, useRef, useEffect } from "react";
import { SNAP_CONFIG, isCameraKitConfigured, type SnapLensConfig } from "@/config/snap-lenses";

interface CameraKitState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  currentLens: SnapLensConfig | null;
  availableLenses: SnapLensConfig[];
  isSupported: boolean;
  permissionStatus: "prompt" | "granted" | "denied" | "unknown";
}

interface UseCameraKitReturn extends CameraKitState {
  initialize: (canvasElement: HTMLCanvasElement) => Promise<boolean>;
  switchLens: (lensId: string) => Promise<void>;
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
 * Hook for managing Snapchat Camera Kit session lifecycle
 */
export const useCameraKit = (): UseCameraKitReturn => {
  const [state, setState] = useState<CameraKitState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    currentLens: null,
    availableLenses: SNAP_CONFIG.lenses,
    isSupported: true,
    permissionStatus: "unknown",
  });

  // Store references to SDK objects
  const cameraKitRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
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
   * Initialize Camera Kit with canvas element
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
        error: "Camera Kit not configured. Please add your Snap API Token and Lens IDs.",
        isLoading: false,
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Dynamically import Camera Kit to avoid issues if package not installed
      const { bootstrapCameraKit, createMediaStreamSource } = await import("@snap/camera-kit");

      // Bootstrap Camera Kit
      const cameraKit = await bootstrapCameraKit({
        apiToken: SNAP_CONFIG.apiToken,
        lensGroups: [SNAP_CONFIG.lensGroupId],
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

      // Create source from media stream (mirrored for front camera)
      const source = await createMediaStreamSource(mediaStream, {
        transform: { mirrorX: true },
        cameraType: "front",
      });

      // Set source and start rendering
      await session.setSource(source);
      session.setFPSLimit(30);
      await session.play("live");

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
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
   * Switch to a different lens
   */
  const switchLens = useCallback(async (lensId: string): Promise<void> => {
    const session = sessionRef.current;
    const cameraKit = cameraKitRef.current;

    if (!session || !cameraKit) {
      setState(prev => ({ ...prev, error: "Camera Kit not initialized" }));
      return;
    }

    const lensConfig = SNAP_CONFIG.lenses.find(l => l.id === lensId);
    if (!lensConfig || !lensConfig.snapLensId) {
      setState(prev => ({ ...prev, error: "Lens not found or not configured" }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Get lenses from repository
      const lensGroups = await cameraKit.lensRepository.getLensGroups();
      const lenses = lensGroups.flatMap((group: any) => group.lenses || []);
      
      // Find the matching lens
      const snapLens = lenses.find((l: any) => l.id === lensConfig.snapLensId);
      
      if (snapLens) {
        await session.applyLens(snapLens);
        setState(prev => ({
          ...prev,
          currentLens: lensConfig,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error("Lens not found in Snap repository");
      }
    } catch (error) {
      console.error("Failed to switch lens:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to switch lens",
      }));
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
      // Capture the current frame
      const blob = await session.capture();
      
      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
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
        currentLens: null,
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
    switchLens,
    captureFrame,
    cleanup,
    requestPermission,
  };
};

export type { CameraKitState, UseCameraKitReturn };
