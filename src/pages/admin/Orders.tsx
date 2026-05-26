import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/shared/layouts/admin";
import { supabase } from "@/integrations/supabase/client";
import { useZohoSync } from "@/modules/integrations/hooks/useZohoSync";
import { useUpdateOrderStatus } from "@/modules/orders/hooks/useUpdateOrderStatus";
import { OrderDetailSheet } from "./orders/OrderDetailSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ArrowsClockwise,
  MagnifyingGlass,
  Receipt,
  DotsThreeVertical,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Eyeglasses,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];

interface OrderRow {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  currency: string | null;
  created_at: string;
  user_id: string;
  tracking_number: string | null;
  logistics_partner: string | null;
  estimated_delivery_date: string | null;
  has_rx_items?: boolean;
  needs_fitting?: boolean;
}

const useAdminOrders = () => {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id, order_number, order_status, payment_status,
          total_amount, currency, created_at, user_id,
          tracking_number, logistics_partner, estimated_delivery_date,
          order_items (lens_type, requires_fitting, fitting_booked)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (orders || []).map((o: any) => ({
        ...o,
        has_rx_items: o.order_items?.some(
          (i: any) => i.lens_type && i.lens_type !== "frame_only"
        ) ?? false,
        needs_fitting: o.order_items?.some(
          (i: any) => i.requires_fitting && !i.fitting_booked
        ) ?? false,
      })) as OrderRow[];
    },
  });
};

const statusVariant = (status: string) => {
  switch (status) {
    case "confirmed":
    case "delivered":
      return "default" as const;
    case "pending":
    case "processing":
      return "secondary" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

const paymentVariant = (status: string) => {
  switch (status) {
    case "paid":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "failed":
    case "refunded":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ["confirmed", "processing", "cancelled"],
  confirmed: ["processing", "packed", "cancelled"],
  processing: ["packed", "ready_for_pickup", "cancelled"],
  packed: ["shipped", "shipped_local", "shipped_interstate", "shipped_international", "ready_for_pickup"],
  ready_for_pickup: ["delivered", "cancelled"],
  shipped: ["in_transit_hub", "out_for_delivery", "delivered"],
  shipped_local: ["out_for_delivery", "delivered"],
  shipped_interstate: ["in_transit_hub", "delivered"],
  shipped_international: ["customs_clearance", "in_transit_country", "delivered"],
  in_transit_hub: ["in_transit_country", "out_for_delivery", "delivered"],
  customs_clearance: ["in_transit_country", "delivered"],
  in_transit_country: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
};

const SHIPPED_STATUSES: OrderStatus[] = [
  "shipped", "shipped_local", "shipped_interstate", "shipped_international",
];

const STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  ready_for_pickup: "Ready for Pickup",
  shipped: "Shipped",
  shipped_local: "Shipped (Local)",
  shipped_interstate: "Shipped (Interstate)",
  shipped_international: "Shipped (International)",
  in_transit_hub: "In Transit (Hub)",
  customs_clearance: "Customs",
  in_transit_country: "In Transit (Country)",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const Orders = () => {
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pushingOrderId, setPushingOrderId] = useState<string | null>(null);
  const [shippingDialog, setShippingDialog] = useState<{
    orderId: string;
    targetStatus: OrderStatus;
  } | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [logisticsPartner, setLogisticsPartner] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const { data: orders, isLoading } = useAdminOrders();
  const { pushOrder } = useZohoSync();
  const updateStatus = useUpdateOrderStatus();

  const filtered = orders?.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase())
  );

  const handlePushToZoho = async (orderId: string) => {
    setPushingOrderId(orderId);
    try {
      await pushOrder(orderId);
      toast.success("Order pushed to Zoho Books successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to push order";
      toast.error(msg);
    } finally {
      setPushingOrderId(null);
    }
  };

  const handleStatusChange = (orderId: string, targetStatus: OrderStatus) => {
    // If shipping status, show dialog to collect tracking info
    if (SHIPPED_STATUSES.includes(targetStatus)) {
      setShippingDialog({ orderId, targetStatus });
      setTrackingNumber("");
      setLogisticsPartner("");
      setEstimatedDelivery("");
      return;
    }

    updateStatus.mutate({
      orderId,
      newStatus: targetStatus,
    });
  };

  const handleShippingSubmit = () => {
    if (!shippingDialog) return;
    updateStatus.mutate({
      orderId: shippingDialog.orderId,
      newStatus: shippingDialog.targetStatus,
      trackingNumber: trackingNumber || null,
      estimatedDeliveryDate: estimatedDelivery || null,
      logisticsPartner: logisticsPartner || null,
    });
    setShippingDialog(null);
  };

  const getAvailableTransitions = (currentStatus: string): OrderStatus[] => {
    return STATUS_TRANSITIONS[currentStatus] || [];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage orders, update status & trigger notifications
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" weight="light" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Rx</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : !filtered?.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => {
                    const transitions = getAvailableTransitions(order.order_status);
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(order.order_status)}>
                            {STATUS_LABELS[order.order_status as OrderStatus] || order.order_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentVariant(order.payment_status)}>
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.has_rx_items && (
                            <div className="flex items-center gap-1">
                              <Eyeglasses
                                weight="duotone"
                                className={`h-4 w-4 ${order.needs_fitting ? "text-amber-500" : "text-primary"}`}
                              />
                              {order.needs_fitting && (
                                <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
                                  Fitting
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₦{order.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePushToZoho(order.id)}
                              disabled={pushingOrderId === order.id}
                            >
                              <ArrowsClockwise
                                className={`mr-1 h-3 w-3 ${pushingOrderId === order.id ? "animate-spin" : ""}`}
                                weight="light"
                              />
                              Zoho
                            </Button>

                            {transitions.length > 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <DotsThreeVertical className="h-4 w-4" weight="bold" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {transitions.map((status) => {
                                    const isShipped = SHIPPED_STATUSES.includes(status);
                                    const isDelivered = status === "delivered";
                                    const isCancelled = status === "cancelled";

                                    return (
                                      <DropdownMenuItem
                                        key={status}
                                        onClick={() => handleStatusChange(order.id, status)}
                                        className={isCancelled ? "text-destructive" : ""}
                                      >
                                        {isShipped && <Truck className="mr-2 h-4 w-4" weight="light" />}
                                        {isDelivered && <CheckCircle className="mr-2 h-4 w-4" weight="light" />}
                                        {isCancelled && <XCircle className="mr-2 h-4 w-4" weight="light" />}
                                        {!isShipped && !isDelivered && !isCancelled && <Package className="mr-2 h-4 w-4" weight="light" />}
                                        {STATUS_LABELS[status] || status}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Sheet */}
      <OrderDetailSheet
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      {/* Shipping Details Dialog */}
      <Dialog open={!!shippingDialog} onOpenChange={(open) => !open && setShippingDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" weight="light" />
              Shipping Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                placeholder="e.g. GIG-12345678"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logistics">Logistics Partner</Label>
              <Select value={logisticsPartner} onValueChange={setLogisticsPartner}>
                <SelectTrigger>
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GIG Logistics">GIG Logistics</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="FedEx">FedEx</SelectItem>
                  <SelectItem value="Kwik">Kwik Delivery</SelectItem>
                  <SelectItem value="Fez Delivery">Fez Delivery</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Estimated Delivery Date</Label>
              <Input
                id="delivery-date"
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleShippingSubmit} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? "Updating…" : "Mark as Shipped & Notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Orders;
