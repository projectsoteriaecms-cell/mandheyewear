import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import type { ParsedProduct, ValidationError } from "@/lib/ecms-parser";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type FrameAttributesInsert = Database["public"]["Tables"]["frame_attributes"]["Insert"];

export type DuplicateHandling = "skip" | "update" | "fail";

export interface ImportOptions {
  batchSize: number;
  duplicateHandling: DuplicateHandling;
  createFrameAttributes: boolean;
}

export interface ImportProgress {
  total: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  errors: ValidationError[];
}

export interface ImportResult {
  success: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ValidationError[];
}

export const useECMSImport = () => {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const checkDuplicates = useCallback(
    async (products: ParsedProduct[]): Promise<Map<string, string>> => {
      const skus = products.map((p) => p.sku);
      const externalIds = products.map((p) => p.external_id).filter(Boolean) as string[];

      const duplicateMap = new Map<string, string>();

      // Check by SKU
      if (skus.length > 0) {
        const { data: existingBySku } = await supabase
          .from("products")
          .select("id, sku")
          .in("sku", skus);

        if (existingBySku) {
          existingBySku.forEach((p) => {
            duplicateMap.set(`sku:${p.sku}`, p.id);
          });
        }
      }

      // Check by external_id
      if (externalIds.length > 0) {
        const { data: existingByExternal } = await supabase
          .from("products")
          .select("id, external_id")
          .in("external_id", externalIds);

        if (existingByExternal) {
          existingByExternal.forEach((p) => {
            if (p.external_id) {
              duplicateMap.set(`external:${p.external_id}`, p.id);
            }
          });
        }
      }

      return duplicateMap;
    },
    []
  );

  const importProducts = useCallback(
    async (
      products: ParsedProduct[],
      options: ImportOptions
    ): Promise<ImportResult> => {
      setIsImporting(true);
      setIsCancelled(false);

      const { batchSize, duplicateHandling, createFrameAttributes } = options;
      const totalBatches = Math.ceil(products.length / batchSize);

      const result: ImportResult = {
        success: true,
        inserted: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      };

      setProgress({
        total: products.length,
        processed: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches,
        errors: [],
      });

      try {
        // Check all duplicates upfront
        const duplicateMap = await checkDuplicates(products);

        for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
          if (isCancelled) {
            toast.info("Import cancelled");
            break;
          }

          const start = batchNum * batchSize;
          const end = Math.min(start + batchSize, products.length);
          const batch = products.slice(start, end);

          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  currentBatch: batchNum + 1,
                }
              : null
          );

          for (let i = 0; i < batch.length; i++) {
            if (isCancelled) break;

            const product = batch[i];
            const rowNum = start + i + 2; // +2 for header row and 1-indexing

            try {
              // Check for duplicates
              const existingId =
                duplicateMap.get(`sku:${product.sku}`) ||
                (product.external_id
                  ? duplicateMap.get(`external:${product.external_id}`)
                  : undefined);

              if (existingId) {
                if (duplicateHandling === "skip") {
                  result.skipped++;
                  continue;
                } else if (duplicateHandling === "fail") {
                  result.failed++;
                  result.errors.push({
                    row: rowNum,
                    column: "sku",
                    message: `Duplicate product found: ${product.sku}`,
                    value: product.sku,
                  });
                  continue;
                }
                // For "update", continue to update the product below
              }

              // Prepare product data
              const productData: ProductInsert = {
                external_id: product.external_id,
                name: product.name,
                sku: product.sku,
                brand: product.brand,
                brand_line: product.brand_line,
                price: product.price,
                cost_price: product.cost_price,
                unit: product.unit,
                item_type: product.item_type || "other",
                description: product.description,
                color: product.color,
                material: product.material,
                style: product.style,
                gender: product.gender,
                reorder_level: product.reorder_level,
                reorder_quantity: product.reorder_quantity,
                lead_time_days: product.lead_time_days,
                is_active: true,
              };

              let productId: string;

              if (existingId && duplicateHandling === "update") {
                // Update existing product
                const { error: updateError } = await supabase
                  .from("products")
                  .update(productData)
                  .eq("id", existingId);

                if (updateError) throw updateError;
                productId = existingId;
                result.updated++;
              } else {
                // Insert new product
                const { data: insertedProduct, error: insertError } = await supabase
                  .from("products")
                  .insert(productData)
                  .select("id")
                  .single();

                if (insertError) throw insertError;
                productId = insertedProduct.id;
                result.inserted++;

                // Add to duplicate map to handle duplicates within the import batch
                duplicateMap.set(`sku:${product.sku}`, productId);
                if (product.external_id) {
                  duplicateMap.set(`external:${product.external_id}`, productId);
                }
              }

              // Create frame attributes if applicable
              if (
                createFrameAttributes &&
                product.frame_attributes &&
                product.item_type === "frames"
              ) {
                const frameData: FrameAttributesInsert = {
                  product_id: productId,
                  model_code: product.frame_attributes.model_code,
                  frame_shape: product.frame_attributes.frame_shape,
                  frame_material: product.frame_attributes.frame_material,
                  front_color: product.frame_attributes.front_color,
                  lens_width: product.frame_attributes.lens_width,
                  bridge_size: product.frame_attributes.bridge_size,
                  temple_length: product.frame_attributes.temple_length,
                };

                // Check if frame_attributes already exists
                const { data: existingFrameAttrs } = await supabase
                  .from("frame_attributes")
                  .select("id")
                  .eq("product_id", productId)
                  .single();

                if (existingFrameAttrs) {
                  await supabase
                    .from("frame_attributes")
                    .update(frameData)
                    .eq("id", existingFrameAttrs.id);
                } else {
                  await supabase.from("frame_attributes").insert(frameData);
                }
              }
            } catch (error) {
              result.failed++;
              result.errors.push({
                row: rowNum,
                column: "database",
                message: error instanceof Error ? error.message : "Database error",
                value: product.sku,
              });
            }

            // Update progress
            setProgress((prev) =>
              prev
                ? {
                    ...prev,
                    processed: start + i + 1,
                    inserted: result.inserted,
                    updated: result.updated,
                    skipped: result.skipped,
                    failed: result.failed,
                    errors: result.errors,
                  }
                : null
            );
          }
        }

        // Invalidate queries to refresh product list
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });

        result.success = result.failed === 0;
        return result;
      } catch (error) {
        result.success = false;
        toast.error("Import failed: " + (error instanceof Error ? error.message : "Unknown error"));
        return result;
      } finally {
        setIsImporting(false);
      }
    },
    [checkDuplicates, isCancelled, queryClient]
  );

  const cancelImport = useCallback(() => {
    setIsCancelled(true);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(null);
    setIsCancelled(false);
  }, []);

  return {
    importProducts,
    isImporting,
    progress,
    cancelImport,
    resetProgress,
  };
};
