import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Package,
  Search,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  ShoppingBag,
  Loader2,
} from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "processing" | "ready_for_pickup" | "shipped" | "delivered" | "cancelled";

interface OrderData {
  id: string;
  order_number: string;
  order_status: OrderStatus;
  payment_status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  shipping_address: {
    fullName?: string;
    city?: string;
    state?: string;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_purchase: number;
    product: {
      name: string;
      image_url: string | null;
    } | null;
  }>;
}

const statusSteps: { key: OrderStatus; label: string; icon: typeof CheckCircle }[] = [
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const getStatusColor = (status: OrderStatus) => {
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

const getStatusIndex = (status: OrderStatus): number => {
  const statusOrder: OrderStatus[] = ["pending", "confirmed", "processing", "ready_for_pickup", "shipped", "delivered"];
  return statusOrder.indexOf(status);
};

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get("order") || "";
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        order_status,
        payment_status,
        total_amount,
        created_at,
        updated_at,
        shipping_address,
        order_items (
          id,
          quantity,
          price_at_purchase,
          product:products (
            name,
            image_url
          )
        )
      `)
      .eq("order_number", orderNumber.trim())
      .maybeSingle();

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to search for order. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setOrder(data as unknown as OrderData);
  };

  const currentStatusIndex = order ? getStatusIndex(order.order_status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your order number to check the delivery status
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter order number (e.g., ORD-20250127-1234)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="hero" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Track"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Searching for your order...</p>
            </div>
          ) : hasSearched && !order ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find an order with that number. Please check and try again.
              </p>
              <Button variant="outline" asChild>
                <Link to="/dashboard">View My Orders</Link>
              </Button>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <Badge className={getStatusColor(order.order_status)}>
                      {order.order_status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Placed on {format(new Date(order.created_at), "PPP")}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Status Timeline */}
                  {order.order_status !== "cancelled" && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                          <div
                            className="h-full bg-accent transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (currentStatusIndex / (statusSteps.length - 1)) * 100)}%`,
                            }}
                          />
                        </div>

                        {statusSteps.map((step, index) => {
                          const isCompleted = currentStatusIndex >= statusSteps.findIndex(s => s.key === step.key);
                          const isCurrent = order.order_status === step.key;
                          const Icon = step.icon;

                          return (
                            <div
                              key={step.key}
                              className="flex flex-col items-center relative z-10"
                            >
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                                  isCompleted
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-muted text-muted-foreground"
                                } ${isCurrent ? "ring-2 ring-accent ring-offset-2" : ""}`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <span
                                className={`text-xs mt-2 text-center ${
                                  isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Shipping To:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_address.fullName} — {order.shipping_address.city}, {order.shipping_address.state}
                      </p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                          {item.product?.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.product?.name || "Product"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-accent">
                          ₦{item.price_at_purchase.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">
                      ₦{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/contact">Need Help?</Link>
                </Button>
                <Button variant="hero" className="flex-1" asChild>
                  <Link to="/eyewear">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTracking;
