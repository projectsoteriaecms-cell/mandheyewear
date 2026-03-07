import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { canPurchase } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ShoppingBag, Loader2, CreditCard, Shield, User, CheckCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PAYSTACK_PUBLIC_KEY = "pk_test_b65019a2e28f286dd4906d6aaa80bff38f035460";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

// Load Paystack inline script
const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.head.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { cartItems, cartTotal, isLoading: cartLoading, clearCart } = useCart();
  const { data: profile } = useProfile(user?.id);
  const { trackInitiateCheckout } = useMetaPixel();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasTrackedCheckout, setHasTrackedCheckout] = useState(false);
  
  // Shipping form state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  // Pre-fill user details
  const fullName = profile?.full_name || "";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone_number || "";

  const userCanPurchase = canPurchase(role ?? null);

  // Load Paystack script on mount
  useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

  // Track InitiateCheckout event
  useEffect(() => {
    if (!hasTrackedCheckout && cartItems.length > 0 && !cartLoading && isAuthenticated) {
      trackInitiateCheckout({
        content_ids: cartItems.map(item => item.product_id),
        value: cartTotal,
        currency: "NGN",
        num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      });
      setHasTrackedCheckout(true);
    }
  }, [cartItems, cartTotal, cartLoading, isAuthenticated, hasTrackedCheckout, trackInitiateCheckout]);

  const handleConfirmAddress = () => {
    if (!address.trim() || address.length < 5) {
      toast({ title: "Please enter a valid delivery address", variant: "destructive" });
      return;
    }
    if (!city.trim() || city.length < 2) {
      toast({ title: "Please enter your city", variant: "destructive" });
      return;
    }
    if (!state) {
      toast({ title: "Please select your state", variant: "destructive" });
      return;
    }
    setAddressConfirmed(true);
  };

  const handlePayment = async () => {
    if (!addressConfirmed) {
      toast({
        title: "Missing Information",
        description: "Please confirm your delivery address first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Ensure Paystack script is loaded
      await loadPaystackScript();

      const shippingFee = cartTotal > 50000 ? 0 : 3500;
      const orderTotal = cartTotal + shippingFee;
      const amountInKobo = Math.round(orderTotal * 100);

      // Initialize transaction via backend
      const { data: initData, error: initError } = await supabase.functions.invoke(
        "paystack-payment",
        {
          body: {
            action: "initialize",
            email,
            amount: amountInKobo,
            metadata: {
              cart_items: cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.product?.price || 0,
              })),
              shipping_address: {
                address,
                city,
                state,
                full_name: fullName,
                phone,
              },
              delivery_instructions: additionalInfo || undefined,
              shipping_fee: shippingFee,
            },
          },
        }
      );

      if (initError || initData?.error) {
        throw new Error(initData?.error || initError?.message || "Failed to initialize payment");
      }

      // Open Paystack popup
      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amountInKobo,
        currency: "NGN",
        access_code: initData.access_code,
        callback: (response) => {
          (async () => {
            // Verify payment via backend
            try {
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                "paystack-payment",
                {
                  body: {
                    action: "verify",
                    reference: response.reference,
                  },
                }
              );

              if (verifyError || verifyData?.error) {
                throw new Error(verifyData?.error || verifyError?.message || "Verification failed");
              }

              toast({
                title: "Payment Successful! 🎉",
                description: `Order ${verifyData.order_number} has been placed.`,
              });

              // Navigate to order confirmation
              navigate(`/order/${verifyData.order_id}`);
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Payment verification failed";
              toast({
                title: "Verification Error",
                description: message,
                variant: "destructive",
              });
            } finally {
              setIsProcessing(false);
            }
          })();
        },
        onClose: () => {
          setIsProcessing(false);
          toast({
            title: "Payment Cancelled",
            description: "You closed the payment window. No charges were made.",
          });
        },
      });

      handler.openIframe();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      toast({
        title: "Payment Error",
        description: message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Loading state
  if (authLoading || cartLoading || roleLoading) {
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
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="p-8 rounded-2xl bg-card border border-border shadow-float">
            <User className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-display font-semibold mb-2">Sign In to Checkout</h1>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to complete your purchase. Your details will be saved for faster checkout.
            </p>
            <div className="space-y-3">
              <Button variant="hero" className="w-full" asChild>
                <Link to="/login?redirect=/checkout">Sign In</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/signup?redirect=/checkout">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // User not verified
  if (!userCanPurchase) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="p-8 rounded-2xl bg-card border border-amber-200 dark:border-amber-900 shadow-float">
            <Clock className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h1 className="text-2xl font-display font-semibold mb-2">Account Verification Required</h1>
            <p className="text-muted-foreground mb-6">
              Your account is pending verification. Once verified, you'll be able to make purchases and book appointments.
            </p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/eyewear">Continue Browsing</Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
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
  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-display font-semibold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Logged In User Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Logged in as</span>
                    </div>
                    <p className="font-semibold text-foreground">{fullName || "Customer"}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    {phone && <p className="text-sm text-muted-foreground">{phone}</p>}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard">Edit Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </span>
                  Delivery Address
                </CardTitle>
                <CardDescription>
                  Where should we deliver your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!addressConfirmed ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full address including street, house number, landmark..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="e.g. Lagos"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Select value={state} onValueChange={setState}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {NIGERIAN_STATES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo">Delivery Instructions (Optional)</Label>
                      <Textarea
                        id="additionalInfo"
                        placeholder="Any special delivery instructions..."
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        className="resize-none"
                      />
                    </div>

                    <Button onClick={handleConfirmAddress} className="w-full md:w-auto">
                      Confirm Address
                    </Button>
                  </>
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-700 dark:text-green-400">
                          Delivery address confirmed
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {address}, {city}, {state}
                        </p>
                        {additionalInfo && (
                          <p className="text-sm text-muted-foreground italic">
                            Note: {additionalInfo}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddressConfirmed(false)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className={!addressConfirmed ? "opacity-50 pointer-events-none" : ""}>
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
                  disabled={isProcessing || !addressConfirmed}
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
