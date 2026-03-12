import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEnrichProducts() {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState<{ enriched: number; remaining: number } | null>(null);

  const handleEnrichProducts = useCallback(async () => {
    setIsEnriching(true);
    setEnrichProgress(null);
    let totalEnriched = 0;
    let totalFailed = 0;
    try {
      let done = false;
      while (!done) {
        const { data, error } = await supabase.functions.invoke("enrich-products", {
          body: { maxProducts: 100 },
        });
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);
        totalEnriched += data.enriched || 0;
        totalFailed += data.failed || 0;
        setEnrichProgress({ enriched: totalEnriched, remaining: data.remaining || 0 });
        done = data.done;
        if (!done) await new Promise((r) => setTimeout(r, 500));
      }
      toast.success(`Enrichment complete: ${totalEnriched} products updated${totalFailed > 0 ? `, ${totalFailed} failed` : ""}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Enrichment failed: ${msg}`);
    } finally {
      setIsEnriching(false);
      setEnrichProgress(null);
    }
  }, []);

  return { isEnriching, enrichProgress, handleEnrichProducts };
}
