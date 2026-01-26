import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePurchaseOrders, useUpdatePurchaseOrderStatus } from "@/hooks/admin/usePurchaseOrders";
import { useIsManager } from "@/hooks/useUserRole";
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
  CheckCircle,
  XCircle,
  Package,
  Truck,
} from "lucide-react";
import { format } from "date-fns";
import { Link, useSearchParams } from "react-router-dom";
import { CreatePurchaseOrderDialog } from "@/components/admin/purchase-orders/CreatePurchaseOrderDialog";
import type { Database } from "@/integrations/supabase/types";

type PurchaseOrderStatus = Database["public"]["Enums"]["purchase_order_status"];

const statusColors: Record<PurchaseOrderStatus, string> = {
  draft: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  partially_received: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  received: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const PurchaseOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(
    searchParams.get("new") === "true"
  );

  const { data: orders, isLoading } = usePurchaseOrders(
    statusFilter === "all" ? undefined : (statusFilter as PurchaseOrderStatus)
  );
  const { isManager } = useIsManager();
  const updateStatus = useUpdatePurchaseOrderStatus();

  const handleStatusChange = (id: string, status: PurchaseOrderStatus) => {
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
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">
              Manage orders from suppliers
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="partially_received">Partially Received</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>{order.supplier?.name}</TableCell>
                      <TableCell>
                        <div>
                          <p>{order.branch?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.branch?.city}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.order_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {order.expected_delivery_date
                          ? format(
                              new Date(order.expected_delivery_date),
                              "MMM d, yyyy"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₦{order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[order.status]}
                        >
                          {order.status.replace(/_/g, " ")}
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
                              <Link to={`/admin/inventory/purchase-orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {order.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(order.id, "submitted")
                                }
                              >
                                <Truck className="mr-2 h-4 w-4" />
                                Submit for Approval
                              </DropdownMenuItem>
                            )}
                            {order.status === "submitted" && isManager && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "approved")
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "cancelled")
                                  }
                                  className="text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {(order.status === "approved" ||
                              order.status === "partially_received") && (
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/admin/inventory/purchase-orders/${order.id}/receive`}
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  Receive Goods
                                </Link>
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
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No purchase orders found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first purchase order to get started
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Purchase Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreatePurchaseOrderDialog
        open={showCreateDialog}
        onOpenChange={closeDialog}
      />
    </AdminLayout>
  );
};

export default PurchaseOrders;
