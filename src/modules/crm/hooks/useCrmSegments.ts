import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { classifySbError } from "@/lib/supabase-errors";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import type { RuleTree } from "../lib/rule-tree";

// rules_json is stored as `Json` in the DB but is always a RuleTree in our
// domain. These tiny asserts bridge the two without weakening call sites.
const asJson = (t: RuleTree): Json => t as unknown as Json;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CrmSegment {
  id:               string;
  name:             string;
  description:      string | null;
  rules_json:       RuleTree;
  member_count:     number;
  last_computed_at: string | null;
  created_at:       string;
  updated_at:       string;
}

export interface SegmentInput {
  name:        string;
  description?: string | null;
  rules_json:  RuleTree;
}

// ── useCrmSegments — list ──────────────────────────────────────────────────────

export function useCrmSegments() {
  return useQuery({
    queryKey: ["crm_segments"],
    staleTime: 60_000,
    queryFn: async (): Promise<CrmSegment[]> => {
      const { data, error } = await supabase
        .from("crm_segments")
        .select("id, name, description, rules_json, member_count, last_computed_at, created_at, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CrmSegment[];
    },
  });
}

// ── useSegmentRulesCount — live count for the editor (uses live view) ───────────
// Calls crm_count_segment_members(rules_json) so the editor can show
// "this segment matches N contacts" before saving.

export function useSegmentRulesCount(rules: RuleTree | null) {
  return useQuery({
    queryKey: ["crm_segment_rules_count", rules ? JSON.stringify(rules) : null],
    enabled:  !!rules,
    staleTime: 15_000,
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc("crm_count_segment_members", {
        p_rules_json: asJson(rules),
      });
      if (error) throw error;
      return typeof data === "number" ? data : 0;
    },
  });
}

// ── useCreateSegment ────────────────────────────────────────────────────────────

export function useCreateSegment() {
  const qc = useQueryClient();
  return useMutation<CrmSegment, Error, SegmentInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from("crm_segments")
        .insert({
          name:        input.name,
          description: input.description ?? null,
          rules_json:  asJson(input.rules_json),
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CrmSegment;
    },
    onSuccess: () => {
      toast.success("Segment created.");
      qc.invalidateQueries({ queryKey: ["crm_segments"] });
    },
    onError: (err) => toast.error(classifySbError(err).detail),
  });
}

// ── useUpdateSegment ────────────────────────────────────────────────────────────

export function useUpdateSegment() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string } & Partial<SegmentInput>>({
    mutationFn: async ({ id, ...patch }) => {
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.name !== undefined)        update.name = patch.name;
      if (patch.description !== undefined) update.description = patch.description;
      if (patch.rules_json !== undefined)  update.rules_json = patch.rules_json;

      const { error } = await supabase.from("crm_segments").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Segment updated.");
      qc.invalidateQueries({ queryKey: ["crm_segments"] });
    },
    onError: (err) => toast.error(classifySbError(err).detail),
  });
}

// ── useDeleteSegment ────────────────────────────────────────────────────────────

export function useDeleteSegment() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("crm_segments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Segment deleted.");
      qc.invalidateQueries({ queryKey: ["crm_segments"] });
    },
    onError: (err) => {
      // FK restrict: a campaign still references this segment
      const c = classifySbError(err);
      toast.error(
        c.detail.includes("foreign key") || err.message.includes("violates foreign key")
          ? "Can't delete — a campaign still uses this segment."
          : c.detail,
      );
    },
  });
}
