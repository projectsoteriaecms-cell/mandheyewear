import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ShoppingBag, Minus, Plus, Camera, Loader2, LogIn, Zap, Glasses, ChevronRight, Check } from "lucide-react";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockBadge } from "@/modules/storefront/components/eyewear/StockBadge";
import { RequestItemDialog } from "@/modules/storefront/components/eyewear/RequestItemDialog";
import { InlineTryOnModal } from "@/components/try-on";
import { useInlineTryOn } from "@/modules/personalization/hooks/useInlineTryOn";
import { LensConfigurator, type LensConfig } from "@/modules/lens/components/LensConfigurator";
import { LensSummaryChip } from "@/modules/lens/components/LensSummaryChip";
import type { StockStatus } from "@/modules/storefront/components/eyewear/StockBadge";
import type { Product } from "@/modules/products/hooks/useProducts";

interface AddToCartSectionProps {
  product: Product;
}

export const AddToCartSection = ({ product }: AddToCartSectionProps) => {
  const [quantity, setQuantity] = useState(1);
  const [lensConfigOpen, setLensConfigOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "buyNow" | null>(null);
  const [lensConfig, setLensConfig] = useState<LensConfig | null>(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { modalOpen, targetProductId, savedPhotoUrl, triggerTryOn, setModalOpen } = useInlineTryOn();

  const isFrame = product.item_type === "frames";

  const { data: availability } = useQuery({
    queryKey: ["product-availability", product.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("check_product_availability", {
        p_product_id: product.id,
      });
      if (error) return { status: "unknown" as StockStatus, mh_stock: 0, other_stock: 0 };
      return data as { mh_stock: number; other_stock: number; status: StockStatus };
    },
    staleTime: 5 * 60_000,
  });

  const stockStatus: StockStatus = (availability?.status as StockStatus) || "unknown";
  const isOutOfStock = stockStatus === "out_of_stock";

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (isFrame) {
      setPendingAction("cart");
      setLensConfigOpen(true);
      return;
    }
    addToCart.mutate({ productId: product.id, quantity });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (isFrame) {
      setPendingAction("buyNow");
      setLensConfigOpen(true);
      return;
    }
    navigate(`/checkout?buyNow=${product.id}&qty=${quantity}`);
  };

  const handleLensConfirm = (config: LensConfig) => {
    setLensConfig(config);
    setLensConfigOpen(false);
    addToCart.mutate(
      { productId: product.id, quantity, lensConfig: config },
      {
        onSuccess: () => {
          if (pendingAction === "buyNow") navigate("/checkout");
        },
      }
    );
    setPendingAction(null);
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <div className="space-y-3">
      {/* Price + Stock + Qty — compact row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-accent">
            ₦{product.price.toLocaleString()}
          </p>
          {stockStatus !== "unknown" && <StockBadge status={stockStatus} />}
        </div>
        {!isOutOfStock && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={decrementQuantity} disabled={quantity <= 1}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={incrementQuantity}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Lens Selection CTA — prominent for frames */}
      {isFrame && !isOutOfStock && (
        <button
          type="button"
          onClick={() => { setPendingAction(null); setLensConfigOpen(true); }}
          className={`w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all hover:shadow-md ${
            lensConfig
              ? "border-accent/40 bg-accent/5"
              : "border-dashed border-accent/60 bg-accent/5 hover:bg-accent/10"
          }`}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${lensConfig ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent"}`}>
            {lensConfig ? <Check className="h-5 w-5" /> : <Glasses className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {lensConfig ? "Lenses Selected" : "Select Your Lenses"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {lensConfig
                ? `${lensConfig.lensType === "frame_only" ? "Frame only" : lensConfig.lensType.replace(/_/g, " ")}${lensConfig.lensPrice ? ` • +₦${lensConfig.lensPrice.toLocaleString()}` : ""} • Tap to change`
                : "Frame only or add prescription / sunglasses lenses"}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </button>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-2">
        {isOutOfStock ? (
          <RequestItemDialog productId={product.id} productName={product.name} />
        ) : (
          <>
            {/* Buy Now + Add to Cart — side by side on desktop */}
            <div className="flex flex-col lg:flex-row gap-2">
              <Button
                variant="hero"
                className="flex-1 gap-2"
                onClick={handleBuyNow}
                disabled={addToCart.isPending}
              >
                {!isAuthenticated ? (
                  <><LogIn className="h-4 w-4" /> Sign In to Buy</>
                ) : (
                  <><Zap className="h-4 w-4" /> Buy Now</>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
              >
                {addToCart.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                ) : (
                  <><ShoppingBag className="h-4 w-4" /> Add to Cart</>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Secondary actions row */}
        <div className="flex gap-2">
          <Button variant="gold" size="sm" className="flex-1" onClick={() => triggerTryOn(product.id)}>
            <Camera className="mr-1.5 h-4 w-4" />
            Virtual Try-On
          </Button>
          <WishlistButton productId={product.id} />
        </div>

        {savedPhotoUrl && (
          <InlineTryOnModal
            productId={targetProductId}
            savedPhotoUrl={savedPhotoUrl}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        )}
      </div>

      {/* Trust Badges — compact single row */}
      <div className="flex gap-2 pt-2 border-t text-center">
        <div className="flex-1 py-1.5 bg-muted rounded-md">
          <p className="font-semibold text-[10px]">Free Shipping</p>
          <p className="text-[9px] text-muted-foreground">Over ₦100k</p>
        </div>
        <div className="flex-1 py-1.5 bg-muted rounded-md">
          <p className="font-semibold text-[10px]">30-Day Returns</p>
          <p className="text-[9px] text-muted-foreground">Easy returns</p>
        </div>
      </div>

      {/* Lens Configurator modal */}
      {isFrame && (
        <LensConfigurator
          open={lensConfigOpen}
          onOpenChange={setLensConfigOpen}
          productName={product.name}
          productId={product.id}
          onConfirm={handleLensConfirm}
          isAdding={addToCart.isPending}
        />
      )}
    </div>
  );
};
