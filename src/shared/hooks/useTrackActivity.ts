import { useCallback } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type ActivityType = "product_view" | "category_view" | "search" | "add_to_cart" | "wishlist_add";

interface TrackOptions {
  activityType: ActivityType;
  productId?: string;
  category?: string;
  searchQuery?: string;
  metadata?: Record<string, unknown>;
}

export const useTrackActivity = () => {
  const { user } = useAuth();

  const track = useCallback(
    (options: TrackOptions) => {
      if (!user) return;

      // Fire-and-forget — no await, no blocking
      supabase
        .from("user_activity")
        .insert({
          user_id: user.id,
          activity_type: options.activityType,
          product_id: options.productId || null,
          category: options.category || null,
          search_query: options.searchQuery || null,
          metadata: options.metadata || {},
        })
        .then(({ error }) => {
          if (error) console.warn("Activity tracking failed:", error.message);
        });
    },
    [user]
  );

  return { track };
};
