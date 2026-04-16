import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, ShoppingBag, TrendingUp } from "lucide-react";

interface SocialProofBadgeProps {
  productId: string;
}

export const SocialProofBadge = ({ productId }: SocialProofBadgeProps) => {
  const { data } = useQuery({
    queryKey: ["social-proof", productId],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [viewsRes, purchasesRes] = await Promise.all([
        supabase
          .from("user_activity")
          .select("id", { count: "exact", head: true })
          .eq("product_id", productId)
          .eq("activity_type", "product_view")
          .gte("created_at", todayStart),
        supabase
          .from("order_items")
          .select("id", { count: "exact", head: true })
          .eq("product_id", productId)
          .gte("created_at", weekAgo),
      ]);

      return {
        viewsToday: viewsRes.count || 0,
        purchasesThisWeek: purchasesRes.count || 0,
      };
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  if (!data || (data.viewsToday < 2 && data.purchasesThisWeek === 0)) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.viewsToday >= 2 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium animate-in fade-in duration-500">
          <Eye className="h-3.5 w-3.5" />
          <span>{data.viewsToday} {data.viewsToday === 1 ? "person" : "people"} viewing today</span>
        </div>
      )}
      {data.purchasesThisWeek > 0 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium animate-in fade-in duration-500">
          {data.purchasesThisWeek >= 3 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <ShoppingBag className="h-3.5 w-3.5" />
          )}
          <span>
            {data.purchasesThisWeek} bought this week
            {data.purchasesThisWeek >= 5 && " 🔥"}
          </span>
        </div>
      )}
    </div>
  );
};
