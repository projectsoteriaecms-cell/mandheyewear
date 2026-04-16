import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type OrderStatus = Database["public"]["Enums"]["order_status"];

const SHIPPED_STATUSES: OrderStatus[] = [
  "shipped",
  "shipped_local",
  "shipped_interstate",
  "shipped_international",
];

interface UpdateOrderStatusParams {
  orderId: string;
  newStatus: OrderStatus;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
  logisticsPartner?: string | null;
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
      trackingNumber,
      estimatedDeliveryDate,
      logisticsPartner,
    }: UpdateOrderStatusParams) => {
      // Build update payload
      const updatePayload: Record<string, unknown> = {
        order_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (SHIPPED_STATUSES.includes(newStatus)) {
        updatePayload.shipped_at = new Date().toISOString();
        if (trackingNumber) updatePayload.tracking_number = trackingNumber;
        if (estimatedDeliveryDate) updatePayload.estimated_delivery_date = estimatedDeliveryDate;
        if (logisticsPartner) updatePayload.logistics_partner = logisticsPartner;
      }

      if (newStatus === "delivered") {
        updatePayload.delivered_at = new Date().toISOString();
      }

      // Update order
      const { error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId);

      if (error) throw error;

      // Fetch order details for email
      const { data: order } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (name, price, image_url)
          )
        `)
        .eq("id", orderId)
        .single();

      if (!order) return;

      // Get customer profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name, phone_number")
        .eq("user_id", order.user_id)
        .single();

      if (!profile?.email) {
        console.log("No customer email found, skipping notification");
        return;
      }

      // Determine email type
      let emailType: string | null = null;
      if (SHIPPED_STATUSES.includes(newStatus)) {
        emailType = "shipping";
      } else if (newStatus === "delivered") {
        emailType = "delivery";
      }

      if (!emailType) return;

      // Send notification email (non-blocking)
      const shippingAddress = (order.shipping_address as Record<string, string>) || {};
      const notificationPayload = {
        type: emailType,
        order_id: order.id,
        order_number: order.order_number,
        customer_name: profile.full_name || shippingAddress.full_name || "Customer",
        customer_email: profile.email,
        customer_phone: profile.phone_number || shippingAddress.phone || "",
        shipping_address: shippingAddress,
        shipping_zone: order.shipping_zone,
        shipping_fee: order.shipping_fee || 0,
        total_amount: order.total_amount,
        payment_reference: order.payment_reference || "",
        currency: order.currency || "NGN",
        tracking_number: order.tracking_number || trackingNumber,
        estimated_delivery_date: order.estimated_delivery_date || estimatedDeliveryDate,
        logistics_partner: order.logistics_partner || logisticsPartner,
        items: (order.order_items || []).map((oi: any) => ({
          product_name: oi.products?.name || "Product",
          quantity: oi.quantity,
          price: oi.price_at_purchase,
        })),
      };

      supabase.functions
        .invoke("send-order-notification", { body: notificationPayload })
        .catch((err) => console.warn("Order notification failed (non-blocking):", err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated — notification sent");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};
