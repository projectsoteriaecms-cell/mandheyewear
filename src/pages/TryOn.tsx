import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, ArrowLeft, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhotoUpload, FramePicker, TryOnResult, TryOnHistory } from "@/components/try-on";
import { useVirtualTryOn, type FrameDetails } from "@/hooks/useVirtualTryOn";
import { useProducts, useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const TryOn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedProductId = searchParams.get("product");
  
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  // Fetch products for frame picker
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: preselectedProduct } = useProduct(preselectedProductId || "");

  // Virtual try-on state
  const {
    isGenerating,
    currentResult,
    savedTryOns,
    userPhoto,
    generateTryOn,
    clearResult,
    clearHistory,
    setPhoto,
    removeFromHistory,
  } = useVirtualTryOn();

  const [selectedFrame, setSelectedFrame] = useState<FrameDetails | null>(null);

  // Set preselected product as selected frame
  useEffect(() => {
    if (preselectedProduct && !selectedFrame) {
      setSelectedFrame({
        id: preselectedProduct.id,
        name: preselectedProduct.name,
        color: preselectedProduct.color || undefined,
        style: preselectedProduct.style || undefined,
        imageUrl: preselectedProduct.image_url || undefined,
        price: preselectedProduct.price,
        sku: preselectedProduct.sku,
      });
    }
  }, [preselectedProduct, selectedFrame]);

  // Filter to only show frame products with images
  const frameProducts = products?.filter(
    (p) => p.item_type === "frames" && p.image_url
  ) || [];

  const handleTryOn = async (frame: FrameDetails) => {
    if (!userPhoto) {
      toast.error("Please upload your photo first");
      return;
    }

    setSelectedFrame(frame);
    await generateTryOn(userPhoto, frame);
  };

  const handleRetry = () => {
    if (selectedFrame && userPhoto) {
      generateTryOn(userPhoto, selectedFrame);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (currentResult?.frameDetails?.id) {
      addToCart.mutate({ productId: currentResult.frameDetails.id, quantity: 1 });
    }
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (currentResult?.frameDetails?.id) {
      addToWishlist.mutate(currentResult.frameDetails.id);
    }
  };

  const handleSelectFromHistory = (result: typeof currentResult) => {
    if (result?.frameDetails) {
      setSelectedFrame(result.frameDetails);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
              <a href="/eyewear">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Eyewear
              </a>
            </Button>

            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-accent/10 mb-4">
                <Camera className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
                Virtual Try-On
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Upload your photo and see how our frames look on you with AI-powered try-on technology
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <Alert className="mb-8 bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong> Upload a clear, front-facing photo → Browse our frames → 
              Click "Try This Frame" → AI generates a realistic preview in seconds!
            </AlertDescription>
          </Alert>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Photo Upload */}
            <PhotoUpload
              photo={userPhoto}
              onPhotoChange={setPhoto}
              isProcessing={isGenerating}
            />

            {/* Right: Try-On Result */}
            <TryOnResult
              result={currentResult}
              userPhoto={userPhoto}
              isGenerating={isGenerating}
              onRetry={handleRetry}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onClear={clearResult}
            />
          </div>

          {/* Frame Picker */}
          <div className="mb-8">
            <FramePicker
              products={frameProducts}
              isLoading={productsLoading}
              selectedFrame={selectedFrame}
              onSelectFrame={setSelectedFrame}
              onTryOn={handleTryOn}
              isGenerating={isGenerating}
              disabled={!userPhoto}
            />
          </div>

          {/* Try-On History */}
          <TryOnHistory
            history={savedTryOns}
            onSelect={handleSelectFromHistory}
            onRemove={removeFromHistory}
            onClearAll={clearHistory}
          />

          {/* Bottom CTA for mobile */}
          {userPhoto && selectedFrame && !isGenerating && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:hidden z-40">
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => handleTryOn(selectedFrame)}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Try On {selectedFrame.name}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TryOn;
