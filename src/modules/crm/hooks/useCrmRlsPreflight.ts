import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { classifySbError } from "@/lib/supabase-errors";

export type PreflightReason =
  | "authorized"
  | "not_authenticated"
  | "insufficient_role"
  | "preflight_error";

export interface CrmPreflightResult {
  ok: boolean;
  reason: PreflightReason;
  message: string;
  role?: "super_admin" | "branch_manager" | "branch_staff";
}

export function useCrmRlsPreflight() {
  return useQuery<CrmPreflightResult>({
    queryKey: ["crm_rls_preflight"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("crm_rls_preflight" as any);

      if (error) {
        const classified = classifySbError(error);
        return {
          ok: false,
          reason: "preflight_error" as PreflightReason,
          message: classified.isRls
            ? classified.detail
            : `Permission check failed: ${classified.detail}`,
        };
      }

      return data as CrmPreflightResult;
    },
    // Cache for 2 minutes — roles don't change often
    staleTime: 2 * 60_000,
    retry: false,
  });
}
