import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Heart, Camera, ExternalLink, Download, Upload } from "lucide-react";
import { WhatsappLogo } from "@phosphor-icons/react";

import { TryOnCarousel, type CarouselSlide } from "./TryOnCarousel";
import { TryOnGenerationExperience } from "./TryOnGenerationExperience";
import { EmailCaptureModal } from "./EmailCaptureModal";
import { PhotoConsentCheckbox } from "./PhotoConsentCheckbox";
import { useProduct } from "@/modules/products";
import {
  useVirtualTryOn,
  type FrameDetails,
  useVTOEmailCapture,
  hasSessionPhotoConsent,
  giveSessionPhotoConsent,
  setSessionTryOnPhoto,
} from "@/modules/personalization";
import { useCart, useWishlist } from "@/modules/orders";
import { useAuth } from "@/modules/auth";

interface InlineTryOnModalProps {
  productId: string | null;
  /** Account photo or the shared session photo -- null means neither exists
   *  yet, and this modal shows its own upload step instead of navigating away. */
  savedPhotoUrl: string | null;
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
    multiAngleCleanResults,
    isGeneratingAngles,
    clearResult,
  } = useVirtualTryOn("inline_modal");
  const {
    captureState,
    isSubmitting: captureSubmitting,
    userEmail,
    initiateCapture,
    closeModal: closeCaptureModal,
    handleSubmit: handleCaptureSubmit,
  } = useVTOEmailCapture();

  const hasTriggered = useRef(false);
  const [generationStarted, setGenerationStarted] = useState(false);

  // Upload step -- shown instead of the result when neither an account photo
  // nor a session photo exists yet. Once a guest uploads here, the photo is
  // written to the shared session store, so every OTHER product's inline
  // modal picks it up too -- upload once per visit, not once per frame.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoConsent, setPhotoConsent] = useState(hasSessionPhotoConsent);
  const [consentError, setConsentError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleConsentChange = useCallback((checked: boolean) => {
    setPhotoConsent(checked);
    if (checked) {
      setConsentError("");
      giveSessionPhotoConsent();
    }
  }, []);

  const triggerUpload = () => {
    if (!photoConsent) {
      setConsentError("Please confirm the photo consent below first.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Photo must be under 10MB.");
      return;
    }
    setUploadError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // Reactive: every component subscribed via useSessionTryOnPhoto (i.e.
      // every product card's useInlineTryOn) re-renders with this photo, so
      // this modal's own savedPhotoUrl prop updates and the effect below
      // picks it up on the very next render -- no extra plumbing needed here.
      setSessionTryOnPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

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
      setUploadError("");
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
    // A guest's photo lives only in the session store, so swapping it can
    // happen right here -- clear it, re-show this modal's own upload step,
    // no navigation needed. A signed-in user's photo is their saved account
    // photo, which can only be replaced via the full page's "save new photo"
    // flow, so that case still hands off to /try-on.
    if (!isAuthenticated) {
      hasTriggered.current = false;
      setGenerationStarted(false);
      clearResult();
      setSessionTryOnPhoto(null);
      return;
    }
    onOpenChange(false);
    navigate(`/try-on?product=${productId}`);
  };

  const performDownload = () => {
    // Post-capture download -> deliver the CLEAN (unwatermarked) copies. The
    // on-screen preview stays watermarked; the download is what the contact
    // was traded for. Falls back to watermarked only if no clean copy exists.
    const images: { url: string; label: string }[] = [];
    const front =
      multiAngleCleanResults.front ??
      currentResult?.cleanImage ??
      multiAngleResults.front ??
      currentResult?.compositeImage;
    if (front) images.push({ url: front, label: "front" });
    const left = multiAngleCleanResults.left ?? multiAngleResults.left;
    if (left) images.push({ url: left, label: "left" });
    const right = multiAngleCleanResults.right ?? multiAngleResults.right;
    if (right) images.push({ url: right, label: "right" });
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

  // Open the channel-choice modal straight on the WhatsApp tab — for everyone,
  // signed-in users included (they'd otherwise be silently auto-emailed on
  // download and never reach the WhatsApp share path). Captures the lead.
  const handleWhatsAppShare = () => {
    if (currentResult) {
      initiateCapture(currentResult, "share", { forceModal: true, channel: "whatsapp" });
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
          {!savedPhotoUrl ? (
            /* No account photo, no session photo -- ask for one right here
               instead of sending the visitor to /try-on. Once given, the
               effect above picks it up on the next render and generates. */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a photo to try this frame on -- it'll be ready for every
                other frame you try during this visit too.
              </p>
              <PhotoConsentCheckbox
                checked={photoConsent}
                onCheckedChange={handleConsentChange}
                error={consentError}
                idPrefix="inline-photo-consent"
              />
              <div
                onClick={triggerUpload}
                className={`border-2 border-dashed rounded-lg p-6 text-center space-y-3 transition-all cursor-pointer ${
                  photoConsent
                    ? "border-border hover:border-primary hover:bg-muted/50"
                    : "border-border opacity-60"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <Button variant="outline" type="button" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photo
                </Button>
              </div>
              {uploadError && (
                <p className="text-xs text-destructive text-center">{uploadError}</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : showLoading && !currentResult ? (
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
                <Button
                  variant="outline"
                  size="icon"
                  className="text-green-600 hover:text-green-700"
                  onClick={handleWhatsAppShare}
                  title="Share to WhatsApp"
                >
                  <WhatsappLogo weight="fill" className="h-4 w-4" />
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

          {/* Use different photo link -- nothing to swap during the upload step itself */}
          {savedPhotoUrl && (
            <Button
              variant="link"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={handleUseDifferentPhoto}
            >
              Use a different photo →
            </Button>
          )}
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
      initialChannel={captureState.initialChannel}
      prefillEmail={userEmail}
    />
    </>
  );
};
