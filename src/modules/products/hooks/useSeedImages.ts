import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SeedImagesSource = "bundled" | "upload";
export type SeedImagesMode = "dry_run" | "commit";

export interface SeedImagesPlanEntry {
  sku: string;
  filename: string;
  action: "set_primary" | "append_additional" | "skip" | "unmatched";
  hadPrimary: boolean;
  sizeBytes: number;
}

export interface SeedImagesDryRunResult {
  mode: "dry_run";
  matched: number;
  unmatched: string[];
  unmatchedCount: number;
  wouldUpload: number;
  plan: SeedImagesPlanEntry[];
}

export interface SeedImagesCommitResult {
  mode: "commit";
  matched: number;
  unmatched: string[];
  unmatchedCount: number;
  uploaded: number;
  uploads: Array<{ sku: string; url: string; action: string }>;
  errors: Array<{ sku: string; error: string }>;
}

export interface SeedImageFile {
  sku?: string;
  filename: string;
  contentType?: string;
  dataBase64: string;
}

interface Args {
  mode: SeedImagesMode;
  source: SeedImagesSource;
  skipFilled: boolean;
  files?: SeedImageFile[];
}

export function useSeedImages() {
  return useMutation({
    mutationFn: async (args: Args): Promise<SeedImagesDryRunResult | SeedImagesCommitResult> => {
      const { data, error } = await supabase.functions.invoke("seed-product-images", { body: args });
      if (error) throw error;
      return data as SeedImagesDryRunResult | SeedImagesCommitResult;
    },
  });
}

export async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
  }
  return btoa(binary);
}
