import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { MatchBadge } from "./MatchBadge";
import { FitIndicator, FitType } from "./FitIndicator";
import type { Product } from "@/hooks/useProducts";

// Import placeholder images for products without images
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const placeholderImages = [frame1, frame2, frame3, frame4];

interface ProductCardProps {
  product: Product;
  matchScore?: number;
  matchReasons?: string[];
  fitIndicator?: FitType;
}

const getPlaceholderImage = (productId: string) => {
  // Use product ID to consistently select a placeholder
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

export const ProductCard = ({
  product,
  matchScore,
  matchReasons = [],
  fitIndicator,
}: ProductCardProps) => {
  const imageUrl = product.image_url || getPlaceholderImage(product.id);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <Link to={`/product/${product.id}`} className="block touch-feedback">
      <Card className="group overflow-hidden hover:shadow-gold transition-all cursor-pointer mobile-card">
        <div className="relative h-48 sm:h-64 overflow-hidden bg-secondary">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          
          {/* Match & Fit Badges */}
          {(matchScore !== undefined && matchScore >= 40) && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5">
              <MatchBadge score={matchScore} reasons={matchReasons} />
              {fitIndicator && <FitIndicator fit={fitIndicator} />}
            </div>
          )}
          
          {/* Desktop hover actions */}
          <div className="hidden sm:flex absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex-col gap-2">
            <WishlistButton productId={product.id} />
            <Button size="icon" variant="secondary" className="shadow-lg touch-target">
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="gold"
              className="shadow-lg touch-target"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile always-visible wishlist */}
          <div className="sm:hidden absolute top-2 right-2">
            <WishlistButton productId={product.id} />
          </div>
        </div>
        <CardContent className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          <p className="text-xs text-accent font-medium">
            {getCategoryLabel(product.style)}
          </p>
          <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">{product.name}</h3>
          <p className="text-base sm:text-lg font-bold text-accent">
            ₦{product.price.toLocaleString()}
          </p>
          
          {/* Mobile: Single action button */}
          <div className="flex gap-2 pt-1 sm:pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10 touch-target"
            >
              <span className="sm:hidden">View</span>
              <span className="hidden sm:inline">Details</span>
            </Button>
            <Button 
              variant="gold" 
              size="sm" 
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10 touch-target"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Try On</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
