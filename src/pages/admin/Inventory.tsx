import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/shared/layouts/admin";
import { useInventoryOverview, useInventoryStats, BulkStockImportDialog } from "@/modules/inventory";
import { useBranches } from "@/modules/branches";

import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/shared/layouts/admin/dashboard/StatCard";
import { InventoryFilters } from "./inventory/InventoryFilters";
import { ReconciliationCard } from "./inventory/ReconciliationCard";
import { InventoryTable } from "./inventory/InventoryTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Package,
  Upload,
  ArrowsClockwise,
  WarningCircle,
  Cube,
  XCircle,
} from "@phosphor-icons/react";

import { formatDistanceToNow } from "date-fns";
import { useZohoSync } from "@/modules/integrations";

const getStockStatus = (quantity: number, threshold: number) => {
  if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const };
  if (quantity <= threshold) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "default" as const };
};

const useLastStockSync = () => {
  return useQuery({
    queryKey: ["last-stock-sync"],
    queryFn: async () => {
      const { data } = await supabase
        .from("zoho_sync_log")
        .select("completed_at, status, records_processed, metadata")
        .eq("sync_type", "stock")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: 30000,
  });
};

const Inventory = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const { data: branches } = useBranches();
  const { data: inventory, isLoading: inventoryLoading } = useInventoryOverview(
    selectedBranch === "all" ? undefined : selectedBranch,
    showLowStockOnly
  );
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { status: syncStatus, syncStock } = useZohoSync();
  const { data: lastSync } = useLastStockSync();

  const filteredInventory = inventory?.filter(
    (item) =>
      item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (!filteredInventory) return;
    const headers = ["SKU", "Product Name", "Branch", "Quantity", "Reserved", "Available", "Status"];
    const rows = filteredInventory.map((item) => [
      item.product?.sku || "",
      item.product?.name || "",
      item.branch?.name || "",
      item.quantity_on_hand,
      item.quantity_reserved,
      item.quantity_on_hand - item.quantity_reserved,
      getStockStatus(item.quantity_on_hand, item.low_stock_threshold).label,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const isSyncing = syncStatus === "syncing";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Overview</h1>
            <p className="text-muted-foreground">
              View and manage inventory across all branches
              {lastSync?.completed_at && (
                <span className="ml-2 text-xs">
                  · Last synced {formatDistanceToNow(new Date(lastSync.completed_at), { addSuffix: true })}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => syncStock()}
              variant="outline"
              disabled={isSyncing}
            >
              <ArrowsClockwise
                className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                weight="light"
              />
              {isSyncing ? "Syncing…" : "Sync from Zoho"}
            </Button>
            <Button onClick={() => setImportDialogOpen(true)} variant="outline">
              <Upload className="mr-2 h-4 w-4" weight="light" />
              Import Stock
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" weight="light" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Stock Units"
            value={stats?.totalItems?.toLocaleString() ?? "–"}
            icon={Cube}
            loading={statsLoading}
          />
          <StatCard
            title="Low Stock Items"
            value={stats?.lowStockCount ?? "–"}
            icon={WarningCircle}
            variant="warning"
            loading={statsLoading}
          />
          <StatCard
            title="Out of Stock"
            value={stats?.outOfStockCount ?? "–"}
            icon={XCircle}
            variant="danger"
            loading={statsLoading}
          />
          <StatCard
            title="Active Products"
            value={stats?.productCount?.toLocaleString() ?? "–"}
            icon={Package}
            loading={statsLoading}
          />
        </div>

        {/* Zoho Reconciliation */}
        <ReconciliationCard />

        {/* Filters */}
        <InventoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          branches={branches}
          showLowStockOnly={showLowStockOnly}
          onToggleLowStock={() => setShowLowStockOnly(!showLowStockOnly)}
        />

        {/* Inventory Table */}
        <InventoryTable
          items={filteredInventory}
          loading={inventoryLoading}
          showLowStockOnly={showLowStockOnly}
        />

        {/* Summary */}
        {filteredInventory && filteredInventory.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredInventory.length} items
            {selectedBranch !== "all" && (
              <> for {branches?.find((b) => b.id === selectedBranch)?.name}</>
            )}
          </div>
        )}
      </div>

      <BulkStockImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </AdminLayout>
  );
};

export default Inventory;
