import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FrameAttributesInsert, FrameAttributesUpdate } from "../types";

export const useFrameAttributes = (productId?: string) => {
  const queryClient = useQueryClient();

  const frameAttributesQuery = useQuery({
    queryKey: ["frame-attributes", productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from("frame_attributes")
        .select("*")
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const createFrameAttributes = useMutation({
    mutationFn: async (data: FrameAttributesInsert) => {
      const { data: result, error } = await supabase
        .from("frame_attributes")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["frame-attributes", variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Frame attributes saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save frame attributes");
    },
  });

  const updateFrameAttributes = useMutation({
    mutationFn: async ({ id, ...data }: FrameAttributesUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from("frame_attributes")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["frame-attributes", data.product_id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Frame attributes updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update frame attributes");
    },
  });

  const upsertFrameAttributes = useMutation({
    mutationFn: async (data: FrameAttributesInsert) => {
      const { data: result, error } = await supabase
        .from("frame_attributes")
        .upsert(data, { onConflict: "product_id" })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["frame-attributes", data.product_id] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Frame attributes saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save frame attributes");
    },
  });

  const deleteFrameAttributes = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("frame_attributes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frame-attributes"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Frame attributes deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete frame attributes");
    },
  });

  return {
    frameAttributes: frameAttributesQuery.data,
    isLoading: frameAttributesQuery.isLoading,
    error: frameAttributesQuery.error,
    createFrameAttributes,
    updateFrameAttributes,
    upsertFrameAttributes,
    deleteFrameAttributes,
  };
};
