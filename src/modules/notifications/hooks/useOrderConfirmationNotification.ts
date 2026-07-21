import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { on } from "@/shared/lib/events";

/**
 * Reacts to orders.order_created without ever calling useOrders() -- decoupled
 * from the orders module's internal hooks, subscribed to its event instead.
 * Mount once at the app root (see App.tsx).
 *
 * Dedupes on order_id in metadata: OrderConfirmation.tsx re-emits on every
 * render where `order` is loaded (e.g. a page revisit), so this must not
 * create a second notification for the same order.
 */
export const useOrderConfirmationNotification = () => {
  useEffect(() => {
    return on("orders.order_created", async ({ orderId, userId, total }) => {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "new_order")
        .contains("metadata", { order_id: orderId })
        .maybeSingle();
      if (existing) return;

      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        title: "Order confirmed",
        message: `Your order for ₦${total.toLocaleString()} has been placed and is being processed.`,
        type: "new_order",
        link: `/order-confirmation/${orderId}`,
        metadata: { order_id: orderId },
      });
      if (error) {
        console.error("[useOrderConfirmationNotification] failed to create order notification:", error);
      }
    });
  }, []);
};
