import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowsClockwise, Link as LinkIcon, Plus, CaretDown } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";

const STORAGE_KEY = "zoho-sync-history-open";

export function ZohoSyncHistoryPanel() {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(isOpen));
    }
  }, [isOpen]);

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
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasPending = data?.some((log) => log.status === "pending");
      return hasPending ? 5000 : false;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Zoho Sync History</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-12 w-full" /></CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) return null;

  const statusBadge = (status: string, metadata: Record<string, unknown> | null) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending": {
        const page = (metadata as { current_page?: number } | null)?.current_page;
        return (
          <Badge variant="secondary" className="animate-pulse">
            Syncing{page ? ` (page ${page})` : "…"}
          </Badge>
        );
      }
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const latest = logs[0];
  const latestMeta = latest.metadata as Record<string, unknown> | null;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowsClockwise className="h-5 w-5" weight="light" />
                Zoho Sync History
              </CardTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {statusBadge(latest.status, latestMeta)}
                <span className="hidden sm:inline">
                  {latest.started_at
                    ? formatDistanceToNow(new Date(latest.started_at), { addSuffix: true })
                    : "—"}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" tabIndex={-1}>
                  <CaretDown
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    weight="bold"
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-3">
              {logs.map((log) => {
                const meta = log.metadata as Record<string, unknown> | null;
                const matched = (meta?.matched_existing as number) ?? 0;
                const newProducts = (meta?.new_products as number) ?? 0;

                return (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {statusBadge(log.status, meta)}
                      <span className="capitalize text-muted-foreground">
                        {log.sync_type} · {log.direction}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      {matched > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <LinkIcon className="h-3.5 w-3.5" weight="bold" />
                          {matched} linked
                        </span>
                      )}
                      {newProducts > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Plus className="h-3.5 w-3.5" weight="bold" />
                          {newProducts} new
                        </span>
                      )}
                      {log.records_processed != null && log.records_processed > 0 && matched === 0 && newProducts === 0 && (
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
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
