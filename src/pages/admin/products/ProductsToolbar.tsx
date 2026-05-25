import { Button } from "@/components/ui/button";
import {
  Plus,
  Upload,
  ImageSquare,
  FileXls,
  ArrowsClockwise,
  CloudArrowDown,
  CloudArrowUp,
  Sparkle,
  Database,
  TextAa,
} from "@phosphor-icons/react";

import { BulkPackagingFixButton } from "@/modules/products/components/BulkPackagingFixButton";

interface ProductsToolbarProps {
  isAdmin: boolean;
  isEnriching: boolean;
  enrichProgress: { enriched: number; remaining: number } | null;
  syncStatus: string;
  stockSyncStatus?: string;
  onEnrichProducts: () => void;
  onPullItems: () => void;
  onSyncStock?: () => void;
  onPushAllToZoho?: () => void;
  onOpenLinkDialog: () => void;
  onOpenBulkImageUpload: () => void;
  onOpenBulkUpload: () => void;
  onOpenECMSImport: () => void;
  onOpenCreateDialog: () => void;
  onOpenDataCleanup?: () => void;
  onOpenNameCleanup?: () => void;
  onOpenSeedDescriptions?: () => void;
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
  onPushAllToZoho,
  onOpenLinkDialog,
  onOpenBulkImageUpload,
  onOpenBulkUpload,
  onOpenECMSImport,
  onOpenCreateDialog,
  onOpenDataCleanup,
  onOpenNameCleanup,
  onOpenSeedDescriptions,
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
        {isAdmin && <BulkPackagingFixButton />}
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
        {isAdmin && onPushAllToZoho && (
          <Button variant="outline" onClick={onPushAllToZoho} disabled={syncStatus === "syncing"}>
            <CloudArrowUp className="mr-2 h-4 w-4" weight="light" />
            Push to Zoho
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
        {isAdmin && onOpenDataCleanup && (
          <Button variant="outline" onClick={onOpenDataCleanup}>
            <Database className="mr-2 h-4 w-4" weight="light" />
            Data Update
          </Button>
        )}
        {isAdmin && onOpenNameCleanup && (
          <Button variant="outline" onClick={onOpenNameCleanup}>
            <TextAa className="mr-2 h-4 w-4" weight="light" />
            Clean Names
          </Button>
        )}
        {isAdmin && onOpenSeedDescriptions && (
          <Button variant="outline" onClick={onOpenSeedDescriptions}>
            <Sparkle className="mr-2 h-4 w-4" weight="light" />
            Seed Descriptions
          </Button>
        )}
        <Button onClick={onOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" weight="light" />
          Add Product
        </Button>
      </div>
    </div>
  );
};
