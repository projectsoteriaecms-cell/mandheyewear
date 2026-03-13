import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncResult {
  records_processed?: number;
  records_failed?: number;
  matched_existing?: number;
  new_products?: number;
  current_page?: number;
  stock_updated?: number;
  stock_skipped?: number;
  error?: string;
}

export function useZohoSync() {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [result, setResult] = useState<SyncResult | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  const invalidateProductQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, [queryClient]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const pollSyncLog = useCallback((syncId: string) => {
    syncIdRef.current = syncId;
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from("zoho_sync_log")
        .select("status, records_processed, records_failed, metadata")
        .eq("id", syncId)
        .single();

      if (!data) return;

      const meta = data.metadata as Record<string, unknown> | null;
      setResult({
        records_processed: data.records_processed ?? 0,
        records_failed: data.records_failed ?? 0,
        matched_existing: (meta?.matched_existing as number) ?? 0,
        new_products: (meta?.new_products as number) ?? 0,
        current_page: (meta?.current_page as number) ?? undefined,
        stock_updated: (meta?.stock_updated as number) ?? 0,
        stock_skipped: (meta?.stock_skipped as number) ?? 0,
      });

      if (data.status !== "pending") {
        stopPolling();
        const matched = (meta?.matched_existing as number) ?? 0;
        if (data.status === "success") {
          setStatus("success");
          invalidateProductQueries();
          const parts = [`${data.records_processed} items synced`];
          if (matched > 0) parts.push(`${matched} linked to existing`);
          if ((data.records_failed ?? 0) > 0) parts.push(`${data.records_failed} failed`);
          const stockUp = (meta?.stock_updated as number) ?? 0;
          if (stockUp > 0) parts.push(`${stockUp} stock levels updated`);
          toast.success(`Sync complete: ${parts.join(", ")}`);
        } else {
          setStatus("error");
          invalidateProductQueries();
          toast.error(`Sync finished with errors. ${data.records_processed} processed, ${data.records_failed} failed.`);
        }
      }
    }, 3000);
  }, [stopPolling]);

  const pullItems = useCallback(async () => {
    setStatus("syncing");
    setResult(null);
    toast.info("Zoho sync started — pulling items from Zoho Books...");

    try {
      const { data, error } = await supabase.functions.invoke("zoho-sync", {
        body: { action: "pull_items" },
      });

      if (error) throw error;

      if (data?.sync_id) {
        if (data.has_more) {
          setResult({
            records_processed: data.page_1_processed,
            matched_existing: data.page_1_matched ?? 0,
            new_products: data.page_1_new ?? 0,
            current_page: 1,
          });
          pollSyncLog(data.sync_id);
        } else {
          setStatus("success");
          setResult({
            records_processed: data.page_1_processed,
            records_failed: 0,
            matched_existing: data.page_1_matched ?? 0,
            new_products: data.page_1_new ?? 0,
          });
          invalidateProductQueries();
          const parts = [`${data.page_1_processed} items synced`];
          if ((data.page_1_matched ?? 0) > 0) parts.push(`${data.page_1_matched} linked to existing`);
          toast.success(`Sync complete: ${parts.join(", ")}`);
        }
      } else {
        throw new Error(data?.error || "Sync returned no sync_id");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setStatus("error");
      setResult({ error: message });
      toast.error(`Sync failed: ${message}`);
    }
  }, [pollSyncLog]);

  const linkProduct = useCallback(async (productId: string, zohoItemId: string) => {
    const { data, error } = await supabase.functions.invoke("zoho-sync", {
      body: { action: "link_product", product_id: productId, zoho_item_id: zohoItemId },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setStatus("idle");
    setResult(null);
  }, [stopPolling]);

  return { status, result, pullItems, linkProduct, reset };
}
