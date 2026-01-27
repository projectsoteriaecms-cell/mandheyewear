import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ImportHistoryRecord, ValidationError } from "../types";
import type { Json } from "@/integrations/supabase/types";

export const useImportHistory = () => {
  return useQuery({
    queryKey: ["import-history"],
    queryFn: async (): Promise<ImportHistoryRecord[]> => {
      const { data, error } = await supabase
        .from("import_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match our type
      return (data || []).map(record => ({
        ...record,
        error_details: Array.isArray(record.error_details) 
          ? (record.error_details as unknown as ValidationError[]) 
          : [],
      }));
    },
  });
};

export const saveImportHistory = async (record: {
  import_type?: string;
  file_name?: string;
  total_records: number;
  new_products: number;
  updated_products: number;
  failed_records: number;
  duration_seconds: number;
  performed_by: string;
  error_details?: ValidationError[];
}) => {
  const { error } = await supabase.from("import_history").insert({
    import_type: record.import_type || "ecms",
    file_name: record.file_name,
    total_records: record.total_records,
    new_products: record.new_products,
    updated_products: record.updated_products,
    failed_records: record.failed_records,
    duration_seconds: record.duration_seconds,
    performed_by: record.performed_by,
    error_details: (record.error_details || []) as unknown as Json,
  });

  if (error) {
    console.error("Failed to save import history:", error);
  }
};
