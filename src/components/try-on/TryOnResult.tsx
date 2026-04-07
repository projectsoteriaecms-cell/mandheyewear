import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Download, 
  Heart, 
  ShoppingCart, 
  RefreshCw, 
  Share2, 
  X,
  Maximize2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmailCaptureModal } from "./EmailCaptureModal";
import { TryOnCarousel, type CarouselSlide } from "./TryOnCarousel";
import { useVTOEmailCapture } from "@/modules/personalization/hooks/useVTOEmailCapture";
import type { TryOnResult as TryOnResultType, MultiAngleResults } from "@/modules/personalization/hooks/useVirtualTryOn";

interface TryOnResultProps {
  result: TryOnResultType | null;
  userPhoto: string | null;
  isGenerating: boolean;
  multiAngleResults?: MultiAngleResults;
  isGeneratingAngles?: boolean;
  onRetry?: () => void;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onClear?: () => void;
  className?: string;
}

export const TryOnResult = ({
  result,
  userPhoto,
  isGenerating,
  multiAngleResults,
  isGeneratingAngles,
  onRetry,
  onAddToCart,
  onAddToWishlist,
  onClear,
  className,
}: TryOnResultProps) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const {
    captureState,
    isSubmitting,
    initiateCapture,
    closeModal,
    handleSubmit,
    skipCapture,
  } = useVTOEmailCapture();

  // Download a single image
  const downloadImage = (url: string, label: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `try-on-${result?.frameDetails?.name || "frame"}-${label}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Perform the actual download - downloads all available angles
  const performDownload = () => {
    const frameName = result?.frameDetails?.name || "frame";
    const images: { url: string; label: string }[] = [];

    // Collect all available angle images
    if (multiAngleResults?.front) {
      images.push({ url: multiAngleResults.front, label: "front" });
    } else if (result?.compositeImage) {
      images.push({ url: result.compositeImage, label: "front" });
    }
    if (multiAngleResults?.left) {
      images.push({ url: multiAngleResults.left, label: "left" });
    }
    if (multiAngleResults?.right) {
      images.push({ url: multiAngleResults.right, label: "right" });
    }

    // Download each with a small delay to avoid browser blocking
    images.forEach((img, i) => {
      setTimeout(() => downloadImage(img.url, img.label), i * 300);
    });
  };

  // Handle download button click - show email capture for guests
  const handleDownload = () => {
    if (result) {
      const { shouldShowModal } = initiateCapture(result, "download");
      // Always allow download (after modal or directly)
      if (!shouldShowModal) {
        performDownload();
      }
    }
  };

  // Handle skip and download
  const handleSkipAndDownload = () => {
    skipCapture();
    performDownload();
  };

  const handleShare = async () => {
    if (result?.compositeImage && navigator.share) {
      // First trigger email capture for guests
      if (result) {
        initiateCapture(result, "share");
      }
      
      try {
        // Convert base64 to blob for sharing
        const response = await fetch(result.compositeImage);
        const blob = await response.blob();
        const file = new File([blob], "try-on.png", { type: "image/png" });
        
        await navigator.share({
          title: `Virtual Try-On: ${result.frameDetails?.name}`,
          text: "Check out how these frames look on me!",
          files: [file],
        });
      } catch (error) {
        console.log("Share cancelled or failed:", error);
      }
    }
  };

  // Loading state
  if (isGenerating) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Try-On Result</h3>
            <Badge variant="secondary" className="animate-pulse">
              Generating...
            </Badge>
          </div>
          <div className="aspect-[4/3] relative">
            <Skeleton className="w-full h-full rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  AI is generating your try-on...
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a few seconds
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (result && !result.success) {
    return (
      <Card className={cn("overflow-hidden border-destructive/50", className)}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Try-On Result</h3>
            {onClear && (
              <Button variant="ghost" size="icon" onClick={onClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="aspect-[4/3] bg-destructive/10 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4 p-6 max-w-sm">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <p className="font-medium text-foreground mb-1">
                  Couldn't Generate Try-On
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.error}
                </p>
              </div>
              {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state with result
  if (result?.success && result.compositeImage) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-foreground">Try-On Result</h3>
                {result.usedFrameReference && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Match
                  </Badge>
                )}
              </div>
              {result.frameDetails && (
                <p className="text-sm text-muted-foreground">
                  {result.frameDetails.name}
                  {result.frameDetails.price && (
                    <span className="ml-2 text-accent font-medium">
                      ₦{result.frameDetails.price.toLocaleString()}
                    </span>
                  )}
                </p>
              )}
            </div>
            {onClear && (
              <Button variant="ghost" size="icon" onClick={onClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Frame Reference Thumbnail (when available) */}
          {result.usedFrameReference && result.frameDetails?.imageUrl && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
              <img 
                src={result.frameDetails.imageUrl}
                alt={`${result.frameDetails.name} reference`}
                className="w-16 h-12 object-cover rounded border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">Reference Frame</p>
                <p className="text-xs text-muted-foreground">AI matched this exact design</p>
              </div>
            </div>
          )}

          {/* Multi-angle carousel or comparison view */}
          {multiAngleResults && (multiAngleResults.front || multiAngleResults.left || multiAngleResults.right) ? (
            <>
              <TryOnCarousel
                slides={[
                  {
                    angle: "three_quarter_left",
                    label: "Left Side",
                    url: multiAngleResults.left,
                    loading: !!isGeneratingAngles && !multiAngleResults.left,
                  },
                  {
                    angle: "front",
                    label: "Front",
                    url: result.compositeImage,
                    loading: false,
                  },
                  {
                    angle: "three_quarter_right",
                    label: "Right Side",
                    url: multiAngleResults.right,
                    loading: !!isGeneratingAngles && !multiAngleResults.right,
                  },
                ]}
                aspectRatio="aspect-[4/3]"
              />
              {isGeneratingAngles && (
                <p className="text-xs text-center text-muted-foreground animate-pulse">
                  Generating more angles...
                </p>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Original Photo */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Original</p>
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt="Original photo"
                      className="w-full h-full object-cover"
                      style={{ imageOrientation: "from-image" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Photo
                    </div>
                  )}
                </div>
              </div>

              {/* Generated Result */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">With Frames</p>
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden relative group">
                  <img
                    src={result.compositeImage}
                    alt="Try-on result"
                    className="w-full h-full object-cover"
                    style={{ imageOrientation: "from-image" }}
                  />
                  <button 
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
                    onClick={() => setIsFullscreenOpen(true)}
                  >
                    <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Modal */}
          <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
            <DialogContent className="max-w-4xl w-[95vw] p-2 sm:p-4 bg-background/95 backdrop-blur-sm">
              <DialogTitle className="sr-only">
                Virtual Try-On Result - {result.frameDetails?.name}
              </DialogTitle>
              <div className="relative">
                <img
                  src={result.compositeImage}
                  alt={`Virtual try-on with ${result.frameDetails?.name}`}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  style={{ imageOrientation: "from-image" }}
                />
                <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-center">
                      {result.frameDetails && (
                        <>
                          <p className="font-semibold text-foreground">{result.frameDetails.name}</p>
                          {result.frameDetails.price && (
                            <p className="text-accent font-medium">
                              ₦{result.frameDetails.price.toLocaleString()}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    {result.usedFrameReference && (
                      <Badge variant="secondary" className="shrink-0 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              {(multiAngleResults?.left || multiAngleResults?.right) ? "Download All" : "Download"}
            </Button>
            
            {navigator.share && (
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            
            {onAddToWishlist && (
              <Button variant="outline" size="sm" onClick={onAddToWishlist}>
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
            
            {onAddToCart && (
              <Button variant="gold" size="sm" onClick={onAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>

          {/* Email Capture Modal */}
          <EmailCaptureModal
            isOpen={captureState.isOpen}
            onClose={closeModal}
            onSubmit={handleSubmit}
            onSkip={handleSkipAndDownload}
            result={captureState.result}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    );
  }

  // Empty state - waiting for generation
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Try-On Result</h3>
        <div className="aspect-[4/3] bg-muted/30 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2 p-6">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {userPhoto 
                ? "Select a frame and click 'Try This Frame' to see the result"
                : "Upload your photo first to start trying on frames"
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
