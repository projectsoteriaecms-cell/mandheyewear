import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { toast } from "sonner";

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Fetch profile names separately
      const userIds = [...new Set((data ?? []).map((r: any) => r.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds)
        : { data: [] };
      
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      return (data ?? []).map((r: any) => ({
        ...r,
        profiles: profileMap.get(r.user_id) || null,
      })) as ProductReview[];
    },
    enabled: !!productId,
    staleTime: 2 * 60_000,
  });
}

export function useReviewStats(productId: string | undefined) {
  const { data: reviews } = useProductReviews(productId);

  const stats: ReviewStats = {
    average: 0,
    total: reviews?.length ?? 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  if (reviews && reviews.length > 0) {
    let sum = 0;
    for (const r of reviews) {
      sum += r.rating;
      stats.distribution[r.rating] = (stats.distribution[r.rating] || 0) + 1;
    }
    stats.average = sum / reviews.length;
  }

  return stats;
}

export function useUserReview(productId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-review", productId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as ProductReview | null;
    },
    enabled: !!productId && !!user?.id,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { productId: string; rating: number; title?: string; body?: string }) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("product_reviews").upsert(
        {
          product_id: input.productId,
          user_id: user.id,
          rating: input.rating,
          title: input.title?.trim() || null,
          body: input.body?.trim() || null,
        },
        { onConflict: "product_id,user_id" }
      );
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success("Review submitted!");
      qc.invalidateQueries({ queryKey: ["product-reviews", vars.productId] });
      qc.invalidateQueries({ queryKey: ["user-review", vars.productId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit review");
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { reviewId: string; productId: string }) => {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", input.reviewId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["product-reviews", vars.productId] });
      qc.invalidateQueries({ queryKey: ["user-review", vars.productId] });
    },
  });
}
