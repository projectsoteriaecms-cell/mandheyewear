import { useRef, useEffect, useCallback, useState } from "react";
import { Results } from "@mediapipe/face_mesh";
import { useFaceMesh } from "@/shared/hooks/useFaceMesh";
import { computeGlassesTransform, drawGlassesOverlay } from "@/shared/lib/glasses-overlay";
import { Loader2, VideoOff, AlertCircle, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaceMeshCanvasProps {
  frameImageUrl: string | null;
  onInitialized?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const FaceMeshCanvas = ({
  frameImageUrl,
  onInitialized,
  onError,
  className,
}: FaceMeshCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameImageRef = useRef<HTMLImageElement | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isReady, isLoading, error, videoRef, start, setOnResults, captureSnapshot } = useFaceMesh();

  // Load the frame overlay image when URL changes
  useEffect(() => {
    if (!frameImageUrl) {
      frameImageRef.current = null;
      setImageLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      frameImageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      frameImageRef.current = null;
      setImageLoaded(false);
    };
    img.src = frameImageUrl;
  }, [frameImageUrl]);

  // Drawing callback for each face mesh result
  const handleResults = useCallback((results: Results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw mirrored video frame
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw glasses overlay if face detected and frame image loaded
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0] as { x: number; y: number; z: number }[];
      
      // Mirror the landmark x-coordinates to match mirrored video
      const mirroredLandmarks = landmarks.map((lm) => ({
        x: 1 - lm.x,
        y: lm.y,
        z: lm.z,
      }));

      if (frameImageRef.current) {
        const transform = computeGlassesTransform(mirroredLandmarks, canvas.width, canvas.height);
        if (transform) {
          drawGlassesOverlay(ctx, frameImageRef.current, transform);
        }
      }
    } else {
      setFaceDetected(false);
    }
  }, [videoRef]);

  // Wire up the drawing callback
  useEffect(() => {
    setOnResults(handleResults);
  }, [setOnResults, handleResults]);

  // Auto-start on mount
  useEffect(() => {
    start();
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
      {/* Hidden video element for webcam feed */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      {/* Visible canvas */}
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
          <span className="text-xs text-muted-foreground">No face detected</span>
        </div>
      )}

      {/* LIVE indicator */}
      {isReady && !error && (
        <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-white animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Frame overlay status */}
      {isReady && frameImageUrl && !imageLoaded && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Loading frame image…</span>
        </div>
      )}
    </div>
  );
};
