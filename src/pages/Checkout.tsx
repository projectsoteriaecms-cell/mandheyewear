import { useState, useEffect, useMemo } from "react";
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
import { ShippingZoneIndicator } from "@/components/checkout/ShippingZoneIndicator";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile } from "@/modules/personalization/hooks/useProfile";
import { useUserRole } from "@/modules/auth/hooks/useUserRole";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import { canPurchase } from "@/shared/lib/permissions";
import {
  detectShippingZone,
  getZoneInfo,
  calculateShippingFee,
  getDeliveryEstimate,
  COUNTRY_LIST,
  NIGERIAN_STATES,
} from "@/shared/lib/shippingZones";
import { useToast } from "@/shared/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ShoppingBag, Loader2, CreditCard, Shield, User, CheckCircle, Clock, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PAYSTACK_PUBLIC_KEY = "pk_test_b65019a2e28f286dd4906d6aaa80bff38f035460";

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

// Phone validation
const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Nigerian: +234..., 0..., or international: +XX...
  return /^(\+234\d{10}|0\d{10}|\+\d{7,15})$/.test(cleaned);
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

  // Contact info (editable, pre-filled from profile)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Shipping form state
  const [country, setCountry] = useState("Nigeria");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [landmark, setLandmark] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [region, setRegion] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const isNigeria = country === "Nigeria";
  const userCanPurchase = canPurchase(role ?? null);

  // Pre-fill from profile once loaded
  useEffect(() => {
    if (profile) {
      setFullName(prev => prev || profile.full_name || "");
      setEmail(prev => prev || profile.email || user?.email || "");
      setPhone(prev => prev || profile.phone_number || "");
    } else if (user) {
      setEmail(prev => prev || user.email || "");
    }
  }, [profile, user]);

  // Compute shipping zone dynamically
  const shippingZoneKey = useMemo(() => {
    if (!country) return "lagos_mainland";
    return detectShippingZone(country, isNigeria ? state : "", city);
  }, [country, state, city, isNigeria]);

  const shippingFee = useMemo(
    () => calculateShippingFee(shippingZoneKey, cartTotal),
    [shippingZoneKey, cartTotal]
  );

  const zoneInfo = useMemo(() => getZoneInfo(shippingZoneKey), [shippingZoneKey]);
  const deliveryEstimate = useMemo(() => getDeliveryEstimate(shippingZoneKey), [shippingZoneKey]);
  const orderTotal = cartTotal + shippingFee;

  useEffect(() => {
    loadPaystackScript().catch(console.error);
  }, []);

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

  const validateForm = (): boolean => {
    if (!fullName.trim() || fullName.length < 2) {
      toast({ title: "Please enter your full name", variant: "destructive" });
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return false;
    }
    if (!phone.trim() || !isValidPhone(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Enter a valid phone number (e.g. +234 801 234 5678 or 0801 234 5678)",
        variant: "destructive",
      });
      return false;
    }
    if (!address.trim() || address.length < 5) {
      toast({ title: "Please enter a valid delivery address", variant: "destructive" });
      return false;
    }
    if (!city.trim() || city.length < 2) {
      toast({ title: "Please enter your city", variant: "destructive" });
      return false;
    }
    if (isNigeria) {
      if (!state) {
        toast({ title: "Please select your state", variant: "destructive" });
        return false;
      }
      if (!landmark.trim() || landmark.length < 3) {
        toast({ title: "Please enter a nearby landmark for delivery", variant: "destructive" });
        return false;
      }
    } else {
      if (!postalCode.trim()) {
        toast({ title: "Please enter your postal/zip code", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      await loadPaystackScript();

      const amountInKobo = Math.round(orderTotal * 100);

      const shippingAddress: Record<string, string> = {
        address,
        city,
        country,
        full_name: fullName,
        phone,
        email,
      };

      if (isNigeria) {
        shippingAddress.state = state;
        shippingAddress.landmark = landmark;
      } else {
        shippingAddress.region = region;
        shippingAddress.postal_code = postalCode;
      }

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
              shipping_address: shippingAddress,
              delivery_instructions: additionalInfo || undefined,
              shipping_fee: shippingFee,
              shipping_zone: shippingZoneKey,
            },
          },
        }
      );

      if (initError || initData?.error) {
        throw new Error(initData?.error || initError?.message || "Failed to initialize payment");
      }

      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amountInKobo,
        currency: "NGN",
        access_code: initData.access_code,
        callback: (response: { reference: string }) => {
          (async () => {
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

              supabase.functions.invoke("zoho-sync", {
                body: { action: "push_order", order_id: verifyData.order_id },
              }).catch((err: unknown) => console.warn("Zoho order push failed (non-blocking):", err));

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

  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8 pb-24 sm:pb-8">
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-2xl sm:text-3xl font-display font-semibold mb-4 sm:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </span>
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How can we reach you about this order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 801 234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      For delivery coordination & order updates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </span>
                  Delivery Address
                </CardTitle>
                <CardDescription>
                  Where should we deliver your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={country} onValueChange={(val) => { setCountry(val); setState(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_LIST.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address including street, house number..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="resize-none"
                  />
                </div>

                {/* Address Line 2 / Landmark */}
                <div className="space-y-2">
                  <Label htmlFor="landmark">
                    {isNigeria ? "Nearest Landmark *" : "Address Line 2 / Landmark"}
                  </Label>
                  <Input
                    id="landmark"
                    placeholder={isNigeria
                      ? "e.g. Nearest bus stop, popular building, or junction"
                      : "Apartment, suite, or nearest landmark (optional)"
                    }
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                  {isNigeria && (
                    <p className="text-xs text-muted-foreground">
                      This helps our delivery riders find you faster
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder={isNigeria ? "e.g. Ikeja, Lekki, Surulere" : "e.g. London, New York"}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  {isNigeria ? (
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIGERIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="region">State / Province / Region</Label>
                      <Input
                        id="region"
                        placeholder="e.g. California, Ontario, Bavaria"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Postal code for international */}
                {!isNigeria && (
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal / Zip Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="e.g. 10001, SW1A 1AA"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                )}

                {/* Additional info */}
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

                {/* Live shipping zone indicator */}
                {(isNigeria ? !!state : !!country) && (
                  <ShippingZoneIndicator zoneKey={shippingZoneKey} subtotal={cartTotal} />
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
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
                  disabled={isProcessing}
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
              <OrderSummary
                cartItems={cartItems}
                subtotal={cartTotal}
                shippingFee={shippingFee}
                shippingZoneLabel={zoneInfo.label}
                deliveryEstimate={deliveryEstimate}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
