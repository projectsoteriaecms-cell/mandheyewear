import { useState, useRef, useCallback, useEffect } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export interface FaceLandmarks {
  landmarks: { x: number; y: number; z: number }[];
}

export interface BlendshapeEntry {
  categoryName: string;
  score: number;
}

export interface FaceMeshResultData {
  landmarks: NormalizedLandmark[];
  blendshapes: BlendshapeEntry[] | null;
  transformationMatrix: number[] | null;
}

export const useFaceMesh = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceData, setFaceData] = useState<FaceLandmarks | null>(null);
  const [blendshapes, setBlendshapes] = useState<BlendshapeEntry[] | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isInitializingRef = useRef(false);
  const onResultsCallbackRef = useRef<((result: FaceMeshResultData) => void) | null>(null);

  const setOnResults = useCallback((cb: (result: FaceMeshResultData) => void) => {
    onResultsCallbackRef.current = cb;
  }, []);

  const safeCleanup = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      faceLandmarkerRef.current?.close();
    } catch (_) { /* WASM instance may already be deleted */ }
    faceLandmarkerRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (isInitializingRef.current || faceLandmarkerRef.current) return;
    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported on this device/browser");
      }

      // Load WASM fileset
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Create FaceLandmarker with blendshapes & transformation matrix
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });

      faceLandmarkerRef.current = faceLandmarker;

      // Get camera stream
      const video = videoRef.current;
      if (!video) throw new Error("Video element not mounted");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      setIsReady(true);

      // Start the detection loop
      let lastTimestamp = -1;
      const detect = () => {
        if (!faceLandmarkerRef.current || !video || video.paused || video.ended) {
          rafIdRef.current = requestAnimationFrame(detect);
          return;
        }

        const now = performance.now();
        if (now === lastTimestamp) {
          rafIdRef.current = requestAnimationFrame(detect);
          return;
        }
        lastTimestamp = now;

        const result: FaceLandmarkerResult = faceLandmarkerRef.current.detectForVideo(video, now);

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const lm = result.faceLandmarks[0];
          setFaceData({ landmarks: lm as { x: number; y: number; z: number }[] });

          const bs = result.faceBlendshapes?.[0]?.categories ?? null;
          setBlendshapes(bs as BlendshapeEntry[] | null);

          const rawData = result.facialTransformationMatrixes?.[0]?.data;
          const mat = rawData
            ? Array.from(rawData as unknown as ArrayLike<number>)
            : null;

          onResultsCallbackRef.current?.({
            landmarks: lm,
            blendshapes: bs as BlendshapeEntry[] | null,
            transformationMatrix: mat,
          });
        } else {
          setFaceData(null);
          setBlendshapes(null);
          onResultsCallbackRef.current?.({
            landmarks: [],
            blendshapes: null,
            transformationMatrix: null,
          });
        }

        rafIdRef.current = requestAnimationFrame(detect);
      };

      rafIdRef.current = requestAnimationFrame(detect);
    } catch (err: any) {
      console.error("FaceLandmarker init error:", err);
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
    setBlendshapes(null);
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
    blendshapes,
    videoRef,
    start,
    stop,
    setOnResults,
    captureSnapshot,
  };
};
