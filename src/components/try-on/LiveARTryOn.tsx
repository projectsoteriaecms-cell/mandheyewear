import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, ArrowLeft, Sparkles, Smile } from "lucide-react";
import { toast } from "sonner";
import { FaceMeshCanvas } from "./FaceMeshCanvas";
import { ARFrameSelector } from "./ARFrameSelector";
import { pickAROverlayImage } from "@/shared/lib/ar-image-utils";
import type { TryOnResult as TryOnResultType } from "@/modules/personalization/hooks/useVirtualTryOn";

interface FrameProduct {
  id: string;
  name: string;
  image_url: string | null;
  additional_images?: string[] | null;
  price: number;
  color?: string | null;
  style?: string | null;
  sku?: string;
}

interface LiveARTryOnProps {
  products: FrameProduct[];
  productsLoading?: boolean;
  onCapture: (result: TryOnResultType) => void;
  onSwitchToPhoto: () => void;
}

export const LiveARTryOn = ({
  products,
  productsLoading = false,
  onCapture,
  onSwitchToPhoto,
}: LiveARTryOnProps) => {
  const [selectedProduct, setSelectedProduct] = useState<FrameProduct | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [arError, setArError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [smileCaptureEnabled, setSmileCaptureEnabled] = useState(false);

  const arImage = useMemo(() => {
    if (!selectedProduct) return null;
    return pickAROverlayImage(
      selectedProduct.image_url,
      selectedProduct.additional_images ?? null
    );
  }, [selectedProduct]);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const canvas = document.querySelector<HTMLCanvasElement>("[data-ar-canvas]");
      if (!canvas) {
        toast.error("Canvas not ready");
        return;
      }

      const imageData = canvas.toDataURL("image/png");

      const result: TryOnResultType = {
        success: true,
        compositeImage: imageData,
        frameDetails: selectedProduct
          ? {
              id: selectedProduct.id,
              name: selectedProduct.name,
              imageUrl: selectedProduct.image_url || undefined,
              price: selectedProduct.price,
              sku: selectedProduct.sku,
            }
          : undefined,
        timestamp: Date.now(),
        usedFrameReference: false,
      };

      onCapture(result);
      toast.success("Snapshot saved to history!");
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Failed to capture snapshot");
    } finally {
      setIsCapturing(false);
    }
  }, [selectedProduct, onCapture, isCapturing]);

  const handleSmileCapture = useCallback(() => {
    if (smileCaptureEnabled && selectedProduct && !isCapturing) {
      toast("😄 Smile detected!", { description: "Capturing..." });
      handleCapture();
    }
  }, [smileCaptureEnabled, selectedProduct, isCapturing, handleCapture]);

  return (
    <div className="space-y-6">
      {arError && (
        <Alert variant="destructive">
          <AlertDescription>{arError}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <FaceMeshCanvas
            frameImageUrl={arImage?.url || null}
            arWarning={arImage && !arImage.arReady ? arImage.reason : null}
            onInitialized={() => {
              setArError(null);
              setIsInitialized(true);
            }}
            onError={(error) => setArError(error)}
            onSmileDetected={handleSmileCapture}
            className="w-full"
          />
        </CardContent>
      </Card>

      <ARFrameSelector
        products={products}
        selectedProductId={selectedProduct?.id || null}
        onSelectProduct={(p) => setSelectedProduct(p)}
        isLoading={productsLoading}
        disabled={!isInitialized}
      />

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button
            variant="gold"
            size="lg"
            className="flex-1"
            onClick={handleCapture}
            disabled={!isInitialized || isCapturing || !selectedProduct}
          >
            <Camera className="h-5 w-5 mr-2" />
            {isCapturing ? "Capturing..." : "Capture & Save"}
          </Button>

          <Button
            variant={smileCaptureEnabled ? "default" : "outline"}
            size="lg"
            onClick={() => setSmileCaptureEnabled(!smileCaptureEnabled)}
            disabled={!isInitialized || !selectedProduct}
            title="Toggle smile-to-capture"
          >
            <Smile className={`h-5 w-5 ${smileCaptureEnabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
          </Button>
        </div>

        {smileCaptureEnabled && (
          <p className="text-xs text-center text-accent font-medium">
            😄 Smile to auto-capture is ON
          </p>
        )}

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

      {isInitialized && (
        <p className="text-xs text-center text-muted-foreground">
          Select a frame above to see it on your face in real-time.
          Tap capture to save to your try-on history.
        </p>
      )}

      {isInitialized && !selectedProduct && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-accent text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Select a frame above to see it on your face
          </div>
        </div>
      )}
    </div>
  );
};
