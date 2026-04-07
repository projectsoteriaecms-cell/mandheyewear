import { useState, useRef, useCallback, useEffect } from "react";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

export interface FaceLandmarks {
  landmarks: { x: number; y: number; z: number }[];
}

export const useFaceMesh = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceData, setFaceData] = useState<FaceLandmarks | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const onResultsCallbackRef = useRef<((results: Results) => void) | null>(null);
  const isInitializingRef = useRef(false);

  const setOnResults = useCallback((cb: (results: Results) => void) => {
    onResultsCallbackRef.current = cb;
  }, []);

  const safeCleanup = useCallback(() => {
    try {
      cameraRef.current?.stop();
    } catch (_) { /* ignore */ }
    cameraRef.current = null;

    try {
      faceMeshRef.current?.close();
    } catch (_) { /* ignore - WASM instance may already be deleted */ }
    faceMeshRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (isInitializingRef.current || faceMeshRef.current) return;
    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported on this device/browser");
      }

      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: Results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          setFaceData({ landmarks: results.multiFaceLandmarks[0] as { x: number; y: number; z: number }[] });
        } else {
          setFaceData(null);
        }
        onResultsCallbackRef.current?.(results);
      });

      faceMeshRef.current = faceMesh;

      const video = videoRef.current;
      if (!video) throw new Error("Video element not mounted");

      const camera = new Camera(video, {
        onFrame: async () => {
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: video });
          }
        },
        width: 640,
        height: 480,
      });

      cameraRef.current = camera;
      await camera.start();

      setIsReady(true);
    } catch (err: any) {
      console.error("FaceMesh init error:", err);
      safeCleanup();
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError(err.message || "Failed to start face detection");
      }
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, [safeCleanup]);

  const stop = useCallback(() => {
    safeCleanup();
    isInitializingRef.current = false;
    setIsReady(false);
    setFaceData(null);
  }, [safeCleanup]);

  const captureSnapshot = useCallback((canvas: HTMLCanvasElement | null): string | null => {
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      safeCleanup();
      isInitializingRef.current = false;
    };
  }, [safeCleanup]);

  return {
    isReady,
    isLoading,
    error,
    faceData,
    videoRef,
    start,
    stop,
    setOnResults,
    captureSnapshot,
  };
};
