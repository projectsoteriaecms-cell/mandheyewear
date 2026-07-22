import { useState, useEffect, useCallback, useMemo } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, ArrowLeft, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PhotoUpload,
  FramePicker,
  TryOnResult,
  TryOnHistory,
  TryOnModeToggle,
  LiveARComingSoon,
  LiveARTryOn,
  TryOnTour,
  type TryOnMode
} from "@/components/try-on";
import { isCameraKitConfigured } from "@/config/snap-lenses";

import { toast } from "sonner";
import { useVirtualTryOn, recordTryOnStarted, type FrameDetails, type TryOnResult as TryOnResultType } from "@/modules/personalization";
import { useProducts, useProduct } from "@/modules/products";
import { useCart, useWishlist } from "@/modules/orders";
import { useAuth } from "@/modules/auth";

const TryOn = () => {
  useSEO({
    title: "Virtual Try-On – See Frames on Your Face | M&H Eyewear",
    description: "Upload your photo and try on 70+ frames instantly with our AI-powered virtual try-on. Find your perfect glasses online.",
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedProductId = searchParams.get("product");
  
  // Try-on mode: photo (AI) or ar (Camera Kit)
  const [tryOnMode, setTryOnMode] = useState<TryOnMode>("photo");
  
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  // Fetch products for frame picker
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: preselectedProduct } = useProduct(preselectedProductId || "");

  // Virtual try-on state (shared between modes for history)
  const {
    isGenerating,
    currentResult,
    savedTryOns,
    userPhoto,
    multiAngleResults,
    isGeneratingAngles,
    generateMultiAngle,
    clearResult,
    clearHistory,
    setPhoto,
    removeFromHistory,
    addToHistory,
  } = useVirtualTryOn();

  const [selectedFrame, setSelectedFrame] = useState<FrameDetails | null>(null);

  // Funnel entry: records which surface a visitor actually lands on, so
  // drop-off between arriving and completing a try-on is measurable per mode.
  useEffect(() => {
    recordTryOnStarted(
      tryOnMode === "ar" ? "live_ar_camerakit" : "photo_ai",
      preselectedProductId ?? undefined,
    );
  }, [tryOnMode, preselectedProductId]);

  // Add AR captures to the shared try-on history
  const handleARCapture = useCallback((result: TryOnResultType) => {
    addToHistory(result);
  }, [addToHistory]);

  // Switch back to photo mode
  const handleSwitchToPhoto = useCallback(() => {
    setTryOnMode("photo");
  }, []);

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

  // Filter to only show frame products with images, sorted alphabetically
  const frameProducts = products
    ?.filter((p) => p.item_type === "frames" && p.image_url)
    .sort((a, b) => a.name.localeCompare(b.name)) || [];

  // Fetch product IDs that have AR overlays OR 3D measurements (AR-ready)
  const { data: arReadyIds } = useQuery({
    queryKey: ["ar-ready-product-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("frame_attributes")
        .select("product_id, ar_overlay_url, lens_width, bridge_size, temple_length");
      if (error) throw error;
      // Include products that have an AR overlay OR full 3D measurements
      const ids = (data || [])
        .filter((r) => r.ar_overlay_url || (r.lens_width && r.bridge_size && r.temple_length))
        .map((r) => r.product_id);
      return new Set(ids);
    },
    staleTime: 5 * 60 * 1000,
  });

  // AR products: those with overlays or 3D measurements
  const arFrameProducts = useMemo(
    () => (arReadyIds ? frameProducts.filter((p) => arReadyIds.has(p.id)) : []),
    [frameProducts, arReadyIds]
  );

  const handleTryOn = async (frame: FrameDetails) => {
    if (!userPhoto) {
      toast.error("Please upload your photo first");
      return;
    }

    setSelectedFrame(frame);
    await generateMultiAngle(userPhoto, frame);
  };

  const handleRetry = () => {
    if (selectedFrame && userPhoto) {
      generateMultiAngle(userPhoto, selectedFrame);
    }
  };

  // Count of frames ready for try-on
  const readyFramesCount = frameProducts.length;

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

      <div className="pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" asChild className="-ml-2">
                <a href="/shop">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Shop
                </a>
              </Button>
              <TryOnTour />
            </div>

            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-accent/10 mb-4">
                <Camera className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
                Virtual Try-On
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                {tryOnMode === "photo" 
                  ? "Upload your photo and see how our frames look on you with AI-powered try-on technology"
                  : "See frames on your face in real-time with AR technology"
                }
              </p>
              
              {/* Mode Toggle */}
              <TryOnModeToggle 
                mode={tryOnMode} 
                onModeChange={setTryOnMode}
                disabled={isGenerating}
              />
              
              {readyFramesCount > 0 && tryOnMode === "photo" && (
                <p className="text-sm text-accent font-medium mt-4">
                  {readyFramesCount} frames ready for virtual try-on
                </p>
              )}
            </div>
          </div>

          {/* Conditional Content Based on Mode */}
          {tryOnMode === "ar" ? (
            /* Live AR: real Camera Kit experience once credentials are configured, Coming Soon until then */
            <div className="max-w-2xl mx-auto mb-8">
              {isCameraKitConfigured() ? (
                <LiveARTryOn
                  products={frameProducts}
                  productsLoading={productsLoading}
                  onCapture={handleARCapture}
                  onSwitchToPhoto={handleSwitchToPhoto}
                  totalFrameCount={frameProducts.length}
                />
              ) : (
                <LiveARComingSoon onSwitchToPhoto={handleSwitchToPhoto} />
              )}
            </div>
          ) : (
            /* Photo Mode (existing AI VTO) */
            <>
              {/* Info Banner - only shown before upload */}
              {!userPhoto && (
                <Alert className="mb-8 bg-primary/5 border-primary/20">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>How it works:</strong> Upload a clear, front-facing photo, then tap any frame below — the AI generates a realistic preview in seconds, right above the frames.
                  </AlertDescription>
                </Alert>
              )}

              {/* Step 1: Upload (collapses once a photo exists) */}
              <div className="mb-6" data-tour-step="upload">
                <PhotoUpload
                  photo={userPhoto}
                  onPhotoChange={setPhoto}
                  isProcessing={isGenerating}
                  compact={!!userPhoto}
                />
              </div>

              {/* Step 2: Sticky Try-On Stage - appears after upload */}
              {userPhoto && (
                <div
                  className="sticky top-16 z-30 mb-4 -mx-4 sm:mx-0 px-3 sm:px-0 py-2 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
                  data-tour-step="result"
                >
                  <div className="rounded-lg sm:border sm:border-border sm:bg-card sm:p-3">
                    <TryOnResult
                      compact
                      result={currentResult}
                      userPhoto={userPhoto}
                      isGenerating={isGenerating}
                      multiAngleResults={multiAngleResults}
                      isGeneratingAngles={isGeneratingAngles}
                      onRetry={handleRetry}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                      onClear={clearResult}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Frame Picker - tap any card to try */}
              <div className="mb-8" data-tour-step="frames">
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
            </>
          )}

          {/* Try-On History - shared between modes */}
          <div data-tour-step="history">
            <TryOnHistory
              history={savedTryOns}
              onSelect={handleSelectFromHistory}
              onRemove={removeFromHistory}
              onClearAll={clearHistory}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TryOn;
