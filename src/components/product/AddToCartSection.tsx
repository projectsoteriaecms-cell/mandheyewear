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
    <div className="space-y-4">
      {/* Price + Stock */}
      <div>
        <p className="text-3xl font-bold text-accent">
          ₦{product.price.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {product.currency || "NGN"} • VAT inclusive
        </p>
        {stockStatus !== "unknown" && (
          <div className="mt-2">
            <StockBadge status={stockStatus} />
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Qty</label>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrementQuantity} disabled={quantity <= 1}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center font-semibold">{quantity}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={incrementQuantity}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-2">
        {isOutOfStock ? (
          <RequestItemDialog productId={product.id} productName={product.name} />
        ) : (
          <>
            {/* Buy Now — hero CTA */}
            <Button
              variant="hero"
              size="lg"
              className="w-full gap-2"
              onClick={handleBuyNow}
              disabled={addToCart.isPending}
            >
              {!isAuthenticated ? (
                <><LogIn className="h-5 w-5" /> Sign In to Buy</>
              ) : (
                <><Zap className="h-5 w-5" /> Buy Now</>
              )}
            </Button>

            {/* Add to Cart — secondary */}
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
            >
              {addToCart.isPending ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Adding...</>
              ) : (
                <><ShoppingBag className="h-5 w-5" /> Add to Cart</>
              )}
            </Button>
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

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
        <div className="text-center p-2.5 bg-muted rounded-lg">
          <p className="font-semibold text-xs">Free Shipping</p>
          <p className="text-[10px] text-muted-foreground">Orders over ₦100,000</p>
        </div>
        <div className="text-center p-2.5 bg-muted rounded-lg">
          <p className="font-semibold text-xs">30-Day Returns</p>
          <p className="text-[10px] text-muted-foreground">Easy returns</p>
        </div>
      </div>
    </div>
  );
};
