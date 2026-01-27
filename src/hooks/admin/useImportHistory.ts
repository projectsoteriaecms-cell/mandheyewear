import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImportHistoryRecord {
  id: string;
  import_type: string;
  file_name: string | null;
  total_records: number;
  new_products: number;
  updated_products: number;
  failed_records: number;
  duration_seconds: number | null;
  performed_by: string;
  created_at: string;
  error_details: any[];
}

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
      return (data || []) as ImportHistoryRecord[];
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
  error_details?: any[];
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
    error_details: record.error_details || [],
  });

  if (error) {
    console.error("Failed to save import history:", error);
  }
};
