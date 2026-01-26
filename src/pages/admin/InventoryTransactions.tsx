import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { ArrowDownLeft, ArrowUpRight, RefreshCw, History } from "lucide-react";
import { useInventoryTransactions } from "@/hooks/admin/useInventoryTransactions";
import { useBranches } from "@/hooks/useBranches";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const transactionTypeConfig: Record<string, { label: string; color: string; icon: typeof ArrowUpRight }> = {
  purchase_received: { label: "Purchase Received", color: "bg-green-100 text-green-800", icon: ArrowDownLeft },
  sale: { label: "Sale", color: "bg-blue-100 text-blue-800", icon: ArrowUpRight },
  return_in: { label: "Return In", color: "bg-emerald-100 text-emerald-800", icon: ArrowDownLeft },
  return_out: { label: "Return Out", color: "bg-orange-100 text-orange-800", icon: ArrowUpRight },
  transfer_in: { label: "Transfer In", color: "bg-cyan-100 text-cyan-800", icon: ArrowDownLeft },
  transfer_out: { label: "Transfer Out", color: "bg-purple-100 text-purple-800", icon: ArrowUpRight },
  adjustment: { label: "Adjustment", color: "bg-yellow-100 text-yellow-800", icon: RefreshCw },
  write_off: { label: "Write Off", color: "bg-red-100 text-red-800", icon: ArrowUpRight },
  initial_stock: { label: "Initial Stock", color: "bg-gray-100 text-gray-800", icon: ArrowDownLeft },
};

const InventoryTransactions = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const { data: branches = [] } = useBranches();
  const { data: transactions = [], isLoading } = useInventoryTransactions(
    selectedBranch !== "all" ? selectedBranch : undefined
  );

  const getQuantityDisplay = (change: number) => {
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
        <div>
          <h1 className="text-2xl font-bold">Inventory Transactions</h1>
          <p className="text-muted-foreground">
            Complete audit trail of all stock movements
          </p>
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

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No transactions found</p>
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
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => {
                      const config = transactionTypeConfig[tx.transaction_type] || {
                        label: tx.transaction_type,
                        color: "bg-gray-100 text-gray-800",
                        icon: RefreshCw,
                      };

                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(tx.created_at), "MMM d, yyyy")}
                            <span className="text-muted-foreground text-xs block">
                              {format(new Date(tx.created_at), "h:mm a")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.color} border-0`}>
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {(tx.product as any)?.name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(tx.product as any)?.sku ?? "—"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(tx.branch as any)?.name ?? "Unknown"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {tx.quantity_before}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {getQuantityDisplay(tx.quantity_change)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {tx.quantity_after}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {tx.notes || "—"}
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
    </AdminLayout>
  );
};

export default InventoryTransactions;
