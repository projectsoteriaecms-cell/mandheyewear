import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Package, ShoppingBag, Truck, ExternalLink, Wrench } from "lucide-react";
import { format } from "date-fns";
import { FittingBookingDialog } from "@/components/fitting/FittingBookingDialog";
import { useOrders } from "@/modules/orders";
import { EmptyState } from "@/modules/storefront";

interface OrderHistorySectionProps {
  userId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "shipped":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "processing":
    case "confirmed":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "shipped":
    case "delivered":
      return <Truck className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

export const OrderHistorySection = ({ userId }: OrderHistorySectionProps) => {
  const { data: orders, isLoading } = useOrders(userId);
  const [fittingOrder, setFittingOrder] = useState<{ id: string; number: string } | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past purchases</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/track-order">
              <Truck className="mr-2 h-4 w-4" />
              Track Order
            </Link>
          </Button>

        </div>
      </CardHeader>
      <CardContent>
        {!orders || orders.length === 0 ? (
          <EmptyState
            type="orders"
            title="No orders yet"
            description="Your order history will appear here once you make a purchase. Ready to find your perfect frames?"
            actionLabel="Start Shopping"
            actionHref="/shop"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{order.order_number}</p>
                      <Link
                        to={`/order/${order.id}`}
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "PPP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(order.order_status)} flex items-center gap-1`}>
                      {getStatusIcon(order.order_status)}
                      {order.order_status.replace("_", " ")}
                    </Badge>
                    <span className="font-bold text-accent">
                      ₦{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2">
                        {order.order_items.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id}
                            className="h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center overflow-hidden"
                          >
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                            +{order.order_items.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {order.order_items.length} item{order.order_items.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/order/${order.id}`}>View Details</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/track-order?order=${order.order_number}`}>
                      Track
                    </Link>
                  </Button>
                  {/* Fitting button — only when Rx items still need fitting */}
                  {order.order_items?.some(
                    (i: any) => i.requires_fitting && !i.fitting_booked
                  ) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/40 text-primary hover:bg-primary/5"
                      onClick={() =>
                        setFittingOrder({ id: order.id, number: order.order_number })
                      }
                    >
                      <Wrench className="h-3.5 w-3.5 mr-1.5" />
                      Book Fitting
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {fittingOrder && (
        <FittingBookingDialog
          open={!!fittingOrder}
          onOpenChange={(open) => !open && setFittingOrder(null)}
          orderId={fittingOrder.id}
          orderNumber={fittingOrder.number}
        />
      )}
    </Card>
  );
};
