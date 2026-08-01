import { useState, useCallback, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, ArrowLeft, Sparkles, Smile, Box } from "lucide-react";
import { toast } from "sonner";
import { FaceMeshCanvas } from "./FaceMeshCanvas";
import { CameraKitCanvas } from "./CameraKitCanvas";
import { ARFrameSelector } from "./ARFrameSelector";
import { pickAROverlayImage } from "@/shared/lib/ar-image-utils";
import { useFrameAttributes, has3DMeasurements } from "@/shared/hooks/useFrameAttributes";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isCameraKitConfigured, getCarouselSlotForSku } from "@/config/snap-lenses";
import { recordTryOn, applyTryOnWatermark, type TryOnResult as TryOnResultType } from "@/modules/personalization";

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
  totalFrameCount?: number;
}

export const LiveARTryOn = ({
  products,
  productsLoading = false,
  onCapture,
  onSwitchToPhoto,
  totalFrameCount,
}: LiveARTryOnProps) => {
  const [selectedProduct, setSelectedProduct] = useState<FrameProduct | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [arError, setArError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [smileCaptureEnabled, setSmileCaptureEnabled] = useState(false);

  // Snap Camera Kit mode: the published carousel Lens renders photoreal 3D
  // frames on the live camera feed; users switch frames via the Lens's own
  // on-screen carousel. The MediaPipe path below is the fallback when Camera
  // Kit credentials are not configured.
  const snapReady = isCameraKitConfigured();
  const ckCaptureRef = useRef<(() => Promise<string | null>) | null>(null);

  // Which carousel slot the selected product maps to. Null means this product
  // has no 3D model in the Lens yet (most of the catalogue) -- the Lens then
  // opens on its default frame and the user swipes, rather than us blocking
  // the try-on entirely.
  const selectedSlot = getCarouselSlotForSku(selectedProduct?.sku);

  // Fetch frame attributes for 3D rendering (MediaPipe fallback mode)
  const { data: frameAttrs } = useFrameAttributes(selectedProduct?.id || null);
  const is3DReady = has3DMeasurements(frameAttrs);

  // Fetch ar_overlay_url for the selected product (MediaPipe fallback mode)
  const { data: overlayData } = useQuery({
    queryKey: ["ar-overlay", selectedProduct?.id],
    queryFn: async () => {
      if (!selectedProduct?.id) return null;
      const { data } = await supabase
        .from("frame_attributes")
        .select("ar_overlay_url")
        .eq("product_id", selectedProduct.id)
        .maybeSingle();
      return data?.ar_overlay_url as string | null;
    },
    enabled: !!selectedProduct?.id && !snapReady,
    staleTime: 5 * 60 * 1000,
  });

  // Use ar_overlay_url if available, otherwise fall back to catalog image
  const arImage = useMemo(() => {
    if (!selectedProduct) return null;
    if (overlayData) {
      return { url: overlayData, arReady: true };
    }
    return pickAROverlayImage(
      selectedProduct.image_url,
      selectedProduct.additional_images ?? null
    );
  }, [selectedProduct, overlayData]);

  // Derive frame color from product color (MediaPipe fallback mode)
  const frameColor = useMemo(() => {
    const color = selectedProduct?.color?.toLowerCase() || "";
    if (color.includes("gold")) return "#b8860b";
    if (color.includes("silver") || color.includes("grey") || color.includes("gray")) return "#808080";
    if (color.includes("brown") || color.includes("tortoise")) return "#8B4513";
    if (color.includes("blue")) return "#1e3a5f";
    if (color.includes("red") || color.includes("wine")) return "#8b0000";
    if (color.includes("pink") || color.includes("rose")) return "#c08080";
    if (color.includes("white") || color.includes("crystal")) return "#e8e8e8";
    return "#2d2d2d"; // default dark
  }, [selectedProduct]);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      let imageData: string | null = null;

      if (snapReady && ckCaptureRef.current) {
        // Camera Kit mode: capture the rendered Lens frame
        imageData = await ckCaptureRef.current();
      } else {
        // MediaPipe mode: capture from the Three.js / overlay canvas
        const arCanvas = document.querySelector<HTMLCanvasElement>("[data-ar-canvas] canvas");
        const fallbackCanvas = document.querySelector<HTMLCanvasElement>("[data-ar-canvas]");
        const canvas = arCanvas || fallbackCanvas;
        imageData = canvas ? canvas.toDataURL("image/png") : null;
      }

      if (!imageData) {
        toast.error("Canvas not ready");
        return;
      }

      // Same funnel rule as the photo flow: on-screen/history copies carry the
      // brand watermark; the clean capture only leaves via a captured contact.
      const watermarked = await applyTryOnWatermark(imageData);

      const result: TryOnResultType = {
        success: true,
        compositeImage: watermarked,
        cleanImage: imageData,
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

      // Camera Kit switches frames inside the Lens, so selectedProduct is often
      // absent there -- the capture is still recorded, just without a frame id.
      void recordTryOn({
        source: snapReady ? "live_ar_camerakit" : "live_ar_mediapipe",
        success: true,
        frameId: selectedProduct?.id,
        frameName: selectedProduct?.name,
      });

      onCapture(result);
      toast.success("Snapshot saved to history!");
    } catch (error) {
      console.error("Capture error:", error);
      void recordTryOn({
        source: snapReady ? "live_ar_camerakit" : "live_ar_mediapipe",
        success: false,
        frameId: selectedProduct?.id,
        frameName: selectedProduct?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to capture snapshot");
    } finally {
      setIsCapturing(false);
    }
  }, [selectedProduct, onCapture, isCapturing, snapReady]);

  const handleSmileCapture = useCallback(() => {
    if (smileCaptureEnabled && selectedProduct && !isCapturing) {
      toast("😄 Smile detected!", { description: "Capturing..." });
      handleCapture();
    }
  }, [smileCaptureEnabled, selectedProduct, isCapturing, handleCapture]);

  // In Camera Kit mode, capture works without a product selection (frames are
  // switched inside the Lens); selecting a product only tags the capture.
  const captureDisabled = snapReady
    ? !isInitialized || isCapturing
    : !isInitialized || isCapturing || !selectedProduct;

  return (
    <div className="space-y-6">
      {arError && (
        <Alert variant="destructive">
          <AlertDescription>{arError}</AlertDescription>
        </Alert>
      )}

      {!snapReady && (
        <Alert className="border-accent/30 bg-accent/5">
          <Sparkles className="h-4 w-4 text-accent" />
          <AlertDescription className="text-xs">
            Running in <strong>MediaPipe mode</strong>. Add Snap Camera Kit credentials to unlock photoreal lenses.
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          {snapReady ? (
            <CameraKitCanvas
              frameIndex={selectedSlot}
              onInitialized={() => {
                setArError(null);
                setIsInitialized(true);
              }}
              onError={(error) => setArError(error)}
              onCaptureReady={(capture) => {
                ckCaptureRef.current = capture;
              }}
              className="w-full"
            />
          ) : (
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
              use3D={is3DReady}
              frameAttributes={frameAttrs}
              frameColor={frameColor}
            />
          )}
        </CardContent>
      </Card>

      {/* Mode indicator */}
      {snapReady && isInitialized && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Box className="h-4 w-4 text-accent" />
          <span className="text-accent font-medium">Snap AR Try-On Active</span>
          <span className="text-muted-foreground">— Swipe the carousel on camera to switch frames</span>
        </div>
      )}
      {!snapReady && selectedProduct && is3DReady && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Box className="h-4 w-4 text-accent" />
          <span className="text-accent font-medium">3D Try-On Active</span>
          <span className="text-muted-foreground">— Frame rotates with your head</span>
        </div>
      )}
      {!snapReady && selectedProduct && !is3DReady && overlayData && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-accent font-medium">AI-Segmented Overlay</span>
        </div>
      )}

      {/* Frame selector: drives the overlay in MediaPipe mode; tags the capture in Camera Kit mode */}
      <ARFrameSelector
        products={products}
        selectedProductId={selectedProduct?.id || null}
        onSelectProduct={(p) => setSelectedProduct(p)}
        isLoading={productsLoading}
        disabled={!isInitialized}
        totalFrameCount={totalFrameCount}
      />

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button
            variant="gold"
            size="lg"
            className="flex-1"
            onClick={handleCapture}
            disabled={captureDisabled}
          >
            <Camera className="h-5 w-5 mr-2" />
            {isCapturing ? "Capturing..." : "Capture & Save"}
          </Button>

          {!snapReady && (
            <Button
              variant={smileCaptureEnabled ? "default" : "outline"}
              size="lg"
              onClick={() => setSmileCaptureEnabled(!smileCaptureEnabled)}
              disabled={!isInitialized || !selectedProduct}
              title="Toggle smile-to-capture"
            >
              <Smile className={`h-5 w-5 ${smileCaptureEnabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </Button>
          )}
        </div>

        {smileCaptureEnabled && !snapReady && (
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
          {snapReady
            ? "Swipe the carousel on the camera to try different frames. Tap capture to save to your try-on history."
            : "Select a frame above to see it on your face in real-time. Tap capture to save to your try-on history."}
        </p>
      )}

      {isInitialized && !snapReady && !selectedProduct && (
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
