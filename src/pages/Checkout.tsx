import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShippingAddressForm, type ShippingFormData } from "@/components/checkout/ShippingAddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingBag, Loader2, CreditCard, Shield } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { cartItems, cartTotal, isLoading: cartLoading } = useCart();
  const { data: profile } = useProfile(user?.id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
  };

  const handlePayment = async () => {
    if (!shippingData) {
      toast({
        title: "Missing Information",
        description: "Please fill in your shipping details first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // TODO: Integrate Paystack payment here
    // For now, show a placeholder message
    setTimeout(() => {
      toast({
        title: "Payment Integration Pending",
        description: "Paystack payment will be integrated soon. Your order details have been saved.",
      });
      setIsProcessing(false);
    }, 1500);
  };

  // Loading state
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to proceed with checkout.
          </p>
          <Button variant="hero" asChild>
            <Link to="/login?redirect=/checkout">Sign In</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before checking out.
          </p>
          <Button variant="hero" asChild>
            <Link to="/eyewear">Shop Eyewear</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const shippingFee = cartTotal > 50000 ? 0 : 3500;
  const orderTotal = cartTotal + shippingFee;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </span>
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShippingAddressForm
                  onSubmit={handleShippingSubmit}
                  defaultValues={{
                    fullName: profile?.full_name || "",
                    email: profile?.email || user?.email || "",
                    phone: profile?.phone_number || "",
                  }}
                />
                {!shippingData && (
                  <Button
                    type="submit"
                    form="shipping-form"
                    className="mt-4 w-full md:w-auto"
                    variant="hero"
                  >
                    Continue to Payment
                  </Button>
                )}
                {shippingData && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      ✓ Shipping address saved
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => setShippingData(null)}
                    >
                      Edit address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className={!shippingData ? "opacity-50 pointer-events-none" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </span>
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Pay with Paystack</p>
                    <p className="text-sm text-muted-foreground">
                      Cards, Bank Transfer, USSD
                    </p>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing || !shippingData}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₦${orderTotal.toLocaleString()}`
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secured by Paystack</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary cartItems={cartItems} subtotal={cartTotal} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
