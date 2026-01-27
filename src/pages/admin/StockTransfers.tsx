import { useState } from "react";
import { AdminLayout } from "@/shared/components/admin";
import { useStockTransfers, useUpdateTransferStatus } from "@/modules/inventory";
import { useUserRole } from "@/shared/hooks/useUserRole";
import { canApproveStockTransfer, canCompleteStockTransfer } from "@/shared/lib/permissions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  ArrowLeftRight,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Link, useSearchParams } from "react-router-dom";
import { CreateStockTransferDialog } from "@/components/admin/transfers/CreateStockTransferDialog";
import type { Database } from "@/integrations/supabase/types";

type TransferStatus = Database["public"]["Enums"]["transfer_status"];

const statusColors: Record<TransferStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  in_transit: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  received: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const StockTransfers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(
    searchParams.get("new") === "true"
  );

  const { data: transfers, isLoading } = useStockTransfers(
    statusFilter === "all" ? undefined : (statusFilter as TransferStatus)
  );
  const { data: role } = useUserRole();
  const updateStatus = useUpdateTransferStatus();

  const handleStatusChange = (id: string, status: TransferStatus) => {
    updateStatus.mutate({ id, status });
  };

  const closeDialog = () => {
    setShowCreateDialog(false);
    setSearchParams({});
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Transfers</h1>
            <p className="text-muted-foreground">
              Move inventory between branches
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transfers Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transfers && transfers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer #</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Shipped</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-mono font-medium">
                        {transfer.transfer_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{transfer.from_branch?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {transfer.from_branch?.city}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{transfer.to_branch?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {transfer.to_branch?.city}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(transfer.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {transfer.shipped_at
                          ? format(new Date(transfer.shipped_at), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {transfer.completed_at
                          ? format(new Date(transfer.completed_at), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[transfer.status]}
                        >
                          {transfer.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/inventory/transfers/${transfer.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {transfer.status === "pending" && canApproveStockTransfer(role) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(transfer.id, "in_transit")
                                  }
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Mark as Shipped
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(transfer.id, "cancelled")
                                  }
                                  className="text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Transfer
                                </DropdownMenuItem>
                              </>
                            )}
                            {transfer.status === "in_transit" && canCompleteStockTransfer(role) && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(transfer.id, "received")
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Mark as Received
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <ArrowLeftRight className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No transfers found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first stock transfer to move inventory between branches
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Transfer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateStockTransferDialog
        open={showCreateDialog}
        onOpenChange={closeDialog}
      />
    </AdminLayout>
  );
};

export default StockTransfers;
