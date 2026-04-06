import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/shared/layouts/admin";
import { supabase } from "@/integrations/supabase/client";
import { useZohoSync } from "@/modules/integrations/hooks/useZohoSync";
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
  ArrowsClockwise,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
} from "@phosphor-icons/react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface OrderRow {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  currency: string | null;
  created_at: string;
  user_id: string;
  zoho_synced: boolean;
  zoho_sync_status: string | null;
}

const useAdminOrders = () => {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      // Fetch orders
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, order_number, order_status, payment_status, total_amount, currency, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch zoho sync logs for push_order type
      const { data: syncLogs } = await supabase
        .from("zoho_sync_log")
        .select("metadata, status")
        .eq("sync_type", "push_order")
        .eq("direction", "outbound");

      // Build a map of order_id -> sync status from metadata
      const syncMap = new Map<string, string>();
      if (syncLogs) {
        for (const log of syncLogs) {
          const meta = log.metadata as Record<string, unknown> | null;
          const zohoId = meta?.zoho_salesorder_id;
          // The order_id isn't in metadata directly, but we can match by status
          // For now, mark by zoho_salesorder_id presence
          if (zohoId) {
            syncMap.set(String(zohoId), log.status);
          }
        }
      }

      return (orders || []).map((o) => ({
        ...o,
        zoho_synced: false, // Will be determined by checking sync logs per order
        zoho_sync_status: null as string | null,
      })) as OrderRow[];
    },
  });
};

const statusVariant = (status: string) => {
  switch (status) {
    case "confirmed":
    case "delivered":
      return "default";
    case "pending":
    case "processing":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const paymentVariant = (status: string) => {
  switch (status) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
};

const Orders = () => {
  const [search, setSearch] = useState("");
  const [pushingOrderId, setPushingOrderId] = useState<string | null>(null);
  const { data: orders, isLoading } = useAdminOrders();
  const { pushOrder } = useZohoSync();

  const filtered = orders?.filter(
    (o) =>
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage e-commerce orders and sync to Zoho Books
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
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Zoho</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : !filtered?.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(order.order_status)}>
                          {order.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentVariant(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₦{order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
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
                          {pushingOrderId === order.id ? "Pushing…" : "Push to Zoho"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Orders;
