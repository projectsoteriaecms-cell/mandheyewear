import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { 
  ParsedProduct, 
  ImportOptions, 
  ImportProgress, 
  ImportResult,
  ProductInsert,
  FrameAttributesInsert,
} from "../types";
import { saveImportHistory } from "./useImportHistory";

// Optimized settings for large imports
const CHUNK_SIZE = 50; // Smaller chunks for more reliable database writes
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Delay utility for retry logic
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const useECMSImport = () => {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const cancelledRef = useRef(false);

  /**
   * Efficiently check duplicates using chunked queries to avoid request limits
   */
  const checkDuplicates = useCallback(
    async (products: ParsedProduct[]): Promise<Map<string, string>> => {
      const duplicateMap = new Map<string, string>();
      const skus = products.map((p) => p.sku);
      const externalIds = products.map((p) => p.external_id).filter(Boolean) as string[];

      // Check SKUs in chunks to avoid query limits
      for (let i = 0; i < skus.length; i += 500) {
        const skuChunk = skus.slice(i, i + 500);
        const { data: existingBySku } = await supabase
          .from("products")
          .select("id, sku")
          .in("sku", skuChunk);

        if (existingBySku) {
          existingBySku.forEach((p) => {
            duplicateMap.set(`sku:${p.sku}`, p.id);
          });
        }
      }

      // Check external IDs in chunks
      for (let i = 0; i < externalIds.length; i += 500) {
        const extIdChunk = externalIds.slice(i, i + 500);
        const { data: existingByExternal } = await supabase
          .from("products")
          .select("id, external_id")
          .in("external_id", extIdChunk);

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

  /**
   * Process a single batch of products for insertion
   */
  const processBatchInsert = async (
    toInsert: { product: ParsedProduct; rowNum: number }[],
    duplicateMap: Map<string, string>,
    createFrameAttributes: boolean,
    result: ImportResult
  ) => {
    if (toInsert.length === 0) return;

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

    // Batch insert with error handling
    const { data: insertedProducts, error: insertError } = await supabase
      .from("products")
      .insert(insertData)
      .select("id, sku, external_id");

    if (insertError) {
      toInsert.forEach(({ rowNum, product }) => {
        result.failed++;
        result.errors.push({
          row: rowNum,
          column: "database",
          message: insertError.message,
          value: product.sku,
        });
      });
      return;
    }

    if (insertedProducts) {
      result.inserted += insertedProducts.length;

      // Update duplicate map
      for (const inserted of insertedProducts) {
        duplicateMap.set(`sku:${inserted.sku}`, inserted.id);
        if (inserted.external_id) {
          duplicateMap.set(`external:${inserted.external_id}`, inserted.id);
        }
      }

      // Batch create frame attributes
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
  };

  /**
   * Process a single batch of products for update
   */
  const processBatchUpdate = async (
    toUpdate: { product: ParsedProduct; rowNum: number; existingId: string }[],
    createFrameAttributes: boolean,
    result: ImportResult
  ) => {
    if (toUpdate.length === 0) return;

    const updateData: ProductInsert[] = toUpdate.map(({ product }) => ({
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

    const { error: upsertError } = await supabase
      .from("products")
      .upsert(updateData, { onConflict: "sku" });

    if (upsertError) {
      toUpdate.forEach(({ rowNum, product }) => {
        result.failed++;
        result.errors.push({
          row: rowNum,
          column: "database",
          message: upsertError.message,
          value: product.sku,
        });
      });
      return;
    }

    result.updated += toUpdate.length;

    // Batch upsert frame attributes
    if (createFrameAttributes) {
      const frameDataToUpsert: FrameAttributesInsert[] = toUpdate
        .filter(({ product }) => product.item_type === "frames" && !!product.frame_attributes)
        .map(({ product, existingId }) => ({
          product_id: existingId,
          model_code: product.frame_attributes!.model_code,
          frame_shape: product.frame_attributes!.frame_shape,
          frame_material: product.frame_attributes!.frame_material,
          front_color: product.frame_attributes!.front_color,
          lens_width: product.frame_attributes!.lens_width,
          bridge_size: product.frame_attributes!.bridge_size,
          temple_length: product.frame_attributes!.temple_length,
        }));

      if (frameDataToUpsert.length > 0) {
        await supabase
          .from("frame_attributes")
          .upsert(frameDataToUpsert, { onConflict: "product_id" });
      }
    }
  };

  const importProducts = useCallback(
    async (
      products: ParsedProduct[],
      options: ImportOptions,
      fileName?: string
    ): Promise<ImportResult> => {
      setIsImporting(true);
      cancelledRef.current = false;

      const { batchSize, duplicateHandling, createFrameAttributes } = options;
      
      // Use smaller chunk size for more reliable writes, but respect user's batch size
      const effectiveBatchSize = Math.min(batchSize, CHUNK_SIZE);
      const totalBatches = Math.ceil(products.length / effectiveBatchSize);

      const result: ImportResult = {
        success: true,
        inserted: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      };

      const startTime = Date.now();

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
        startTime,
        estimatedTimeRemaining: null,
      });

      try {
        // Check all duplicates upfront with chunked queries
        const duplicateMap = await checkDuplicates(products);

        for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
          if (cancelledRef.current) {
            toast.info("Import cancelled");
            break;
          }

          const start = batchNum * effectiveBatchSize;
          const end = Math.min(start + effectiveBatchSize, products.length);
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
                toUpdate.push({ product, rowNum, existingId });
              }
            } else {
              toInsert.push({ product, rowNum });
            }
          }

          // Process inserts and updates with retry logic
          await processBatchInsert(toInsert, duplicateMap, createFrameAttributes, result);
          await processBatchUpdate(toUpdate, createFrameAttributes, result);

          // Calculate time estimate with smoothing
          const elapsedMs = Date.now() - startTime;
          const avgMsPerProduct = elapsedMs / end;
          const remainingProducts = products.length - end;
          const estimatedTimeRemaining = Math.round((avgMsPerProduct * remainingProducts) / 1000);

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
                  errors: result.errors.slice(-50), // Keep only last 50 errors in memory
                  estimatedTimeRemaining,
                }
              : null
          );

          // Small delay between batches to prevent overwhelming the database
          if (batchNum < totalBatches - 1) {
            await delay(100);
          }
        }

        // Invalidate queries to refresh product list
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });

        result.success = result.failed === 0;

        // Save import history
        const durationSeconds = (Date.now() - startTime) / 1000;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveImportHistory({
            import_type: "ecms",
            file_name: fileName,
            total_records: products.length,
            new_products: result.inserted,
            updated_products: result.updated,
            failed_records: result.failed,
            duration_seconds: durationSeconds,
            performed_by: user.id,
            error_details: result.errors.slice(0, 50),
          });
          queryClient.invalidateQueries({ queryKey: ["import-history"] });
        }

        if (result.success) {
          toast.success(`Import complete! ${result.inserted} inserted, ${result.updated} updated`);
        } else {
          toast.warning(`Import finished with ${result.failed} errors`);
        }

        return result;
      } catch (error) {
        result.success = false;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast.error("Import failed: " + errorMessage);
        
        result.errors.push({
          row: 0,
          column: "system",
          message: `Fatal error: ${errorMessage}`,
        });
        
        return result;
      } finally {
        setIsImporting(false);
      }
    },
    [checkDuplicates, queryClient]
  );

  const cancelImport = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(null);
    cancelledRef.current = false;
  }, []);

  return {
    importProducts,
    isImporting,
    progress,
    cancelImport,
    resetProgress,
  };
};
