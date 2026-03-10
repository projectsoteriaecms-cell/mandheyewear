import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Minus, Plus, Camera, Loader2, Heart, LogIn } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

interface AddToCartSectionProps {
  product: Product;
}

export const AddToCartSection = ({ product }: AddToCartSectionProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      {/* Price */}
      <div>
        <p className="text-3xl font-bold text-accent">
          ₦{product.price.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {product.currency || "NGN"} • VAT inclusive
        </p>
      </div>

      {/* Quantity Selector */}
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

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
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

        <div className="flex gap-3">
          <Button variant="gold" className="flex-1">
            <Camera className="mr-2 h-4 w-4" />
            Virtual Try-On
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
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
