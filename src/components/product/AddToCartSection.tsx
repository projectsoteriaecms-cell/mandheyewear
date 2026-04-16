import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ShoppingBag, Minus, Plus, Camera, Loader2, LogIn, Zap } from "lucide-react";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockBadge } from "@/modules/storefront/components/eyewear/StockBadge";
import { RequestItemDialog } from "@/modules/storefront/components/eyewear/RequestItemDialog";
import { InlineTryOnModal } from "@/components/try-on";
import { useInlineTryOn } from "@/modules/personalization/hooks/useInlineTryOn";
import type { StockStatus } from "@/modules/storefront/components/eyewear/StockBadge";
import type { Product } from "@/modules/products/hooks/useProducts";

interface AddToCartSectionProps {
  product: Product;
}

export const AddToCartSection = ({ product }: AddToCartSectionProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { modalOpen, targetProductId, savedPhotoUrl, triggerTryOn, setModalOpen } = useInlineTryOn();

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
    addToCart.mutate({ productId: product.id, quantity });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    navigate(`/checkout?buyNow=${product.id}&qty=${quantity}`);
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
    </div>
  );
};
