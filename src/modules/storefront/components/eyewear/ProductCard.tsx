import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ShoppingCart, Eye } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { StockBadge } from "./StockBadge";
import { RequestItemDialog } from "./RequestItemDialog";
import type { Product } from "@/modules/products/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StockStatus } from "./StockBadge";
import { getHeroImage } from "@/modules/products/lib/image-utils";
import { useInlineTryOn } from "@/modules/personalization/hooks/useInlineTryOn";
import { InlineTryOnModal } from "@/components/try-on";
import { setCurrentProduct } from "@/shared/hooks/useCurrentProduct";

interface ProductCardProps {
  product: Product;
  onQuickView?: (productId: string) => void;
}

const getCategoryLabel = (product: Product): string => {
  if (product.item_type === "lenses") return "Lens";
  if (product.item_type === "contact_lenses") return "Contact Lens";
  if (product.item_type !== "frames") return product.item_type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Eyewear";
  if (!product.style) return "Eyewear";
  const styleMap: Record<string, string> = {
    round: "Classic Round",
    rectangular: "Rectangular",
    "cat-eye": "Cat-Eye",
    aviator: "Aviator",
    wayfarer: "Wayfarer",
  };
  return styleMap[product.style] || product.style.charAt(0).toUpperCase() + product.style.slice(1);
};

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const imageUrl = getHeroImage(product) || "/placeholder.svg";
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { modalOpen, targetProductId, savedPhotoUrl, triggerTryOn, closeModal, setModalOpen } = useInlineTryOn();

  const { data: availability } = useQuery({
    queryKey: ["product-availability", product.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("check_product_availability", {
        p_product_id: product.id,
      });
      if (error) return { status: "unknown" as StockStatus };
      return data as { mh_stock: number; other_stock: number; status: StockStatus };
    },
    staleTime: 5 * 60_000,
  });

  const stockStatus: StockStatus = (availability?.status as StockStatus) || "unknown";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const handleTryOn = (e: React.MouseEvent) => {
    setCurrentProduct({ id: product.id, name: product.name });
    triggerTryOn(product.id, e);
  };

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView(product.id);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentProduct({ id: product.id, name: product.name });
    if (onQuickView) {
      onQuickView(product.id);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const isOutOfStock = stockStatus === "out_of_stock";

  return (
    <div className="block touch-feedback" onClick={handleCardClick} role="button" tabIndex={0}>
      <Card className="group overflow-hidden hover:shadow-gold transition-all cursor-pointer mobile-card">
        <div data-surface="card" className="product-surface relative h-48 sm:h-64 overflow-hidden rounded-md ring-1 ring-border/40">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
          
          {/* Stock badge */}
          {stockStatus !== "unknown" && (
            <div className="absolute top-2 left-2">
              <StockBadge status={stockStatus} />
            </div>
          )}

          {/* Desktop hover actions */}
          <div className="hidden sm:flex absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex-col gap-2">
            <WishlistButton productId={product.id} />
            {product.item_type === "frames" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="shadow-lg touch-target"
                    onClick={handleTryOn}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Virtual Try-On</p></TooltipContent>
              </Tooltip>
            )}
            {!isOutOfStock && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="gold"
                    className="shadow-lg touch-target"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Add to Cart</p></TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Mobile always-visible wishlist */}
          <div className="sm:hidden absolute top-2 right-2">
            <WishlistButton productId={product.id} />
          </div>
        </div>
        <CardContent className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          <p className="text-xs text-accent font-medium">
            {getCategoryLabel(product)}
          </p>
          <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">{product.name}</h3>
          <p className="text-base sm:text-lg font-bold text-accent">
            ₦{product.price.toLocaleString()}
          </p>
          
          {/* Action buttons */}
          <div className="flex gap-2 pt-1 sm:pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10 touch-target"
              onClick={handleQuickViewClick}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              <span className="sm:hidden">Preview</span>
              <span className="hidden sm:inline">Quick View</span>
            </Button>
            {isOutOfStock ? (
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <RequestItemDialog productId={product.id} productName={product.name} />
              </div>
            ) : (
              <Button 
                variant="gold" 
                size="sm" 
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10 touch-target"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Add to Cart</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {savedPhotoUrl && (
        <InlineTryOnModal
          productId={targetProductId}
          savedPhotoUrl={savedPhotoUrl}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
};
