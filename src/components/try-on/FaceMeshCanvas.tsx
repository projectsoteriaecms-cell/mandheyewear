import { useRef, useEffect, useCallback, useState } from "react";
import { useFaceMesh, type FaceMeshResultData } from "@/shared/hooks/useFaceMesh";
import { computeGlassesTransform, drawGlassesOverlay, resetSmoothing } from "@/shared/lib/glasses-overlay";
import { detectWhiteBackground, removeWhiteBackground } from "@/shared/lib/ar-image-utils";
import { Loader2, VideoOff, AlertCircle, Radio, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaceMeshCanvasProps {
  frameImageUrl: string | null;
  arWarning?: string | null;
  onInitialized?: () => void;
  onError?: (error: string) => void;
  onSmileDetected?: () => void;
  className?: string;
}

export const FaceMeshCanvas = ({
  frameImageUrl,
  arWarning,
  onInitialized,
  onError,
  onSmileDetected,
  className,
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

  const { isReady, isLoading, error, videoRef, start, setOnResults, captureSnapshot } = useFaceMesh();

  // Load the frame overlay image when URL changes
  useEffect(() => {
    if (!frameImageUrl) {
      frameSourceRef.current = null;
      setImageLoaded(false);
      setHasWhiteBg(false);
      return;
    }

    if (prevFrameUrlRef.current !== frameImageUrl) {
      resetSmoothing();
      prevFrameUrlRef.current = frameImageUrl;
    }

    const img = new Image();
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
  }, [frameImageUrl]);

  // Drawing callback for each face landmarker result
  const handleResults = useCallback((result: FaceMeshResultData) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw mirrored video frame
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (result.landmarks && result.landmarks.length > 0) {
      setFaceDetected(true);

      // Mirror the landmark x-coordinates to match mirrored video
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

      // Smile detection
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

      // Head pose guidance from transformation matrix
      if (result.transformationMatrix && result.transformationMatrix.length >= 16) {
        const { extractPoseFromMatrix } = await import("@/shared/lib/glasses-overlay");
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
      setFaceDetected(false);
      setHeadPoseHint(null);
      resetSmoothing();
    }
  }, [videoRef, onSmileDetected]);

  // Wire up the drawing callback
  useEffect(() => {
    setOnResults(handleResults);
  }, [setOnResults, handleResults]);

  // Auto-start on mount, reset smoothing on unmount
  useEffect(() => {
    start();
    return () => {
      resetSmoothing();
      if (smileTimerRef.current !== null) {
        clearTimeout(smileTimerRef.current);
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

      <canvas
        ref={canvasRef}
        className="w-full aspect-[4/3] object-cover"
        data-ar-canvas="true"
      />

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

      {/* LIVE indicator */}
      {isReady && !error && (
        <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-white animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Head pose guidance */}
      {isReady && faceDetected && headPoseHint && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-accent/90 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-xs text-accent-foreground font-medium">{headPoseHint}</span>
        </div>
      )}

      {/* Frame loading */}
      {isReady && frameImageUrl && !imageLoaded && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Loading frame image…</span>
        </div>
      )}

      {/* White background removed notice */}
      {isReady && imageLoaded && hasWhiteBg && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-amber-500/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
          <ImageOff className="h-3.5 w-3.5 text-white" />
          <span className="text-xs text-white font-medium">Background auto-removed</span>
        </div>
      )}

      {/* AR warning */}
      {isReady && arWarning && !hasWhiteBg && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 max-w-[90%]">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{arWarning}</span>
        </div>
      )}
    </div>
  );
};
