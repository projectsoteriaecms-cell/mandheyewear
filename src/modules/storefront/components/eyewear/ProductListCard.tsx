import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ShoppingCart } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useCart } from "@/modules/orders";
import { useAuth } from "@/modules/auth";
import { useNavigate } from "react-router-dom";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import type { Product } from "@/modules/products";
import { useInlineTryOn } from "@/modules/personalization";
import { InlineTryOnModal } from "@/components/try-on";
import { setCurrentProduct } from "@/shared/hooks/useCurrentProduct";

import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const placeholderImages = [frame1, frame2, frame3, frame4];

interface ProductListCardProps {
  product: Product;
}

const getPlaceholderImage = (productId: string) => {
  const index = productId.charCodeAt(0) % placeholderImages.length;
  return placeholderImages[index];
};

const getCategoryLabel = (style: string | null): string => {
  if (!style) return "Eyewear";
  const styleMap: Record<string, string> = {
    round: "Classic Round",
    rectangular: "Rectangular",
    "cat-eye": "Cat-Eye",
    aviator: "Aviator",
    wayfarer: "Wayfarer",
  };
  return styleMap[style] || style.charAt(0).toUpperCase() + style.slice(1);
};

export const ProductListCard = ({ product }: ProductListCardProps) => {
  const imageUrl = product.image_url || getPlaceholderImage(product.id);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { modalOpen, targetProductId, savedPhotoUrl, triggerTryOn, closeModal, setModalOpen } = useInlineTryOn();

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

  const handleViewDetails = (e: React.MouseEvent) => {
    setCurrentProduct({ id: product.id, name: product.name });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-gold transition-all cursor-pointer">
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div data-surface="list" className="product-surface relative w-full sm:w-48 md:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden ring-1 ring-border/40">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
            
            {/* Wishlist button on image */}
            <div className="absolute top-3 right-3">
              <WishlistButton productId={product.id} />
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-accent font-medium">
                  {getCategoryLabel(product.style)}
                </p>
                {product.brand && (
                  <span className="text-xs text-muted-foreground">{product.brand}</span>
                )}
              </div>
              <h3 className="font-semibold text-foreground text-lg">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
              
              {/* Product details */}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {product.material && (
                  <span className="px-2 py-1 bg-secondary rounded-md">{product.material}</span>
                )}
                {product.color && (
                  <span className="px-2 py-1 bg-secondary rounded-md">{product.color}</span>
                )}
                {product.gender && product.gender !== "unisex" && (
                  <span className="px-2 py-1 bg-secondary rounded-md capitalize">{product.gender}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-xl font-bold text-accent">
                ₦{product.price.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-9 w-9"
                      onClick={handleTryOn}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Virtual Try-On</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="gold"
                      className="h-9 w-9"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Add to Cart</p></TooltipContent>
                </Tooltip>
                <Button variant="outline" size="sm" onClick={handleViewDetails}>
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
      {savedPhotoUrl && (
        <InlineTryOnModal
          productId={targetProductId}
          savedPhotoUrl={savedPhotoUrl}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </Link>
  );
};
