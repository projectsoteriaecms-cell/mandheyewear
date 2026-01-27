import { useState } from "react";
import { AdminLayout } from "@/shared/components/admin";
import { useInventoryOverview } from "@/modules/inventory";
import { useBranches } from "@/modules/branches";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, AlertTriangle, Package } from "lucide-react";

const getStockStatus = (quantity: number, threshold: number) => {
  if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const };
  if (quantity <= threshold) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "default" as const };
};

const StockStatusBadge = ({
  quantity,
  threshold,
}: {
  quantity: number;
  threshold: number;
}) => {
  const status = getStockStatus(quantity, threshold);
  
  if (status.variant === "warning") {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
        {status.label}
      </Badge>
    );
  }
  
  return <Badge variant={status.variant}>{status.label}</Badge>;
};

const Inventory = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: inventory, isLoading: inventoryLoading } = useInventoryOverview(
    selectedBranch === "all" ? undefined : selectedBranch,
    showLowStockOnly
  );

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Overview</h1>
            <p className="text-muted-foreground">
              View and manage inventory across all branches
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={showLowStockOnly ? "default" : "outline"}
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Low Stock Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            {inventoryLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredInventory && filteredInventory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Reserved</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bin Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {item.product?.sku}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.product?.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {item.product?.item_type?.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{item.branch?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.branch?.city}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantity_on_hand}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantity_reserved}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantity_on_hand - item.quantity_reserved}
                      </TableCell>
                      <TableCell>
                        <StockStatusBadge
                          quantity={item.quantity_on_hand}
                          threshold={item.low_stock_threshold || 5}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.bin_location || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No inventory found</h3>
                <p className="text-muted-foreground">
                  {showLowStockOnly
                    ? "No items are currently low on stock"
                    : "Try adjusting your search or filters"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
    </AdminLayout>
  );
};

export default Inventory;
