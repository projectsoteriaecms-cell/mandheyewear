import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PurchaseOrder, CreatePurchaseOrderInput, PurchaseOrderStatus } from "../types";

export const usePurchaseOrders = (status?: PurchaseOrderStatus) => {
  return useQuery({
    queryKey: ["purchase-orders", status],
    queryFn: async () => {
      let query = supabase
        .from("purchase_orders")
        .select(`
          *,
          supplier:suppliers(id, name),
          branch:branches(id, name, city)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as PurchaseOrder[];
    },
  });
};

export const usePurchaseOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["purchase-order", orderId],
    queryFn: async () => {
      const { data: order, error: orderError } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          supplier:suppliers(id, name),
          branch:branches(id, name, city)
        `)
        .eq("id", orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!order) return null;

      const { data: items, error: itemsError } = await supabase
        .from("purchase_order_items")
        .select(`
          *,
          product:products(id, name, sku)
        `)
        .eq("purchase_order_id", orderId);

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: items || [],
      } as unknown as PurchaseOrder;
    },
    enabled: !!orderId,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePurchaseOrderInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const subtotal = input.items.reduce(
        (sum, item) => sum + item.quantity_ordered * item.unit_cost,
        0
      );

      // Create the purchase order
      const { data: order, error: orderError } = await supabase
        .from("purchase_orders")
        .insert([{
          order_number: `PO-${Date.now()}`, // Placeholder - trigger will override
          supplier_id: input.supplier_id,
          branch_id: input.branch_id,
          expected_delivery_date: input.expected_delivery_date || null,
          notes: input.notes || null,
          subtotal,
          total_amount: subtotal,
          created_by: user.id,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create the line items
      const itemsToInsert = input.items.map((item) => ({
        purchase_order_id: order.id,
        product_id: item.product_id,
        quantity_ordered: item.quantity_ordered,
        unit_cost: item.unit_cost,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create purchase order: ${error.message}`);
    },
  });
};

export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: PurchaseOrderStatus;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updates: Record<string, unknown> = { status };

      if (status === "approved") {
        updates.approved_by = user.id;
        updates.approved_at = new Date().toISOString();
      }

      if (status === "received") {
        updates.received_date = new Date().toISOString().split("T")[0];
      }

      const { data, error } = await supabase
        .from("purchase_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", variables.id] });
      toast.success(`Purchase order status updated to ${variables.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      items,
    }: {
      orderId: string;
      items: { id: string; quantity_received: number }[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update each item's quantity_received
      for (const item of items) {
        const { error } = await supabase
          .from("purchase_order_items")
          .update({ quantity_received: item.quantity_received })
          .eq("id", item.id);

        if (error) throw error;
      }

      // Check if all items are fully received
      const { data: orderItems, error: fetchError } = await supabase
        .from("purchase_order_items")
        .select("quantity_ordered, quantity_received")
        .eq("purchase_order_id", orderId);

      if (fetchError) throw fetchError;

      const allReceived = orderItems?.every(
        (item) => item.quantity_received >= item.quantity_ordered
      );
      const someReceived = orderItems?.some(
        (item) => item.quantity_received > 0
      );

      // Update order status
      const status = allReceived
        ? "received"
        : someReceived
        ? "partially_received"
        : "approved";

      const { error: statusError } = await supabase
        .from("purchase_orders")
        .update({
          status,
          received_date: allReceived
            ? new Date().toISOString().split("T")[0]
            : null,
        })
        .eq("id", orderId);

      if (statusError) throw statusError;

      return { status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["inventory-overview"] });
      toast.success("Goods received successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to receive goods: ${error.message}`);
    },
  });
};
