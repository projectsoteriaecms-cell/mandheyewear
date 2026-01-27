import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { StockTransfer, CreateStockTransferInput, TransferStatus } from "../types";

export const useStockTransfers = (status?: TransferStatus) => {
  return useQuery({
    queryKey: ["stock-transfers", status],
    queryFn: async () => {
      let query = supabase
        .from("stock_transfers")
        .select(`
          *,
          from_branch:branches!stock_transfers_from_branch_id_fkey(id, name, city),
          to_branch:branches!stock_transfers_to_branch_id_fkey(id, name, city)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as StockTransfer[];
    },
  });
};

export const useStockTransfer = (transferId: string) => {
  return useQuery({
    queryKey: ["stock-transfer", transferId],
    queryFn: async () => {
      const { data: transfer, error: transferError } = await supabase
        .from("stock_transfers")
        .select(`
          *,
          from_branch:branches!stock_transfers_from_branch_id_fkey(id, name, city),
          to_branch:branches!stock_transfers_to_branch_id_fkey(id, name, city)
        `)
        .eq("id", transferId)
        .maybeSingle();

      if (transferError) throw transferError;
      if (!transfer) return null;

      const { data: items, error: itemsError } = await supabase
        .from("stock_transfer_items")
        .select(`
          *,
          product:products(id, name, sku)
        `)
        .eq("stock_transfer_id", transferId);

      if (itemsError) throw itemsError;

      return {
        ...transfer,
        items: items || [],
      } as unknown as StockTransfer;
    },
    enabled: !!transferId,
  });
};

export const useCreateStockTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStockTransferInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the transfer
      const { data: transfer, error: transferError } = await supabase
        .from("stock_transfers")
        .insert([{
          from_branch_id: input.from_branch_id,
          to_branch_id: input.to_branch_id,
          notes: input.notes || null,
          initiated_by: user.id,
          transfer_number: `TRF-${Date.now()}`, // Will be overwritten by trigger
        }])
        .select()
        .single();

      if (transferError) throw transferError;

      // Create the line items
      const itemsToInsert = input.items.map((item) => ({
        stock_transfer_id: transfer.id,
        product_id: item.product_id,
        quantity_requested: item.quantity_requested,
      }));

      const { error: itemsError } = await supabase
        .from("stock_transfer_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return transfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      toast.success("Stock transfer created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create transfer: ${error.message}`);
    },
  });
};

export const useUpdateTransferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      items,
    }: {
      id: string;
      status: TransferStatus;
      items?: { id: string; quantity_sent?: number; quantity_received?: number }[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update items if provided
      if (items) {
        for (const item of items) {
          const updates: Record<string, number> = {};
          if (item.quantity_sent !== undefined) {
            updates.quantity_sent = item.quantity_sent;
          }
          if (item.quantity_received !== undefined) {
            updates.quantity_received = item.quantity_received;
          }

          if (Object.keys(updates).length > 0) {
            const { error } = await supabase
              .from("stock_transfer_items")
              .update(updates)
              .eq("id", item.id);

            if (error) throw error;
          }
        }
      }

      // Update transfer status
      const updates: Record<string, unknown> = { status };

      if (status === "in_transit") {
        updates.shipped_at = new Date().toISOString();
      }

      if (status === "received") {
        updates.received_by = user.id;
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("stock_transfers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["stock-transfer", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-overview"] });
      toast.success(`Transfer status updated to ${variables.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update transfer: ${error.message}`);
    },
  });
};
