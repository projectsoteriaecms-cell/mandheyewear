import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowsClockwise, CheckCircle, XCircle, Clock } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";

const useReconciliationData = () => {
  return useQuery({
    queryKey: ["zoho-reconciliation"],
    queryFn: async () => {
      // Last stock sync
      const { data: lastStockSync } = await supabase
        .from("zoho_sync_log")
        .select("completed_at, status, records_processed, metadata")
        .eq("sync_type", "stock")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Order push stats
      const { data: orderPushes } = await supabase
        .from("zoho_sync_log")
        .select("status")
        .eq("sync_type", "push_order")
        .eq("direction", "outbound");

      const pushStats = {
        total: orderPushes?.length ?? 0,
        success: orderPushes?.filter((p) => p.status === "success").length ?? 0,
        failed: orderPushes?.filter((p) => p.status === "error").length ?? 0,
        pending: orderPushes?.filter((p) => p.status === "pending").length ?? 0,
      };

      // Total orders that haven't been pushed
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "paid");

      return {
        lastStockSync,
        pushStats,
        totalPaidOrders: totalOrders ?? 0,
        unpushedOrders: (totalOrders ?? 0) - pushStats.success,
      };
    },
    refetchInterval: 30000,
  });
};

export const ReconciliationCard = () => {
  const { data, isLoading } = useReconciliationData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowsClockwise className="h-5 w-5" weight="light" />
            Zoho Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowsClockwise className="h-5 w-5" weight="light" />
          Zoho Reconciliation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Last Stock Sync */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last stock sync</span>
          <span className="text-sm font-medium">
            {data?.lastStockSync?.completed_at
              ? formatDistanceToNow(new Date(data.lastStockSync.completed_at), { addSuffix: true })
              : "Never"}
          </span>
        </div>

        {/* Orders Pushed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Orders pushed to Zoho</span>
            <span className="text-sm font-medium">
              {data?.pushStats.success ?? 0} / {data?.totalPaidOrders ?? 0}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(data?.pushStats.success ?? 0) > 0 && (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="mr-1 h-3 w-3" />
                {data?.pushStats.success} synced
              </Badge>
            )}
            {(data?.pushStats.pending ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {data?.pushStats.pending} pending
              </Badge>
            )}
            {(data?.pushStats.failed ?? 0) > 0 && (
              <Badge variant="destructive" className="text-xs">
                <XCircle className="mr-1 h-3 w-3" />
                {data?.pushStats.failed} failed
              </Badge>
            )}
          </div>
        </div>

        {/* Unpushed Orders */}
        {(data?.unpushedOrders ?? 0) > 0 && (
          <div className="p-3 rounded-lg bg-accent/50 border border-border">
            <p className="text-sm font-medium">
              {data?.unpushedOrders} paid order{data?.unpushedOrders !== 1 ? "s" : ""} not yet in Zoho
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Go to Orders → Push to Zoho to sync them
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
