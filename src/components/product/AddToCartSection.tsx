import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ShoppingBag, Minus, Plus, Camera, Loader2, Heart, LogIn } from "lucide-react";
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

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <div className="space-y-6">
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-semibold">{quantity}</span>
            <Button variant="outline" size="icon" onClick={incrementQuantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {isOutOfStock ? (
          <RequestItemDialog productId={product.id} productName={product.name} />
        ) : (
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
          >
            {addToCart.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding...
              </>
            ) : !isAuthenticated ? (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In to Add to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </>
            )}
          </Button>
        )}

        <div className="flex gap-3">
          <Button variant="gold" className="flex-1" onClick={() => triggerTryOn(product.id)}>
            <Camera className="mr-2 h-4 w-4" />
            Virtual Try-On
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
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
      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="font-semibold text-sm">Free Shipping</p>
          <p className="text-xs text-muted-foreground">Orders over ₦100,000</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="font-semibold text-sm">30-Day Returns</p>
          <p className="text-xs text-muted-foreground">Easy returns</p>
        </div>
      </div>
    </div>
  );
};
