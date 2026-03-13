import { Button } from "@/components/ui/button";
import {
  Plus,
  Upload,
  ImageSquare,
  FileXls,
  ArrowsClockwise,
  CloudArrowDown,
  Sparkle,
} from "@phosphor-icons/react";

interface ProductsToolbarProps {
  isAdmin: boolean;
  isEnriching: boolean;
  enrichProgress: { enriched: number; remaining: number } | null;
  syncStatus: string;
  stockSyncStatus?: string;
  onEnrichProducts: () => void;
  onPullItems: () => void;
  onSyncStock?: () => void;
  onOpenLinkDialog: () => void;
  onOpenBulkImageUpload: () => void;
  onOpenBulkUpload: () => void;
  onOpenECMSImport: () => void;
  onOpenCreateDialog: () => void;
}

export const ProductsToolbar = ({
  isAdmin,
  isEnriching,
  enrichProgress,
  syncStatus,
  stockSyncStatus,
  onEnrichProducts,
  onPullItems,
  onSyncStock,
  onOpenLinkDialog,
  onOpenBulkImageUpload,
  onOpenBulkUpload,
  onOpenECMSImport,
  onOpenCreateDialog,
}: ProductsToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {isAdmin && (
          <Button variant="outline" onClick={onEnrichProducts} disabled={isEnriching}>
            {isEnriching ? (
              <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <Sparkle className="mr-2 h-4 w-4" weight="light" />
            )}
            {isEnriching
              ? enrichProgress
                ? `Enriching… ${enrichProgress.enriched} done, ${enrichProgress.remaining} left`
                : "Starting…"
              : "Enrich Metadata"}
          </Button>
        )}
        {isAdmin && (
          <Button variant="outline" onClick={onPullItems} disabled={syncStatus === "syncing"}>
            {syncStatus === "syncing" ? (
              <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <CloudArrowDown className="mr-2 h-4 w-4" weight="light" />
            )}
            {syncStatus === "syncing" ? "Syncing…" : "Zoho Sync"}
          </Button>
        )}
        {isAdmin && onSyncStock && (
          <Button variant="outline" onClick={onSyncStock} disabled={stockSyncStatus === "syncing"}>
            {stockSyncStatus === "syncing" ? (
              <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <CloudArrowDown className="mr-2 h-4 w-4" weight="light" />
            )}
            {stockSyncStatus === "syncing" ? "Syncing Stock…" : "Sync Stock"}
          </Button>
        )}
        {isAdmin && (
          <Button variant="outline" onClick={onOpenLinkDialog}>
            <ArrowsClockwise className="mr-2 h-4 w-4" weight="light" />
            Link to Zoho
          </Button>
        )}
        <Button variant="outline" onClick={onOpenBulkImageUpload}>
          <ImageSquare className="mr-2 h-4 w-4" weight="light" />
          Upload Images
        </Button>
        <Button variant="outline" onClick={onOpenBulkUpload}>
          <Upload className="mr-2 h-4 w-4" weight="light" />
          Bulk Upload
        </Button>
        <Button variant="outline" onClick={onOpenECMSImport}>
          <FileXls className="mr-2 h-4 w-4" weight="light" />
          ECMS Import
        </Button>
        <Button onClick={onOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" weight="light" />
          Add Product
        </Button>
      </div>
    </div>
  );
};
