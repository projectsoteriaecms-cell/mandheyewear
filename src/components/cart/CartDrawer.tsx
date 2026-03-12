import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/shared/hooks/useAuth";
import { Bag, Minus, Plus, Trash, CircleNotch } from "@phosphor-icons/react";

// Import placeholder images
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const placeholderImages = [frame1, frame2, frame3, frame4];

const getPlaceholderImage = (productId: string) => {
  const index = productId.charCodeAt(0) % placeholderImages.length;
  return placeholderImages[index];
};

export const CartDrawer = () => {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart, isLoading } =
    useCart();
  const { isAuthenticated } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bag weight="light" className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bag weight="light" className="h-5 w-5" />
            Your Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Bag weight="duotone" className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sign in to view your cart</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-[200px]">
                Create an account or sign in to start shopping
              </p>
              <Button variant="hero" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <CircleNotch weight="bold" className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <Bag weight="light" className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent/30" />
                <div className="absolute -bottom-1 -left-2 h-3 w-3 rounded-full bg-primary/30" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-[220px]">
                Discover our premium eyewear collection and find your perfect frames
              </p>
              <Button variant="hero" asChild>
                <Link to="/eyewear">Shop Eyewear</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border rounded-lg"
                >
                  {/* Product Image */}
                  <div className="h-20 w-20 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                    <img
                      src={
                        item.product?.image_url ||
                        getPlaceholderImage(item.product_id)
                      }
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="font-medium text-foreground hover:text-primary line-clamp-1"
                    >
                      {item.product?.name || "Product"}
                    </Link>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.product?.style || "Eyewear"}
                    </p>
                    <p className="font-bold text-accent mt-1">
                      ₦{(item.product?.price || 0).toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity.mutate({
                              cartItemId: item.id,
                              quantity: item.quantity - 1,
                            })
                          }
                          disabled={updateQuantity.isPending}
                        >
                          <Minus weight="bold" className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity.mutate({
                              cartItemId: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          disabled={updateQuantity.isPending}
                        >
                          <Plus weight="bold" className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart.mutate(item.id)}
                        disabled={removeFromCart.isPending}
                      >
                        <Trash weight="light" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && cartItems.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span className="text-accent">₦{cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
            <Button variant="hero" className="w-full" size="lg" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/eyewear">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
