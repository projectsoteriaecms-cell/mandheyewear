import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SeedSource = "bundled" | "upload";
export type SeedMode = "dry_run" | "commit";

export interface SeedChange {
  sku: string;
  product_id: string;
  productChanges: Record<string, { from: unknown; to: unknown }>;
  frameChanges: Record<string, { from: unknown; to: unknown }>;
  skipped: boolean;
}

export interface SeedDryRunResult {
  mode: "dry_run";
  matched: number;
  unmatched: string[];
  unmatchedCount: number;
  wouldChange: number;
  skipped: number;
  changes: SeedChange[];
}

export interface SeedCommitResult {
  mode: "commit";
  matched: number;
  unmatched: string[];
  unmatchedCount: number;
  productsUpdated: number;
  framesUpserted: number;
  errors: Array<{ sku: string; error: string }>;
}

export interface SeedOverride {
  sku: string;
  productPatch: Record<string, unknown>;
  framePatch: Record<string, unknown>;
  skip?: boolean;
}

interface SeedArgs {
  mode: SeedMode;
  source: SeedSource;
  skipFilled: boolean;
  payload?: { rich?: Record<string, unknown>; structured?: Record<string, unknown> };
  overrides?: SeedOverride[];
}

export function useSeedDescriptions() {
  return useMutation({
    mutationFn: async (args: SeedArgs): Promise<SeedDryRunResult | SeedCommitResult> => {
      const { data, error } = await supabase.functions.invoke("seed-product-descriptions", {
        body: args,
      });
      if (error) throw error;
      return data as SeedDryRunResult | SeedCommitResult;
    },
  });
}
