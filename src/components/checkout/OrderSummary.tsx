import { Separator } from "@/components/ui/separator";
import { Eyeglasses } from "@phosphor-icons/react";
import type { CartItem } from "@/modules/orders/hooks/useCart";

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

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shippingFee?: number;
  shippingZoneLabel?: string;
  deliveryEstimate?: string;
}

export const OrderSummary = ({
  cartItems,
  subtotal,
  shippingFee,
  shippingZoneLabel,
  deliveryEstimate,
}: OrderSummaryProps) => {
  // Fallback to flat rate if no zone provided
  const fee = shippingFee ?? (subtotal > 50000 ? 0 : 3500);
  const total = subtotal + fee;

  return (
    <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Order Summary</h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {cartItems.map((item) => {
          const framePrice = item.product?.price || 0;
          const lensPrice = (item as any).lens_price || 0;
          const lensType = (item as any).lens_type as string | undefined;
          const hasLens = lensType && lensType !== "frame_only";
          const itemTotal = (framePrice + lensPrice) * item.quantity;

          return (
            <div key={item.id} className="flex gap-3">
              <div
                className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0"
                style={{ background: "radial-gradient(ellipse at 50% 42%, #fdfcfa 0%, #f0ede6 55%, #e4e0d8 100%)" }}
              >
                <img
                  src={item.product?.image_url || getPlaceholderImage(item.product_id)}
                  alt={item.product?.name || "Product"}
                  className="h-full w-full object-contain p-[8%]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                  {item.product?.name}
                </p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>

                {/* Lens service sub-row */}
                {hasLens && (
                  <div className="mt-1 flex items-center gap-1 rounded bg-primary/5 border border-primary/15 px-1.5 py-0.5">
                    <Eyeglasses weight="duotone" className="h-3 w-3 text-primary shrink-0" />
                    <p className="text-[10px] font-medium text-foreground capitalize truncate">
                      {lensType!.replace(/_/g, " ")} lenses
                      {lensPrice > 0 ? ` • +₦${lensPrice.toLocaleString()}` : ""}
                    </p>
                  </div>
                )}

                <p className="text-sm font-semibold text-accent mt-0.5">
                  ₦{itemTotal.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Shipping{shippingZoneLabel ? ` (${shippingZoneLabel})` : ""}
          </span>
          <span>
            {fee === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `₦${fee.toLocaleString()}`
            )}
          </span>
        </div>
        {deliveryEstimate && (
          <p className="text-xs text-muted-foreground">
            Estimated delivery: {deliveryEstimate}
          </p>
        )}
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-accent">₦{total.toLocaleString()}</span>
      </div>
    </div>
  );
};
