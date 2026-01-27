import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type LensAttributes = Database["public"]["Tables"]["lens_attributes"]["Row"];
type LensAttributesInsert = Database["public"]["Tables"]["lens_attributes"]["Insert"];
type LensAttributesUpdate = Database["public"]["Tables"]["lens_attributes"]["Update"];

export const useLensAttributes = (productId?: string) => {
  const queryClient = useQueryClient();

  const lensAttributesQuery = useQuery({
    queryKey: ["lens-attributes", productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from("lens_attributes")
        .select("*")
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const createLensAttributes = useMutation({
    mutationFn: async (data: LensAttributesInsert) => {
      const { data: result, error } = await supabase
        .from("lens_attributes")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lens-attributes", variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Lens attributes saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save lens attributes");
    },
  });

  const updateLensAttributes = useMutation({
    mutationFn: async ({ id, ...data }: LensAttributesUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from("lens_attributes")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lens-attributes", data.product_id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Lens attributes updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update lens attributes");
    },
  });

  const upsertLensAttributes = useMutation({
    mutationFn: async (data: LensAttributesInsert) => {
      const { data: result, error } = await supabase
        .from("lens_attributes")
        .upsert(data, { onConflict: "product_id" })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lens-attributes", data.product_id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Lens attributes saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save lens attributes");
    },
  });

  const deleteLensAttributes = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lens_attributes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lens-attributes"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Lens attributes deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete lens attributes");
    },
  });

  return {
    lensAttributes: lensAttributesQuery.data,
    isLoading: lensAttributesQuery.isLoading,
    error: lensAttributesQuery.error,
    createLensAttributes,
    updateLensAttributes,
    upsertLensAttributes,
    deleteLensAttributes,
  };
};
