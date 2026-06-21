import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SegmentEvalStatus = "pending" | "running" | "succeeded" | "failed";

export interface SegmentEvalJob {
  segment_id: string;
  status: SegmentEvalStatus;
  attempt_count: number;
  max_attempts: number;
  last_error: string | null;
  next_retry_at: string | null;
  completed_at: string | null;
  enqueued_at: string;
  updated_at: string;
}

/** Returns the current eval queue state for all segments. */
export function useSegmentEvalQueue() {
  return useQuery({
    queryKey: ["crm_segment_eval_queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_segment_eval_queue")
        .select("*")
        .order("enqueued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SegmentEvalJob[];
    },
    refetchInterval: 5_000, // poll every 5s while any job is running
    refetchIntervalInBackground: false,
  });
}

/** Returns the eval queue entry for a single segment. */
export function useSegmentEvalStatus(segmentId: string) {
  return useQuery({
    queryKey: ["crm_segment_eval_queue", segmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_segment_eval_queue")
        .select("*")
        .eq("segment_id", segmentId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as SegmentEvalJob | null;
    },
    refetchInterval: (query) => {
      const status = (query.state.data as SegmentEvalJob | null)?.status;
      return status === "pending" || status === "running" ? 3_000 : false;
    },
  });
}

/** Enqueues a segment for (re-)evaluation and invokes the Edge Function. */
export function useEnqueueSegmentEval() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (segmentId: string) => {
      // Enqueue via RPC so the DB row is immediately visible (even if EF is slow)
      const { error: rpcErr } = await supabase.rpc(
        "crm_enqueue_segment_eval",
        { p_segment_id: segmentId },
      );
      if (rpcErr) throw rpcErr;

      // Invoke the Edge Function to process the job
      const { error: fnErr } = await supabase.functions.invoke(
        "process-segment-queue",
        { body: { segment_id: segmentId } },
      );
      if (fnErr) throw fnErr;
    },
    onMutate: async (segmentId) => {
      // Optimistic update — show "pending" immediately
      await qc.cancelQueries({ queryKey: ["crm_segment_eval_queue", segmentId] });
      qc.setQueryData(
        ["crm_segment_eval_queue", segmentId],
        (old: SegmentEvalJob | null) => ({
          ...(old ?? {}),
          segment_id: segmentId,
          status: "pending",
          attempt_count: 0,
          enqueued_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as SegmentEvalJob),
      );
    },
    onSuccess: (_data, segmentId) => {
      qc.invalidateQueries({ queryKey: ["crm_segment_eval_queue"] });
      qc.invalidateQueries({ queryKey: ["crm_segment_eval_queue", segmentId] });
      qc.invalidateQueries({ queryKey: ["crm_segments"] });
    },
    onError: (err: any) => {
      toast.error(`Segment eval failed: ${err.message ?? "unknown error"}`);
    },
  });
}
