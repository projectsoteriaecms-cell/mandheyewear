import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X, Trash2, Clock } from "lucide-react";
import type { TryOnResult } from "@/modules/personalization";

interface TryOnHistoryProps {
  history: TryOnResult[];
  onSelect: (result: TryOnResult) => void;
  onRemove: (timestamp: number) => void;
  onClearAll: () => void;
}

export const TryOnHistory = ({
  history,
  onSelect,
  onRemove,
  onClearAll,
}: TryOnHistoryProps) => {
  if (history.length === 0) {
    return null;
  }

  const successfulTryOns = history.filter((r) => r.success && r.compositeImage);

  if (successfulTryOns.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Try-Ons
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3">
            {successfulTryOns.map((result) => (
              <div
                key={result.timestamp}
                className="relative flex-shrink-0 w-32 group"
              >
                <button
                  onClick={() => onSelect(result)}
                  className="block w-full aspect-square bg-muted rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                >
                  <img
                    src={result.compositeImage}
                    alt={result.frameDetails?.name || "Try-on result"}
                    className="w-full h-full object-cover"
                  />
                </button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(result.timestamp);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-1 truncate">
                  {result.frameDetails?.name || "Frame"}
                </p>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
