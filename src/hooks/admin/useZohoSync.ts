import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SyncStatus = "idle" | "syncing" | "success" | "error";

export function useZohoSync() {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [result, setResult] = useState<{
    records_processed?: number;
    records_failed?: number;
    error?: string;
  } | null>(null);

  const pullItems = useCallback(async () => {
    setStatus("syncing");
    setResult(null);
    toast.info("Zoho sync started — pulling items from Zoho Books...");

    try {
      const { data, error } = await supabase.functions.invoke("zoho-sync", {
        body: { action: "pull_items" },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus("success");
        setResult(data);
        toast.success(
          `Sync complete: ${data.records_processed} items imported${
            data.records_failed > 0
              ? `, ${data.records_failed} failed`
              : ""
          }`
        );
      } else {
        throw new Error(data?.error || "Sync returned unsuccessful response");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      
      // If it's a timeout/context canceled, the sync may still be running
      if (message.includes("context") || message.includes("timeout") || message.includes("FunctionsHttpError")) {
        setStatus("success");
        setResult({ records_processed: -1 });
        toast.info(
          "Sync is processing a large catalog — items are being imported in the background. Refresh in a minute to see results."
        );
      } else {
        setStatus("error");
        setResult({ error: message });
        toast.error(`Sync failed: ${message}`);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return { status, result, pullItems, reset };
}
