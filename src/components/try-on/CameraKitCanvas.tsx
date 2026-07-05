import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Camera, AlertCircle, RefreshCw, MonitorX } from "lucide-react";
import { useCameraKit } from "@/shared/hooks/useCameraKit";

interface CameraKitCanvasProps {
  onInitialized?: () => void;
  onError?: (error: string) => void;
  /** Called once the session is live, with a function that captures the current frame as a base64 data URL. */
  onCaptureReady?: (capture: () => Promise<string | null>) => void;
  className?: string;
}

export const CameraKitCanvas = ({
  onInitialized,
  onError,
  onCaptureReady,
  className = "",
}: CameraKitCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initAttempted, setInitAttempted] = useState(false);

  const {
    isInitialized,
    isLoading,
    error,
    isSupported,
    permissionStatus,
    initialize,
    captureFrame,
    requestPermission,
  } = useCameraKit();

  // Initialize when canvas is available
  useEffect(() => {
    const initCamera = async () => {
      if (!canvasRef.current || initAttempted || isInitialized) return;

      setInitAttempted(true);
      const success = await initialize(canvasRef.current);

      if (success) {
        onInitialized?.();
        onCaptureReady?.(captureFrame);
      }
    };

    initCamera();
  }, [initialize, initAttempted, isInitialized, onInitialized, onCaptureReady, captureFrame]);

  // Report errors to parent
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Unsupported browser fallback
  if (!isSupported) {
    return (
      <Card className={`flex flex-col items-center justify-center p-8 bg-muted/50 ${className}`}>
        <MonitorX className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Browser Not Supported
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          Live AR try-on requires a modern browser with WebGL2 support.
          Please try Chrome 95+, Safari 16+, or Edge 95+.
        </p>
        <p className="text-xs text-muted-foreground">
          You can still use Photo Mode for AI-powered try-on!
        </p>
      </Card>
    );
  }

  // Permission denied state
  if (permissionStatus === "denied") {
    return (
      <Card className={`flex flex-col items-center justify-center p-8 bg-muted/50 ${className}`}>
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Camera Access Required
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-2">
          Live AR try-on needs your camera, but this site is currently blocked from using it.
        </p>
        <div className="text-sm text-muted-foreground text-left max-w-sm mb-4 space-y-1">
          <p>To enable it:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Tap the <strong>lock or camera icon</strong> in your browser&apos;s address bar</li>
            <li>Set <strong>Camera</strong> to <strong>Allow</strong></li>
            <li>Come back and tap Try Again</li>
          </ol>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setInitAttempted(false);
            requestPermission();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  // Error state (configuration or other errors)
  if (error && !isLoading) {
    const isConfigError = error.includes("not configured");
    
    return (
      <Card className={`flex flex-col items-center justify-center p-8 bg-muted/50 ${className}`}>
        <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {isConfigError ? "Setup Required" : "Something Went Wrong"}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          {isConfigError
            ? "Live AR mode requires Snap Camera Kit credentials to be configured."
            : error
          }
        </p>
        {!isConfigError && (
          <Button
            variant="outline"
            onClick={() => {
              setInitAttempted(false);
              if (canvasRef.current) {
                initialize(canvasRef.current);
              }
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className={`relative aspect-[3/4] sm:aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
          <Skeleton className="w-full h-full absolute inset-0" />
          <div className="relative z-20 flex flex-col items-center">
            <Camera className="h-12 w-12 text-muted-foreground animate-pulse mb-4" />
            <p className="text-sm text-muted-foreground">Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Camera Kit canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ display: isLoading ? "none" : "block" }}
      />

      {/* Camera active indicator */}
      {isInitialized && !isLoading && (
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
};
