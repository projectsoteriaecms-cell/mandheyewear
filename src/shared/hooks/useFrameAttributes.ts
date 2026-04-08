import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FrameAttributes {
  lens_width: number | null;
  bridge_size: number | null;
  temple_length: number | null;
  frame_shape: string | null;
  frame_material: string | null;
  front_color: string | null;
}

export function useFrameAttributes(productId: string | null) {
  return useQuery({
    queryKey: ["frame-attributes", productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from("frame_attributes")
        .select("lens_width, bridge_size, temple_length, frame_shape, frame_material, front_color")
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return data as FrameAttributes | null;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export function has3DMeasurements(attrs: FrameAttributes | null | undefined): boolean {
  return !!(attrs?.lens_width && attrs?.bridge_size && attrs?.temple_length);
}
