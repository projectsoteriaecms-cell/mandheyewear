import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SyncStatus = "idle" | "syncing" | "success" | "error";

export function useZohoSync() {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [result, setResult] = useState<{
    records_processed?: number;
    records_failed?: number;
    current_page?: number;
    error?: string;
  } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Cleanup on unmount
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
        current_page: (meta?.current_page as number) ?? undefined,
      });

      if (data.status !== "pending") {
        stopPolling();
        if (data.status === "success") {
          setStatus("success");
          toast.success(
            `Sync complete: ${data.records_processed} items imported${
              (data.records_failed ?? 0) > 0 ? `, ${data.records_failed} failed` : ""
            }`
          );
        } else {
          setStatus("error");
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
        // Start polling if there are more pages
        if (data.has_more) {
          setResult({ records_processed: data.page_1_processed, current_page: 1 });
          pollSyncLog(data.sync_id);
        } else {
          // Single page — done immediately
          setStatus("success");
          setResult({ records_processed: data.page_1_processed, records_failed: 0 });
          toast.success(`Sync complete: ${data.page_1_processed} items imported`);
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

  const reset = useCallback(() => {
    stopPolling();
    setStatus("idle");
    setResult(null);
  }, [stopPolling]);

  return { status, result, pullItems, reset };
}
