import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/hooks/useProducts";

// Import placeholder images for products without images
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const placeholderImages = [frame1, frame2, frame3, frame4];

interface ProductCardProps {
  product: Product;
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

export const ProductCard = ({ product }: ProductCardProps) => {
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
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-gold transition-all cursor-pointer">
        <div className="relative h-64 overflow-hidden bg-secondary">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
            <Button size="icon" variant="secondary" className="shadow-lg">
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="gold"
              className="shadow-lg"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs text-accent font-medium">
            {getCategoryLabel(product.style)}
          </p>
          <h3 className="font-semibold text-foreground">{product.name}</h3>
          <p className="text-lg font-bold text-accent">
            ₦{product.price.toLocaleString()}
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              Details
            </Button>
            <Button variant="gold" size="sm" className="flex-1">
              Try On
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
