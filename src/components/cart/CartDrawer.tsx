import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { usePrescriptions } from "@/modules/prescriptions/hooks/usePrescriptions";
import { LensConfigurator, type LensConfig } from "@/modules/lens/components/LensConfigurator";
import { Bag, Minus, Plus, Trash, CircleNotch, Eyeglasses, Warning, PencilSimple } from "@phosphor-icons/react";

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
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart, updateCartItemLens, isLoading } =
    useCart();
  const { isAuthenticated } = useAuth();
  const { activePrescriptions } = usePrescriptions();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const editingItem = editingItemId ? cartItems.find(i => i.id === editingItemId) : null;

  const hasRxItems = cartItems.some(
    (item) => (item as any).lens_type && (item as any).lens_type !== "frame_only"
  );
  const hasValidRx = activePrescriptions.length > 0;

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent><p>Cart</p></TooltipContent>
      </Tooltip>
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
                <Link to="/shop">Shop Eyewear</Link>
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
                  <div
                    className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0"
                    style={{ background: "radial-gradient(ellipse at 50% 42%, #fdfcfa 0%, #f0ede6 55%, #e4e0d8 100%)" }}
                  >
                    <img
                      src={
                        item.product?.image_url ||
                        getPlaceholderImage(item.product_id)
                      }
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-contain p-[8%]"
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
                      ₦{((item.product?.price || 0) + ((item as any).lens_price || 0)).toLocaleString()}
                    </p>

                    {/* Lens service sub-row */}
                    {(item as any).lens_type && (item as any).lens_type !== "frame_only" ? (
                      <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-primary/5 border border-primary/15 px-2 py-1.5">
                        <Eyeglasses weight="duotone" className="h-3.5 w-3.5 text-primary shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-foreground leading-tight capitalize">
                            {((item as any).lens_type as string).replace(/_/g, " ")} lenses
                          </p>
                          {(item as any).lens_price > 0 ? (
                            <p className="text-[11px] text-accent font-semibold leading-tight">
                              +₦{((item as any).lens_price as number).toLocaleString()}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground leading-tight">Included</p>
                          )}
                        </div>
                        <button
                          className="ml-auto text-[10px] text-primary/70 hover:text-primary flex items-center gap-0.5 shrink-0"
                          onClick={() => setEditingItemId(item.id)}
                        >
                          <PencilSimple className="h-3 w-3" />
                          Edit
                        </button>
                      </div>
                    ) : item.product?.item_type === "frames" ? (
                      /* Frame without lens config — invite user to add lenses */
                      <button
                        className="mt-1.5 text-[11px] text-primary/60 hover:text-primary flex items-center gap-1"
                        onClick={() => setEditingItemId(item.id)}
                      >
                        <PencilSimple className="h-3 w-3" />
                        Add prescription lenses
                      </button>
                    ) : null}

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
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span className="text-accent">₦{cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>

            {/* Rx warning banner */}
            {hasRxItems && !hasValidRx && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-3 py-2.5">
                <Warning weight="fill" className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    Prescription required
                  </p>
                  <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                    Your cart includes prescription lenses.{" "}
                    <Link
                      to="/dashboard?tab=prescriptions"
                      className="underline font-semibold hover:text-amber-900"
                    >
                      Add a prescription
                    </Link>{" "}
                    before checkout to avoid delays.
                  </p>
                </div>
              </div>
            )}

            <Button variant="hero" className="w-full" size="lg" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </SheetContent>

      {/* Lens configurator — opens when user clicks "Edit lenses" on a cart item */}
      {editingItem && editingItem.product && (
        <LensConfigurator
          open={!!editingItemId}
          onOpenChange={(open) => { if (!open) setEditingItemId(null); }}
          productName={editingItem.product.name || "Frame"}
          productId={editingItem.product_id}
          onConfirm={(config: LensConfig) => {
            updateCartItemLens.mutate({
              cartItemId: editingItem.id,
              lensConfig: {
                lens_type: config.lensType,
                lens_index: config.lensIndex ?? null,
                lens_coatings: config.lensCoatings ?? null,
                lens_price: config.lensPrice ?? 0,
                prescription_id: config.prescriptionId ?? null,
                prescription_data: config.prescriptionData as Record<string, unknown> ?? null,
                requires_fitting: config.requiresFitting ?? false,
                fitting_booked: false,
                frame_only: !config.lensType || config.lensType === "frame_only",
              },
            });
            setEditingItemId(null);
          }}
        />
      )}
    </Sheet>
  );
};
