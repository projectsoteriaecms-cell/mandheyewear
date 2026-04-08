import { useRef, useEffect, useCallback, useState } from "react";
import { useFaceMesh, type FaceMeshResultData } from "@/shared/hooks/useFaceMesh";
import { computeGlassesTransform, drawGlassesOverlay, resetSmoothing, extractPoseFromMatrix } from "@/shared/lib/glasses-overlay";
import { detectWhiteBackground, removeWhiteBackground } from "@/shared/lib/ar-image-utils";
import { Loader2, VideoOff, AlertCircle, Radio, ImageOff, Box, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreeARScene } from "./ThreeARScene";
import type { FrameAttributes } from "@/shared/hooks/useFrameAttributes";

interface FaceMeshCanvasProps {
  frameImageUrl: string | null;
  arWarning?: string | null;
  onInitialized?: () => void;
  onError?: (error: string) => void;
  onSmileDetected?: () => void;
  className?: string;
  /** When provided with valid measurements, renders 3D parametric frame */
  frameAttributes?: FrameAttributes | null;
  /** Whether to use 3D mode */
  use3D?: boolean;
  /** Frame color for 3D rendering */
  frameColor?: string;
}

export const FaceMeshCanvas = ({
  frameImageUrl,
  arWarning,
  onInitialized,
  onError,
  onSmileDetected,
  className,
  frameAttributes,
  use3D = false,
  frameColor = "#2d2d2d",
}: FaceMeshCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameSourceRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const frameAspectRef = useRef(0.45);
  const [faceDetected, setFaceDetected] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasWhiteBg, setHasWhiteBg] = useState(false);
  const [headPoseHint, setHeadPoseHint] = useState<string | null>(null);
  const prevFrameUrlRef = useRef<string | null>(null);
  const smileTimerRef = useRef<number | null>(null);

  // 3D mode state
  const [currentLandmarks, setCurrentLandmarks] = useState<{ x: number; y: number; z: number }[] | null>(null);
  const [currentMatrix, setCurrentMatrix] = useState<number[] | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const faceDetectedTimerRef = useRef<number | null>(null);
  const lastValidLandmarksRef = useRef<{ x: number; y: number; z: number }[] | null>(null);
  const lastValidMatrixRef = useRef<number[] | null>(null);

  const { isReady, isLoading, error, videoRef, start, setOnResults, captureSnapshot } = useFaceMesh();

  // Load the frame overlay image when URL changes (2D mode only)
  useEffect(() => {
    if (use3D || !frameImageUrl) {
      frameSourceRef.current = null;
      setImageLoaded(false);
      setHasWhiteBg(false);
      return;
    }

    if (prevFrameUrlRef.current !== frameImageUrl) {
      resetSmoothing();
      prevFrameUrlRef.current = frameImageUrl;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      frameAspectRef.current = img.naturalHeight / img.naturalWidth || 0.45;
      const whiteDetected = detectWhiteBackground(img);
      setHasWhiteBg(whiteDetected);

      if (whiteDetected) {
        const processed = removeWhiteBackground(img);
        frameSourceRef.current = processed;
      } else {
        frameSourceRef.current = img;
      }
      setImageLoaded(true);
    };
    img.onerror = () => {
      frameSourceRef.current = null;
      setImageLoaded(false);
    };
    img.src = frameImageUrl;
  }, [frameImageUrl, use3D]);

  // Drawing callback for each face landmarker result
  const handleResults = useCallback((result: FaceMeshResultData) => {
    const video = videoRef.current;
    if (!video) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    if (use3D) {
      // In 3D mode, we just pass landmarks to the Three.js scene
      // and draw the video on a 2D canvas for snapshot capture
      setVideoDimensions({ width: vw, height: vh });

      if (result.landmarks && result.landmarks.length > 0) {
        // Clear any pending "no face" timer
        if (faceDetectedTimerRef.current !== null) {
          clearTimeout(faceDetectedTimerRef.current);
          faceDetectedTimerRef.current = null;
        }
        setFaceDetected(true);
        const mirrored = result.landmarks.map(lm => ({
          x: 1 - lm.x,
          y: lm.y,
          z: lm.z,
        }));
        setCurrentLandmarks(mirrored);
        setCurrentMatrix(result.transformationMatrix);
        lastValidLandmarksRef.current = mirrored;
        lastValidMatrixRef.current = result.transformationMatrix;
      } else {
        // Debounce: only set faceDetected=false after 300ms of continuous misses
        if (faceDetectedTimerRef.current === null) {
          faceDetectedTimerRef.current = window.setTimeout(() => {
            setFaceDetected(false);
            setCurrentLandmarks(null);
            setCurrentMatrix(null);
            lastValidLandmarksRef.current = null;
            lastValidMatrixRef.current = null;
            faceDetectedTimerRef.current = null;
          }, 300);
        }
        // Keep last valid landmarks active during debounce window
      }

      // Still draw to 2D canvas for snapshot capture (video only)
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = vw;
        canvas.height = vh;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.translate(vw, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, vw, vh);
          ctx.restore();
        }
      }
    } else {
      // 2D mode (original behavior)
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = vw;
      canvas.height = vh;

      // Draw mirrored video frame
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (result.landmarks && result.landmarks.length > 0) {
        if (faceDetectedTimerRef.current !== null) {
          clearTimeout(faceDetectedTimerRef.current);
          faceDetectedTimerRef.current = null;
        }
        setFaceDetected(true);

        const mirroredLandmarks = result.landmarks.map((lm) => ({
          x: 1 - lm.x,
          y: lm.y,
          z: lm.z,
        }));

        if (frameSourceRef.current) {
          const transform = computeGlassesTransform(
            mirroredLandmarks,
            canvas.width,
            canvas.height,
            frameAspectRef.current,
            result.transformationMatrix
          );
          if (transform) {
            drawGlassesOverlay(ctx, frameSourceRef.current, transform, { mirrorFlip: true });
          }
        }
      } else {
        if (faceDetectedTimerRef.current === null) {
          faceDetectedTimerRef.current = window.setTimeout(() => {
            setFaceDetected(false);
            resetSmoothing();
            faceDetectedTimerRef.current = null;
          }, 300);
        }
      }
    }

    // Smile detection (shared between modes)
    if (result.landmarks && result.landmarks.length > 0) {
      if (result.blendshapes && onSmileDetected) {
        const smileL = result.blendshapes.find((b) => b.categoryName === "mouthSmileLeft")?.score ?? 0;
        const smileR = result.blendshapes.find((b) => b.categoryName === "mouthSmileRight")?.score ?? 0;
        const avgSmile = (smileL + smileR) / 2;

        if (avgSmile > 0.6) {
          if (smileTimerRef.current === null) {
            smileTimerRef.current = window.setTimeout(() => {
              onSmileDetected();
              smileTimerRef.current = null;
            }, 500);
          }
        } else {
          if (smileTimerRef.current !== null) {
            clearTimeout(smileTimerRef.current);
            smileTimerRef.current = null;
          }
        }
      }

      // Head pose guidance
      if (result.transformationMatrix && result.transformationMatrix.length >= 16) {
        const pose = extractPoseFromMatrix(result.transformationMatrix);
        if (pose) {
          const yawDeg = (pose.yaw * 180) / Math.PI;
          if (yawDeg > 20) {
            setHeadPoseHint("Turn right to see side view →");
          } else if (yawDeg < -20) {
            setHeadPoseHint("← Turn left to see side view");
          } else {
            setHeadPoseHint(null);
          }
        }
      } else {
        setHeadPoseHint(null);
      }
    } else {
      setHeadPoseHint(null);
    }
  }, [videoRef, onSmileDetected, use3D]);

  // Wire up the drawing callback
  useEffect(() => {
    setOnResults(handleResults);
  }, [setOnResults, handleResults]);

  // Auto-start on mount
  useEffect(() => {
    start();
    return () => {
      resetSmoothing();
      if (smileTimerRef.current !== null) {
        clearTimeout(smileTimerRef.current);
      }
      if (faceDetectedTimerRef.current !== null) {
        clearTimeout(faceDetectedTimerRef.current);
      }
    };
  }, [start]);

  // Notify parent
  useEffect(() => {
    if (isReady) onInitialized?.();
  }, [isReady, onInitialized]);

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  // Expose canvas ref for snapshot capture
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      (canvas as any).__captureSnapshot = () => captureSnapshot(canvas);
    }
  }, [captureSnapshot]);

  return (
    <div className={cn("relative bg-muted rounded-lg overflow-hidden", className)}>
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* 2D canvas (always present for snapshot capture) */}
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full aspect-[4/3] object-cover",
          use3D && "hidden" // Hide when 3D mode is active
        )}
        data-ar-canvas="true"
      />

      {/* 3D Three.js scene overlay */}
      {use3D && isReady && (
        <div className="w-full aspect-[4/3] relative" data-ar-canvas="true">
          <ThreeARScene
            videoRef={videoRef}
            landmarks={currentLandmarks}
            transformationMatrix={currentMatrix}
            frameAttributes={frameAttributes || null}
            frameColor={frameColor}
            canvasWidth={videoDimensions.width}
            canvasHeight={videoDimensions.height}
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading face detection model…</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 gap-3 p-6 text-center">
          <VideoOff className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* No face detected indicator */}
      {isReady && !faceDetected && !error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-muted-foreground">No face detected — look at the camera</span>
        </div>
      )}

      {/* LIVE indicator + 3D/2D badge */}
      {isReady && !error && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {use3D && (
            <div className="bg-accent/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
              <Box className="h-3 w-3 text-accent-foreground" />
              <span className="text-[10px] font-bold text-accent-foreground uppercase tracking-wider">3D</span>
            </div>
          )}
          {!use3D && frameImageUrl && (
            <div className="bg-muted/80 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
              <Image className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">2D</span>
            </div>
          )}
          <div className="bg-red-600/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-white animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
          </div>
        </div>
      )}

      {/* Head pose guidance */}
      {isReady && faceDetected && headPoseHint && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-accent/90 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-xs text-accent-foreground font-medium">{headPoseHint}</span>
        </div>
      )}

      {/* Frame loading (2D only) */}
      {isReady && !use3D && frameImageUrl && !imageLoaded && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Loading frame image…</span>
        </div>
      )}

      {/* White background removed notice (2D only) */}
      {isReady && !use3D && imageLoaded && hasWhiteBg && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-amber-500/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
          <ImageOff className="h-3.5 w-3.5 text-white" />
          <span className="text-xs text-white font-medium">Background auto-removed</span>
        </div>
      )}

      {/* AR warning (2D only) */}
      {isReady && !use3D && arWarning && !hasWhiteBg && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 max-w-[90%]">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{arWarning}</span>
        </div>
      )}
    </div>
  );
};
