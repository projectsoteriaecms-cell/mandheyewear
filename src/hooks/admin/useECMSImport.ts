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

          // Separate products into: toInsert, toUpdate, toSkip
          const toInsert: { product: ParsedProduct; rowNum: number }[] = [];
          const toUpdate: { product: ParsedProduct; rowNum: number; existingId: string }[] = [];

          for (let i = 0; i < batch.length; i++) {
            const product = batch[i];
            const rowNum = start + i + 2;

            const existingId =
              duplicateMap.get(`sku:${product.sku}`) ||
              (product.external_id
                ? duplicateMap.get(`external:${product.external_id}`)
                : undefined);

            if (existingId) {
              if (duplicateHandling === "skip") {
                result.skipped++;
              } else if (duplicateHandling === "fail") {
                result.failed++;
                result.errors.push({
                  row: rowNum,
                  column: "sku",
                  message: `Duplicate product found: ${product.sku}`,
                  value: product.sku,
                });
              } else {
                // update
                toUpdate.push({ product, rowNum, existingId });
              }
            } else {
              toInsert.push({ product, rowNum });
            }
          }

          // Batch INSERT new products
          if (toInsert.length > 0) {
            const insertData: ProductInsert[] = toInsert.map(({ product }) => ({
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
            }));

            const { data: insertedProducts, error: insertError } = await supabase
              .from("products")
              .insert(insertData)
              .select("id, sku, external_id");

            if (insertError) {
              // If batch fails, log all rows as failed
              toInsert.forEach(({ rowNum, product }) => {
                result.failed++;
                result.errors.push({
                  row: rowNum,
                  column: "database",
                  message: insertError.message,
                  value: product.sku,
                });
              });
            } else if (insertedProducts) {
              result.inserted += insertedProducts.length;

              // Update duplicate map and create frame attributes
              for (const inserted of insertedProducts) {
                duplicateMap.set(`sku:${inserted.sku}`, inserted.id);
                if (inserted.external_id) {
                  duplicateMap.set(`external:${inserted.external_id}`, inserted.id);
                }
              }

              // Batch create frame attributes for inserted frame products
              if (createFrameAttributes) {
                const frameDataToInsert: FrameAttributesInsert[] = [];
                
                for (const { product } of toInsert) {
                  if (product.item_type === "frames" && product.frame_attributes) {
                    const productId = duplicateMap.get(`sku:${product.sku}`);
                    if (productId) {
                      frameDataToInsert.push({
                        product_id: productId,
                        model_code: product.frame_attributes.model_code,
                        frame_shape: product.frame_attributes.frame_shape,
                        frame_material: product.frame_attributes.frame_material,
                        front_color: product.frame_attributes.front_color,
                        lens_width: product.frame_attributes.lens_width,
                        bridge_size: product.frame_attributes.bridge_size,
                        temple_length: product.frame_attributes.temple_length,
                      });
                    }
                  }
                }

                if (frameDataToInsert.length > 0) {
                  await supabase.from("frame_attributes").insert(frameDataToInsert);
                }
              }
            }
          }

          // Batch UPDATE existing products (must be done individually due to different IDs)
          for (const { product, rowNum, existingId } of toUpdate) {
            try {
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

              const { error: updateError } = await supabase
                .from("products")
                .update(productData)
                .eq("id", existingId);

              if (updateError) throw updateError;
              result.updated++;

              // Update frame attributes if applicable
              if (createFrameAttributes && product.frame_attributes && product.item_type === "frames") {
                const frameData: FrameAttributesInsert = {
                  product_id: existingId,
                  model_code: product.frame_attributes.model_code,
                  frame_shape: product.frame_attributes.frame_shape,
                  frame_material: product.frame_attributes.frame_material,
                  front_color: product.frame_attributes.front_color,
                  lens_width: product.frame_attributes.lens_width,
                  bridge_size: product.frame_attributes.bridge_size,
                  temple_length: product.frame_attributes.temple_length,
                };

                await supabase
                  .from("frame_attributes")
                  .upsert(frameData, { onConflict: "product_id" });
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
          }

          // Update progress after each batch
          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  processed: end,
                  inserted: result.inserted,
                  updated: result.updated,
                  skipped: result.skipped,
                  failed: result.failed,
                  errors: result.errors,
                }
              : null
          );
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
