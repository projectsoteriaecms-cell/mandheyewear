import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Info, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CameraKitCanvas } from "./CameraKitCanvas";
import { ARLensSelector } from "./ARLensSelector";
import { useCameraKit } from "@/shared/hooks/useCameraKit";
import { SNAP_CONFIG, isCameraKitConfigured } from "@/config/snap-lenses";
import type { TryOnResult as TryOnResultType } from "@/modules/personalization/hooks/useVirtualTryOn";

interface LiveARTryOnProps {
  onCapture: (result: TryOnResultType) => void;
  onSwitchToPhoto: () => void;
}

export const LiveARTryOn = ({ onCapture, onSwitchToPhoto }: LiveARTryOnProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [arError, setArError] = useState<string | null>(null);
  
  const {
    isInitialized,
    isLoading,
    currentLens,
    availableLenses,
    switchLens,
    captureFrame,
  } = useCameraKit();

  const handleLensSelect = useCallback(async (lensId: string) => {
    await switchLens(lensId);
  }, [switchLens]);

  const handleCapture = useCallback(async () => {
    if (!isInitialized) {
      toast.error("Camera not ready");
      return;
    }

    setIsCapturing(true);
    
    try {
      const imageData = await captureFrame();
      
      if (imageData) {
        // Create a TryOnResult-compatible object
        const result: TryOnResultType = {
          success: true,
          compositeImage: imageData,
          frameDetails: currentLens ? {
            id: currentLens.productId || currentLens.id,
            name: currentLens.name,
            imageUrl: currentLens.thumbnailUrl,
          } : undefined,
          timestamp: Date.now(),
          usedFrameReference: false, // AR captures aren't "verified" like AI VTO
        };
        
        onCapture(result);
        toast.success("Snapshot saved to history!");
      } else {
        toast.error("Failed to capture snapshot");
      }
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Failed to capture snapshot");
    } finally {
      setIsCapturing(false);
    }
  }, [isInitialized, captureFrame, currentLens, onCapture]);

  const isConfigured = isCameraKitConfigured();

  return (
    <div className="space-y-6">
      {/* Info alert for unconfigured state */}
      {!isConfigured && (
        <Alert className="bg-amber-500/10 border-amber-500/30">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            <strong>Setup Required:</strong> Live AR mode needs Snapchat Camera Kit credentials.
            Add your API Token and Lens Group ID to enable real-time AR try-on.
            <Button
              variant="link"
              size="sm"
              className="px-1 h-auto text-amber-600"
              onClick={onSwitchToPhoto}
            >
              Use Photo Mode instead →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* AR Error display */}
      {arError && (
        <Alert variant="destructive">
          <AlertDescription>{arError}</AlertDescription>
        </Alert>
      )}

      {/* Main AR Canvas */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <CameraKitCanvas
            onInitialized={() => setArError(null)}
            onError={(error) => setArError(error)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Lens Selector */}
      <ARLensSelector
        lenses={availableLenses}
        currentLensId={currentLens?.id || null}
        onSelectLens={handleLensSelect}
        isLoading={isLoading}
        disabled={!isInitialized}
      />

      {/* Capture Button */}
      <div className="flex flex-col gap-3">
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          onClick={handleCapture}
          disabled={!isInitialized || isCapturing}
        >
          <Camera className="h-5 w-5 mr-2" />
          {isCapturing ? "Capturing..." : "Capture & Save to History"}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onSwitchToPhoto}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Switch to Photo Mode
        </Button>
      </div>

      {/* Instructions */}
      {isInitialized && (
        <p className="text-xs text-center text-muted-foreground">
          Select a frame style above to see it on your face in real-time.
          Tap capture to save to your try-on history.
        </p>
      )}
    </div>
  );
};
