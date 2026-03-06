import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";

export function ZohoSyncHistoryPanel() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["zoho-sync-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zoho_sync_log")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Zoho Sync History</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowsClockwise className="h-5 w-5" weight="light" />
          Zoho Sync History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
            >
              <div className="flex items-center gap-3">
                {statusBadge(log.status)}
                <span className="capitalize text-muted-foreground">
                  {log.sync_type} · {log.direction}
                </span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                {log.records_processed != null && log.records_processed > 0 && (
                  <span>{log.records_processed} processed</span>
                )}
                {log.records_failed != null && log.records_failed > 0 && (
                  <span className="text-destructive">{log.records_failed} failed</span>
                )}
                <span>
                  {log.started_at
                    ? formatDistanceToNow(new Date(log.started_at), { addSuffix: true })
                    : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
