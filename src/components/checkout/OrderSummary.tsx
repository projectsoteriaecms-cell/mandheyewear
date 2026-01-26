import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@/hooks/useCart";

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
}

export const OrderSummary = ({ cartItems, subtotal }: OrderSummaryProps) => {
  const shippingFee = subtotal > 50000 ? 0 : 3500; // Free shipping over ₦50,000
  const total = subtotal + shippingFee;

  return (
    <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Order Summary</h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
              <img
                src={item.product?.image_url || getPlaceholderImage(item.product_id)}
                alt={item.product?.name || "Product"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                {item.product?.name}
              </p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              <p className="text-sm font-semibold text-accent">
                ₦{((item.product?.price || 0) * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {shippingFee === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `₦${shippingFee.toLocaleString()}`
            )}
          </span>
        </div>
        {subtotal > 0 && subtotal <= 50000 && (
          <p className="text-xs text-muted-foreground">
            Add ₦{(50000 - subtotal).toLocaleString()} more for free shipping
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
