import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, PackageMinus, RotateCcw, Trash2, HelpCircle } from "lucide-react";
import { useStockAdjustments } from "@/hooks/admin/useStockAdjustments";
import { useBranches } from "@/hooks/useBranches";
import { useUserRole } from "@/hooks/useUserRole";
import { canCreateStockAdjustment } from "@/lib/permissions";
import { CreateAdjustmentDialog } from "@/components/admin/adjustments/CreateAdjustmentDialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const adjustmentTypeConfig = {
  count_correction: {
    label: "Count Correction",
    icon: RotateCcw,
    variant: "secondary" as const,
  },
  damage: {
    label: "Damage",
    icon: AlertTriangle,
    variant: "destructive" as const,
  },
  expiry: {
    label: "Expiry",
    icon: PackageMinus,
    variant: "outline" as const,
  },
  write_off: {
    label: "Write Off",
    icon: Trash2,
    variant: "destructive" as const,
  },
  other: {
    label: "Other",
    icon: HelpCircle,
    variant: "secondary" as const,
  },
};

const StockAdjustments = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: branches = [] } = useBranches();
  const { data: role } = useUserRole();
  const { adjustments, isLoading } = useStockAdjustments(
    selectedBranch !== "all" ? selectedBranch : undefined
  );

  const getQuantityDisplay = (change: number | null) => {
    if (change === null) return "—";
    const prefix = change > 0 ? "+" : "";
    return (
      <span className={change > 0 ? "text-green-600" : "text-destructive"}>
        {prefix}{change}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Stock Adjustments</h1>
            <p className="text-muted-foreground">
              Manual inventory corrections for damage, write-offs, and count discrepancies
            </p>
          </div>
          {canCreateStockAdjustment(role) && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Adjustment
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="w-[200px]">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adjustments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Adjustment History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : adjustments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PackageMinus className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No stock adjustments found</p>
                <p className="text-sm">Create your first adjustment to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Before</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">After</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adjustment) => {
                      const config = adjustmentTypeConfig[adjustment.adjustment_type];
                      const Icon = config.icon;

                      return (
                        <TableRow key={adjustment.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(adjustment.created_at), "MMM d, yyyy")}
                            <span className="text-muted-foreground text-xs block">
                              {format(new Date(adjustment.created_at), "h:mm a")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={config.variant} className="gap-1">
                              <Icon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {(adjustment.product as any)?.name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(adjustment.product as any)?.sku ?? "—"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(adjustment.branch as any)?.name ?? "Unknown"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {adjustment.quantity_before}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {getQuantityDisplay(adjustment.quantity_change)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {adjustment.quantity_after}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {adjustment.reason}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateAdjustmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </AdminLayout>
  );
};

export default StockAdjustments;
