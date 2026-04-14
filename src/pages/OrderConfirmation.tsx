import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  ArrowRight,
  ShoppingBag,
  Calendar,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            product:products (
              id,
              name,
              image_url
            )
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId && isAuthenticated,
  });

  const handleCopyOrderNumber = async () => {
    if (order?.order_number) {
      await navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Order number copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find this order. It may have been removed or doesn't exist.
          </p>
          <Button variant="hero" asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const shippingAddress = order.shipping_address as { 
    fullName?: string;
    address?: string;
    city?: string;
    state?: string;
  } | null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          {/* Order Number Card */}
          <Card className="mb-6 border-2 border-accent/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {order.order_number}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyOrderNumber}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                {format(new Date(order.created_at), "PPP 'at' p")}
              </p>
            </CardContent>
          </Card>

          {/* Order Status Timeline */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-4">Order Status</h2>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="text-xs mt-2 text-center">Confirmed</span>
                </div>
                <div className="flex-1 h-1 bg-muted mx-2" />
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-xs mt-2 text-center">Processing</span>
                </div>
                <div className="flex-1 h-1 bg-muted mx-2" />
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-xs mt-2 text-center">Shipped</span>
                </div>
                <div className="flex-1 h-1 bg-muted mx-2" />
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-xs mt-2 text-center">Delivered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || "Product"}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-accent">
                      ₦{item.price_at_purchase.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">
                    ₦{order.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {shippingAddress && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="font-semibold text-foreground mb-2">Shipping Address</h2>
                <p className="text-muted-foreground">
                  {shippingAddress.fullName}<br />
                  {shippingAddress.address}<br />
                  {shippingAddress.city}, {shippingAddress.state}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" className="flex-1" asChild>
              <Link to="/dashboard?tab=orders">
                View All Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
