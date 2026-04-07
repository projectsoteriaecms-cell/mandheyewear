import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FaceMeshCanvas } from "./FaceMeshCanvas";
import { ARFrameSelector } from "./ARFrameSelector";
import { isCameraKitConfigured } from "@/config/snap-lenses";
import type { TryOnResult as TryOnResultType } from "@/modules/personalization/hooks/useVirtualTryOn";

interface FrameProduct {
  id: string;
  name: string;
  image_url: string | null;
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

  const handleCapture = useCallback(async () => {
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
  }, [selectedProduct, onCapture]);

  return (
    <div className="space-y-6">
      {/* AR Error display */}
      {arError && (
        <Alert variant="destructive">
          <AlertDescription>{arError}</AlertDescription>
        </Alert>
      )}

      {/* Main AR Canvas */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <FaceMeshCanvas
            frameImageUrl={selectedProduct?.image_url || null}
            onInitialized={() => {
              setArError(null);
              setIsInitialized(true);
            }}
            onError={(error) => setArError(error)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Frame Selector — real products */}
      <ARFrameSelector
        products={products}
        selectedProductId={selectedProduct?.id || null}
        onSelectProduct={(p) => setSelectedProduct(p)}
        isLoading={productsLoading}
        disabled={!isInitialized}
      />

      {/* Capture Button */}
      <div className="flex flex-col gap-3">
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          onClick={handleCapture}
          disabled={!isInitialized || isCapturing || !selectedProduct}
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
          Select a frame above to see it on your face in real-time.
          Tap capture to save to your try-on history.
        </p>
      )}

      {/* Hint if no frame selected */}
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
