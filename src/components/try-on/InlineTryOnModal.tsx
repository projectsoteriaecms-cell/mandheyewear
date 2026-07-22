import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Heart, Camera, ExternalLink, Download } from "lucide-react";

import { TryOnCarousel, type CarouselSlide } from "./TryOnCarousel";
import { TryOnGenerationExperience } from "./TryOnGenerationExperience";
import { EmailCaptureModal } from "./EmailCaptureModal";
import { useProduct } from "@/modules/products";
import { useVirtualTryOn, type FrameDetails, useVTOEmailCapture } from "@/modules/personalization";
import { useCart, useWishlist } from "@/modules/orders";
import { useAuth } from "@/modules/auth";

interface InlineTryOnModalProps {
  productId: string | null;
  savedPhotoUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InlineTryOnModal = ({
  productId,
  savedPhotoUrl,
  open,
  onOpenChange,
}: InlineTryOnModalProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { data: product, isLoading: productLoading } = useProduct(productId || "");
  const {
    generateMultiAngle,
    currentResult,
    isGenerating,
    multiAngleResults,
    isGeneratingAngles,
    clearResult,
  } = useVirtualTryOn("inline_modal");
  const {
    captureState,
    isSubmitting: captureSubmitting,
    initiateCapture,
    closeModal: closeCaptureModal,
    handleSubmit: handleCaptureSubmit,
  } = useVTOEmailCapture();

  const hasTriggered = useRef(false);
  const [generationStarted, setGenerationStarted] = useState(false);

  // Auto-generate when modal opens with product data
  useEffect(() => {
    if (open && product && savedPhotoUrl && !hasTriggered.current && !generationStarted) {
      hasTriggered.current = true;
      setGenerationStarted(true);

      const frameDetails: FrameDetails = {
        id: product.id,
        name: product.name,
        color: product.color || undefined,
        style: product.style || undefined,
        imageUrl: product.image_url || undefined,
        price: product.price,
        sku: product.sku,
      };

      generateMultiAngle(savedPhotoUrl, frameDetails);
    }
  }, [open, product, savedPhotoUrl, generateMultiAngle, generationStarted]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      hasTriggered.current = false;
      setGenerationStarted(false);
      clearResult();
    }
  }, [open, clearResult]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (product) {
      addToCart.mutate({ productId: product.id, quantity: 1 });
    }
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (product) {
      addToWishlist.mutate(product.id);
    }
  };

  const handleUseDifferentPhoto = () => {
    onOpenChange(false);
    navigate(`/try-on?product=${productId}`);
  };

  const performDownload = () => {
    const images: { url: string; label: string }[] = [];
    if (multiAngleResults.front || currentResult?.compositeImage) {
      images.push({ url: multiAngleResults.front || currentResult!.compositeImage!, label: "front" });
    }
    if (multiAngleResults.left) images.push({ url: multiAngleResults.left, label: "left" });
    if (multiAngleResults.right) images.push({ url: multiAngleResults.right, label: "right" });
    images.forEach((img, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = img.url;
        link.download = `try-on-${product?.name || "frame"}-${img.label}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, i * 300);
    });
  };

  const handleDownload = () => {
    if (currentResult) {
      const { shouldShowModal } = initiateCapture(currentResult, "download");
      if (!shouldShowModal) performDownload();
    }
  };

  const showLoading = productLoading || isGenerating || (!currentResult && generationStarted);

  // Build carousel slides
  const carouselSlides: CarouselSlide[] = [
    {
      angle: "three_quarter_left",
      label: "Left Side",
      url: multiAngleResults.left,
      loading: isGeneratingAngles && !multiAngleResults.left,
    },
    {
      angle: "front",
      label: "Front",
      url: currentResult?.compositeImage || multiAngleResults.front,
      loading: isGenerating,
    },
    {
      angle: "three_quarter_right",
      label: "Right Side",
      url: multiAngleResults.right,
      loading: isGeneratingAngles && !multiAngleResults.right,
    },
  ];

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-accent" />
            Virtual Try-On
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product name */}
          {product && (
            <p className="text-sm text-muted-foreground">
              Trying on <span className="font-semibold text-foreground">{product.name}</span>
            </p>
          )}

          {/* Result area */}
          {showLoading && !currentResult ? (
            <TryOnGenerationExperience
              userPhoto={savedPhotoUrl}
              frameName={product?.name}
            />
          ) : currentResult?.success ? (
            <>
              <TryOnCarousel slides={carouselSlides} />
              {isGeneratingAngles && (
                <p className="text-xs text-center text-muted-foreground animate-pulse">
                  Generating more angles...
                </p>
              )}
            </>
          ) : currentResult && !currentResult.success ? (
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <p className="text-sm text-destructive font-medium">
                  {currentResult.error || "Unable to generate try-on"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    hasTriggered.current = false;
                    setGenerationStarted(false);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : null}

          {/* Action buttons - only show after successful result */}
          {currentResult?.success && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                  title={multiAngleResults.left || multiAngleResults.right ? "Download all angles" : "Download"}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              {product && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/product/${product.id}`);
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Full Details
                </Button>
              )}
            </div>
          )}

          {/* Use different photo link */}
          <Button
            variant="link"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={handleUseDifferentPhoto}
          >
            Use a different photo →
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <EmailCaptureModal
      isOpen={captureState.isOpen}
      onClose={closeCaptureModal}
      onSubmit={async (email, phone, marketing, fullName) => {
        const res = await handleCaptureSubmit(email, phone, marketing, fullName);
        // Only auto-download for a genuinely delivered email -- WhatsApp
        // has its own explicit share/download step, and an undelivered
        // email must not look like the promised "& Download" happened.
        if (res.channel === "email" && res.delivered) performDownload();
        return res;
      }}
      result={captureState.result}
      isSubmitting={captureSubmitting}
    />
    </>
  );
};
