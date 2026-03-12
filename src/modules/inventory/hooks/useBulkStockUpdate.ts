import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ExcelJS from "exceljs";
import { toast } from "@/hooks/use-toast";

export interface StockUpdateRow {
  externalId: string;
  productName?: string;
  quantity: number;
  originalQuantity: number;
  wasNegative: boolean;
}

export interface ParsedStockData {
  rows: StockUpdateRow[];
  totalQuantity: number;
  negativeCount: number;
  errors: string[];
}

export interface StockUpdateProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  skipped: number;
  isComplete: boolean;
}

export interface StockUpdateResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ externalId: string; error: string }>;
  negativesClamped: number;
}

interface ProductMatch {
  id: string;
  external_id: string;
  name: string;
}

/**
 * Parse an Excel file to extract ProductId and Qty columns
 */
export const parseStockExcel = async (file: File): Promise<ParsedStockData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        const rows: StockUpdateRow[] = [];
        const errors: string[] = [];
        let totalQuantity = 0;
        let negativeCount = 0;

        // Skip header row (index 0)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          // Column 0 = ProductId, Column 3 = Item Description, Column 7 = Qty
          const productIdRaw = row[0];
          const productName = row[3]?.toString() || "";
          const qtyRaw = row[7];

          if (productIdRaw === undefined || productIdRaw === null || productIdRaw === "") {
            continue; // Skip rows without ProductId
          }

          const externalId = productIdRaw.toString().trim();
          let quantity = 0;
          let originalQuantity = 0;
          let wasNegative = false;

          if (qtyRaw !== undefined && qtyRaw !== null && qtyRaw !== "") {
            originalQuantity = parseFloat(qtyRaw.toString()) || 0;
            quantity = originalQuantity;

            if (quantity < 0) {
              wasNegative = true;
              negativeCount++;
              quantity = 0; // Clamp negative to 0
            }
          }

          totalQuantity += quantity;

          rows.push({
            externalId,
            productName: productName.substring(0, 100), // Truncate for display
            quantity,
            originalQuantity,
            wasNegative,
          });
        }

        resolve({
          rows,
          totalQuantity,
          negativeCount,
          errors,
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Hook for bulk updating stock levels from parsed Excel data
 */
export const useBulkStockUpdate = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<StockUpdateProgress>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    isComplete: false,
  });

  const resetProgress = useCallback(() => {
    setProgress({
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      isComplete: false,
    });
  }, []);

  const updateStockMutation = useMutation({
    mutationFn: async ({
      parsedData,
      branchId,
      userId,
    }: {
      parsedData: ParsedStockData;
      branchId: string;
      userId: string;
    }): Promise<StockUpdateResult> => {
      const { rows } = parsedData;
      const batchSize = 50;
      const result: StockUpdateResult = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [],
        negativesClamped: parsedData.negativeCount,
      };

      setProgress({
        total: rows.length,
        processed: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        isComplete: false,
      });

      // First, fetch all products with external_ids to create a lookup map
      const externalIds = rows.map((r) => r.externalId);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, external_id, name")
        .in("external_id", externalIds);

      if (productsError) {
        throw new Error(`Failed to fetch products: ${productsError.message}`);
      }

      // Create lookup map: external_id -> product
      const productMap = new Map<string, ProductMatch>();
      products?.forEach((p) => {
        if (p.external_id) {
          productMap.set(p.external_id, {
            id: p.id,
            external_id: p.external_id,
            name: p.name,
          });
        }
      });

      // Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        for (const row of batch) {
          const product = productMap.get(row.externalId);

          if (!product) {
            result.skipped++;
            result.errors.push({
              externalId: row.externalId,
              error: "Product not found in database",
            });
            continue;
          }

          try {
            // Get current inventory
            const { data: currentInventory, error: invError } = await supabase
              .from("inventory")
              .select("id, quantity_on_hand")
              .eq("product_id", product.id)
              .eq("branch_id", branchId)
              .maybeSingle();

            if (invError) {
              throw new Error(invError.message);
            }

            const quantityBefore = currentInventory?.quantity_on_hand ?? 0;
            const quantityAfter = row.quantity;
            const quantityChange = quantityAfter - quantityBefore;

            if (currentInventory) {
              // Update existing inventory
              const { error: updateError } = await supabase
                .from("inventory")
                .update({
                  quantity_on_hand: quantityAfter,
                  last_stock_count_date: new Date().toISOString().split("T")[0],
                  updated_at: new Date().toISOString(),
                })
                .eq("id", currentInventory.id);

              if (updateError) {
                throw new Error(updateError.message);
              }
            } else {
              // Create new inventory record
              const { error: insertError } = await supabase
                .from("inventory")
                .insert({
                  product_id: product.id,
                  branch_id: branchId,
                  quantity_on_hand: quantityAfter,
                  quantity_reserved: 0,
                  last_stock_count_date: new Date().toISOString().split("T")[0],
                });

              if (insertError) {
                throw new Error(insertError.message);
              }
            }

            // Log the transaction for audit trail
            const { error: txError } = await supabase
              .from("inventory_transactions")
              .insert({
                product_id: product.id,
                branch_id: branchId,
                transaction_type: "adjustment",
                quantity_before: quantityBefore,
                quantity_after: quantityAfter,
                quantity_change: quantityChange,
                performed_by: userId,
                notes: row.wasNegative
                  ? `Bulk stock import from ECMS (negative value ${row.originalQuantity} clamped to 0)`
                  : "Bulk stock import from ECMS",
              });

            if (txError) {
              console.warn("Failed to log transaction:", txError.message);
              // Don't fail the update if just the log fails
            }

            result.success++;
          } catch (error) {
            result.failed++;
            result.errors.push({
              externalId: row.externalId,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        // Update progress after each batch
        setProgress((prev) => ({
          ...prev,
          processed: Math.min(i + batchSize, rows.length),
          success: result.success,
          failed: result.failed,
          skipped: result.skipped,
        }));
      }

      setProgress((prev) => ({
        ...prev,
        isComplete: true,
      }));

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock-alerts"] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  return {
    parseStockExcel,
    updateStock: updateStockMutation.mutate,
    updateStockAsync: updateStockMutation.mutateAsync,
    isUpdating: updateStockMutation.isPending,
    progress,
    resetProgress,
  };
};

export type { StockUpdateProgress as BulkStockUpdateProgress };
