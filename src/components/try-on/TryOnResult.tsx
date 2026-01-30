import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  Heart, 
  ShoppingCart, 
  RefreshCw, 
  Share2, 
  X,
  Maximize2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TryOnResult as TryOnResultType } from "@/hooks/useVirtualTryOn";

interface TryOnResultProps {
  result: TryOnResultType | null;
  userPhoto: string | null;
  isGenerating: boolean;
  onRetry?: () => void;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onClear?: () => void;
  className?: string;
}

export const TryOnResult = ({
  result,
  userPhoto,
  isGenerating,
  onRetry,
  onAddToCart,
  onAddToWishlist,
  onDownload,
  onShare,
  onClear,
  className,
}: TryOnResultProps) => {
  const handleDownload = () => {
    if (result?.compositeImage) {
      const link = document.createElement("a");
      link.href = result.compositeImage;
      link.download = `try-on-${result.frameDetails?.name || "frame"}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    onDownload?.();
  };

  const handleShare = async () => {
    if (result?.compositeImage && navigator.share) {
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
    onShare?.();
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
            <div>
              <h3 className="text-lg font-semibold text-foreground">Try-On Result</h3>
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

          {/* Comparison View */}
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
                />
                <button 
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
                  onClick={() => window.open(result.compositeImage, "_blank")}
                >
                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
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
