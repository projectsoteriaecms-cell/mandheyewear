import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SeedImagesSource = "bundled" | "upload";
export type SeedImagesMode = "dry_run" | "commit";
export type SeedImagesTarget = "seed" | "anchor" | "both";

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
  target?: SeedImagesTarget;
  matched: number;
  unmatched: string[];
  unmatchedCount: number;
  uploaded: number;
  anchorUploaded?: number;
  uploads: Array<{ sku: string; url: string; action: string }>;
  anchorUploads?: Array<{ sku: string; path: string }>;
  errors: Array<{ sku: string; error: string }>;
  anchorLink?: {
    ok: boolean;
    scanned?: number;
    matched?: number;
    linked?: number;
    skipped?: number;
    errored?: number;
    error?: string;
  };
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
  target?: SeedImagesTarget;
  skipFilled: boolean;
  files?: SeedImageFile[];
}

export function useSeedImages() {
  return useMutation({
    mutationFn: async (args: Args): Promise<SeedImagesDryRunResult | SeedImagesCommitResult> => {
      const { data, error } = await supabase.functions.invoke("seed-product-images", { body: args });
      if (error) throw error;
      const result = data as SeedImagesDryRunResult | SeedImagesCommitResult;

      // After a commit that uploaded anchor files, auto-run link-anchor-images
      // with bg-removal skipped (the bundled PNGs already have transparent bg).
      if (
        result.mode === "commit" &&
        (args.target === "anchor" || args.target === "both") &&
        (result as SeedImagesCommitResult).anchorUploaded
      ) {
        try {
          const { data: linkData, error: linkErr } = await supabase.functions.invoke(
            "link-anchor-images",
            { body: { dryRun: false, skipBgRemoval: true } }
          );
          if (linkErr) throw linkErr;
          (result as SeedImagesCommitResult).anchorLink = linkData;
        } catch (e) {
          (result as SeedImagesCommitResult).anchorLink = {
            ok: false,
            error: (e as Error).message,
          };
        }
      }

      return result;
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
