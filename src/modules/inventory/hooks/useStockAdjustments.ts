import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { toast } from "sonner";
import type { StockAdjustment, CreateAdjustmentData } from "../types";

export const useStockAdjustments = (branchId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const adjustmentsQuery = useQuery({
    queryKey: ["stock-adjustments", branchId],
    queryFn: async () => {
      let query = supabase
        .from("stock_adjustments")
        .select(`
          *,
          product:products(id, name, sku),
          branch:branches(id, name)
        `)
        .order("created_at", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as StockAdjustment[];
    },
  });

  const createAdjustment = useMutation({
    mutationFn: async (data: CreateAdjustmentData) => {
      if (!user?.id) throw new Error("User not authenticated");

      // First get current inventory level
      const { data: inventory, error: inventoryError } = await supabase
        .from("inventory")
        .select("quantity_on_hand")
        .eq("branch_id", data.branch_id)
        .eq("product_id", data.product_id)
        .maybeSingle();

      if (inventoryError) throw inventoryError;

      const quantityBefore = inventory?.quantity_on_hand ?? 0;
      const quantityAfter = quantityBefore + data.quantity_change;

      if (quantityAfter < 0) {
        throw new Error("Adjustment would result in negative inventory");
      }

      // Create the adjustment record
      const { data: adjustment, error: adjustmentError } = await supabase
        .from("stock_adjustments")
        .insert({
          branch_id: data.branch_id,
          product_id: data.product_id,
          adjustment_type: data.adjustment_type,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          quantity_change: data.quantity_change,
          reason: data.reason,
          performed_by: user.id,
        })
        .select()
        .single();

      if (adjustmentError) throw adjustmentError;

      // Update inventory
      if (inventory) {
        const { error: updateError } = await supabase
          .from("inventory")
          .update({ quantity_on_hand: quantityAfter })
          .eq("branch_id", data.branch_id)
          .eq("product_id", data.product_id);

        if (updateError) throw updateError;
      } else {
        // Create inventory record if it doesn't exist
        const { error: insertError } = await supabase
          .from("inventory")
          .insert({
            branch_id: data.branch_id,
            product_id: data.product_id,
            quantity_on_hand: quantityAfter,
          });

        if (insertError) throw insertError;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("inventory_transactions")
        .insert({
          branch_id: data.branch_id,
          product_id: data.product_id,
          transaction_type: "adjustment",
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          quantity_change: data.quantity_change,
          reference_type: "stock_adjustment",
          reference_id: adjustment.id,
          performed_by: user.id,
          notes: `${data.adjustment_type}: ${data.reason}`,
        });

      if (transactionError) throw transactionError;

      return adjustment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Stock adjustment created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create stock adjustment");
    },
  });

  return {
    adjustments: adjustmentsQuery.data ?? [],
    isLoading: adjustmentsQuery.isLoading,
    error: adjustmentsQuery.error,
    createAdjustment,
  };
};
