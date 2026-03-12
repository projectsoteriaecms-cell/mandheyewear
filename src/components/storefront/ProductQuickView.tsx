import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Star, ExternalLink } from "lucide-react";

// Placeholder images
import frame1 from "@/assets/frame-1.jpg";

interface ProductQuickViewProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickView = ({ productId, isOpen, onClose }: ProductQuickViewProps) => {
  const { data: product, isLoading } = useProduct(productId || "");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      onClose();
      navigate("/login");
      return;
    }
    if (product) {
      addToCart.mutate({ productId: product.id, quantity: 1 });
      onClose();
    }
  };

  const handleViewDetails = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : product ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{product.name}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                <img
                  src={product.image_url || frame1}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <WishlistButton productId={product.id} />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 flex flex-col">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {product.style || "Eyewear"}
                  </Badge>
                  <Badge variant="outline">
                    {product.brand_line === "m_and_h_fashion" ? "Lifestyle" : "Medical"}
                  </Badge>
                </div>

                {/* Title & SKU */}
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    {product.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">(12)</span>
                </div>

                {/* Price */}
                <p className="text-2xl font-bold text-accent">
                  ₦{product.price.toLocaleString()}
                </p>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                  </p>
                )}

                {/* Specs Preview */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {product.material && (
                    <div>
                      <span className="text-muted-foreground">Material:</span>{" "}
                      <span className="font-medium capitalize">{product.material}</span>
                    </div>
                  )}
                  {product.gender && (
                    <div>
                      <span className="text-muted-foreground">For:</span>{" "}
                      <span className="font-medium capitalize">{product.gender}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-1 flex flex-col justify-end pt-4 space-y-3">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" asChild className="w-full" onClick={handleViewDetails}>
                    <Link to={`/product/${product.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Full Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Product not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
