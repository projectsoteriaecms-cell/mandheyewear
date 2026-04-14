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
import { getDeliveryEstimate } from "@/shared/lib/shippingZones";
import {
  Package,
  Search,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  ShoppingBag,
  Loader2,
  PackageCheck,
  Globe,
  ShieldCheck,
  Home,
  Mail,
  Phone,
} from "lucide-react";

type OrderStatus =
  | "pending" | "confirmed" | "processing" | "packed"
  | "ready_for_pickup" | "shipped" | "shipped_local" | "shipped_interstate"
  | "shipped_international" | "in_transit_hub" | "customs_clearance"
  | "in_transit_country" | "out_for_delivery" | "delivered" | "cancelled";

interface OrderData {
  id: string;
  order_number: string;
  order_status: OrderStatus;
  payment_status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  shipping_zone: string | null;
  shipping_fee: number | null;
  tracking_number: string | null;
  logistics_partner: string | null;
  estimated_delivery_date: string | null;
  shipping_address: {
    full_name?: string;
    fullName?: string;
    city?: string;
    state?: string;
    country?: string;
    landmark?: string;
    phone?: string;
    email?: string;
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

const ALL_STATUSES: OrderStatus[] = [
  "confirmed", "processing", "packed",
  "shipped_local", "shipped_interstate", "shipped_international",
  "in_transit_hub", "customs_clearance", "in_transit_country",
  "out_for_delivery", "delivered",
];

function getStepsForOrder(status: OrderStatus, zone: string | null): { key: OrderStatus; label: string; icon: typeof CheckCircle }[] {
  const isInternational = zone === "international" || zone === "africa_other" || zone === "west_africa";
  const isInterstate = zone && !["lagos_island", "lagos_mainland"].includes(zone) && !isInternational;

  const base = [
    { key: "confirmed" as OrderStatus, label: "Confirmed", icon: CheckCircle },
    { key: "processing" as OrderStatus, label: "Processing", icon: Package },
    { key: "packed" as OrderStatus, label: "Packed", icon: PackageCheck },
  ];

  if (isInternational) {
    return [
      ...base,
      { key: "shipped_international" as OrderStatus, label: "Shipped", icon: Globe },
      { key: "customs_clearance" as OrderStatus, label: "Customs", icon: ShieldCheck },
      { key: "in_transit_country" as OrderStatus, label: "In Transit", icon: Truck },
      { key: "delivered" as OrderStatus, label: "Delivered", icon: Home },
    ];
  }

  if (isInterstate) {
    return [
      ...base,
      { key: "shipped_interstate" as OrderStatus, label: "Shipped", icon: Truck },
      { key: "in_transit_hub" as OrderStatus, label: "Transit Hub", icon: MapPin },
      { key: "out_for_delivery" as OrderStatus, label: "Out for Delivery", icon: Truck },
      { key: "delivered" as OrderStatus, label: "Delivered", icon: Home },
    ];
  }

  return [
    ...base,
    { key: "shipped_local" as OrderStatus, label: "Shipped", icon: Truck },
    { key: "out_for_delivery" as OrderStatus, label: "Out for Delivery", icon: Truck },
    { key: "delivered" as OrderStatus, label: "Delivered", icon: Home },
  ];
}

function normalizeStatus(status: OrderStatus): OrderStatus {
  if (status === "shipped") return "shipped_local";
  if (status === "ready_for_pickup") return "packed";
  return status;
}

function getStatusIndex(status: OrderStatus, steps: { key: OrderStatus }[]): number {
  const normalized = normalizeStatus(status);
  const idx = steps.findIndex(s => s.key === normalized);
  if (idx >= 0) return idx;
  const allIdx = ALL_STATUSES.indexOf(normalized);
  for (let i = steps.length - 1; i >= 0; i--) {
    if (ALL_STATUSES.indexOf(steps[i].key) <= allIdx) return i;
  }
  return -1;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "shipped": case "shipped_local": case "shipped_interstate": case "shipped_international":
    case "in_transit_hub": case "in_transit_country": case "out_for_delivery":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "customs_clearance":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "processing": case "confirmed": case "packed":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const OPERATIONS_EMAIL = "operations_businessmanger@soteriaeyeclinic.com";

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
        shipping_zone,
        shipping_fee,
        shipping_address,
        tracking_number,
        logistics_partner,
        estimated_delivery_date,
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

  const steps = order ? getStepsForOrder(order.order_status, order.shipping_zone) : [];
  const currentStatusIndex = order ? getStatusIndex(order.order_status, steps) : -1;
  const deliveryEstimate = order?.shipping_zone ? getDeliveryEstimate(order.shipping_zone) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-36 pb-16 px-4 sm:px-6 lg:px-8">
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
                      {formatStatus(order.order_status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Placed on {format(new Date(order.created_at), "PPP")}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Status Timeline */}
                  {order.order_status !== "cancelled" && steps.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                          <div
                            className="h-full bg-accent transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, (currentStatusIndex / (steps.length - 1)) * 100))}%`,
                            }}
                          />
                        </div>

                        {steps.map((step) => {
                          const stepIdx = steps.findIndex(s => s.key === step.key);
                          const isCompleted = currentStatusIndex >= stepIdx;
                          const isCurrent = stepIdx === currentStatusIndex;
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
                                className={`text-xs mt-2 text-center max-w-[70px] ${
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

                  {/* Tracking Info */}
                  {(order.tracking_number || order.logistics_partner || order.estimated_delivery_date) && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                      <h3 className="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-300">📦 Shipment Details</h3>
                      <div className="space-y-1 text-sm">
                        {order.logistics_partner && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Carrier:</span> {order.logistics_partner}
                          </p>
                        )}
                        {order.tracking_number && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Tracking #:</span>{" "}
                            <span className="font-mono">{order.tracking_number}</span>
                          </p>
                        )}
                        {order.estimated_delivery_date && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Est. Delivery:</span>{" "}
                            {format(new Date(order.estimated_delivery_date), "PPP")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery Estimate from zone */}
                  {!order.estimated_delivery_date && deliveryEstimate && order.order_status !== "delivered" && order.order_status !== "cancelled" && (
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                      🕐 Estimated delivery: {deliveryEstimate}
                    </div>
                  )}

                  {/* Cancelled banner */}
                  {order.order_status === "cancelled" && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900 text-center">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        This order has been cancelled
                      </p>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Shipping To:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_address.full_name || order.shipping_address.fullName}
                        {" — "}
                        {order.shipping_address.city}
                        {order.shipping_address.state && `, ${order.shipping_address.state}`}
                        {order.shipping_address.country && order.shipping_address.country !== "Nigeria" && `, ${order.shipping_address.country}`}
                      </p>
                      {order.shipping_address.landmark && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {order.shipping_address.landmark}
                        </p>
                      )}
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

                  {/* Totals */}
                  <div className="border-t mt-4 pt-4 space-y-1">
                    {order.shipping_fee != null && order.shipping_fee > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Shipping</span>
                        <span>₦{order.shipping_fee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-accent">
                        ₦{order.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="border-primary/20">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">Need Help With Your Order?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact our operations team for shipping inquiries, delivery updates, or any order-related questions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`mailto:${OPERATIONS_EMAIL}?subject=Order Inquiry — ${order.order_number}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {OPERATIONS_EMAIL}
                    </a>
                    {order.shipping_address?.phone && (
                      <a
                        href={`tel:${order.shipping_address.phone}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        Call Support
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/contact">Need Help?</Link>
                </Button>
                <Button variant="hero" className="flex-1" asChild>
                  <Link to="/shop">Continue Shopping</Link>
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
