import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Archive, ArchiveRestore, Trash2, X, Loader2 } from "lucide-react";

interface CampaignBulkActionsBarProps {
  selectedCount: number;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  onUnarchive?: () => void;
  isDuplicating?: boolean;
  isArchiving?: boolean;
  isUnarchiving?: boolean;
  isDeleting?: boolean;
  // "archived" shows Restore + Delete; "default" shows Duplicate + Archive + Delete
  variant?: "default" | "archived";
}

export function CampaignBulkActionsBar({
  selectedCount,
  onDuplicate,
  onArchive,
  onDelete,
  onClearSelection,
  onUnarchive,
  isDuplicating = false,
  isArchiving = false,
  isUnarchiving = false,
  isDeleting = false,
  variant = "default",
}: CampaignBulkActionsBarProps) {
  const isBusy = isDuplicating || isArchiving || isUnarchiving || isDeleting;
  const isArchivedView = variant === "archived";

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedCount} campaign{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isArchivedView ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onUnarchive}
              disabled={isBusy || selectedCount === 0}
              title="Restore selected campaigns"
            >
              {isUnarchiving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" /> Restore
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onDuplicate}
                disabled={isBusy || selectedCount === 0}
                title="Duplicate selected campaigns"
              >
                {isDuplicating && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicate
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={onArchive}
                disabled={isBusy || selectedCount === 0}
                title="Archive selected campaigns"
              >
                {isArchiving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={isBusy || selectedCount === 0}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete selected campaigns"
          >
            {isDeleting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            disabled={isBusy}
            title="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
