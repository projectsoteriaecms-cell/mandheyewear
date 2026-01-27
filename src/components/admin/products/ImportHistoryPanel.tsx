import { format } from "date-fns";
import { useImportHistory } from "@/modules/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const ImportHistoryPanel = () => {
  const { data: history, isLoading } = useImportHistory();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return null;
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Import History
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {history.map((record) => {
                const hasErrors = record.failed_records > 0;
                const successRate = record.total_records > 0
                  ? Math.round(
                      ((record.new_products + record.updated_products) /
                        record.total_records) *
                        100
                    )
                  : 0;

                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          hasErrors
                            ? "bg-destructive/10 text-destructive"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {hasErrors ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {record.file_name || "ECMS Import"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {record.import_type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(record.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">
                            +{record.new_products}
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-blue-600 font-medium">
                            ↻{record.updated_products}
                          </span>
                          {record.failed_records > 0 && (
                            <>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-destructive font-medium">
                                ✕{record.failed_records}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {record.total_records} total • {formatDuration(record.duration_seconds)}
                        </div>
                      </div>
                      <Badge
                        variant={successRate === 100 ? "default" : "secondary"}
                        className="min-w-[50px] justify-center"
                      >
                        {successRate}%
                      </Badge>
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
};
