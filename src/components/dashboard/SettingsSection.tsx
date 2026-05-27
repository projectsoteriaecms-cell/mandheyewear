import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/modules/personalization/hooks/useProfile";
import { useUserRole } from "@/modules/auth/hooks/useUserRole";
import { usePaystackMode } from "@/shared/hooks/usePaystackMode";
import { isAtLeast } from "@/shared/lib/permissions";
import { Loader2, Save, Key, Monitor, Moon, Sun, CreditCard, FlaskConical, Zap, AlertTriangle } from "lucide-react";

export const SettingsSection = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const { data: role } = useUserRole();
  const { mode: paystackMode, setMode: setPaystackMode, isLive: paystackIsLive } = usePaystackMode();
  const [confirmingLive, setConfirmingLive] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone_number: profile?.phone_number || "",
  });

  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_promotions: true,
    sms_orders: false,
    sms_promotions: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemDark) {
      setTheme("system");
    }
  }, []);

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
    
    if (value === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.removeItem("theme");
    } else if (value === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    toast({
      title: "Theme updated",
      description: `Display mode set to ${value}.`,
    });
  };

  // Update form when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone_number: profile.phone_number || "",
      });
    }
  });

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
        },
      });
      
      toast({
        title: "Settings saved",
        description: "Your account settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="+234 XXX XXX XXXX"
            />
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            You'll receive an email to reset your password
          </p>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-base">Theme</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose how M&H Eyewear looks to you
            </p>
            <RadioGroup
              value={theme}
              onValueChange={(value) => handleThemeChange(value as "light" | "dark" | "system")}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Monitor className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">System</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Email Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your orders
                  </p>
                </div>
                <Switch
                  checked={notifications.email_orders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_orders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotions & Offers</p>
                  <p className="text-sm text-muted-foreground">
                    Stay updated on sales and new arrivals
                  </p>
                </div>
                <Switch
                  checked={notifications.email_promotions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_promotions: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-4">SMS Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Get SMS updates for order status
                  </p>
                </div>
                <Switch
                  checked={notifications.sms_orders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sms_orders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotions & Offers</p>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.sms_promotions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sms_promotions: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Payment Mode (admin-only) ───────────────────────────── */}
      {isAtLeast(role ?? null, "admin") && (
        <Card className={paystackIsLive
          ? "border-green-300 dark:border-green-700"
          : "border-amber-300 dark:border-amber-700"
        }>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 shrink-0" />
              Payment Mode
              {paystackIsLive ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-300 dark:border-green-700 font-bold uppercase text-[10px] tracking-wider">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold uppercase text-[10px] tracking-wider">
                  <FlaskConical className="h-2.5 w-2.5 mr-1" />
                  Test
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Controls which Paystack key is used at checkout. Visible to admins only.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Toggle row */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {paystackIsLive ? "Live mode — real charges" : "Test mode — no real charges"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paystackIsLive
                    ? "Customers are being charged real money. Switch to Test before debugging."
                    : "Safe for development. Switch to Live only when ready to accept real payments."}
                </p>
              </div>
              <Switch
                checked={paystackIsLive}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setConfirmingLive(true);
                  } else {
                    setPaystackMode("test");
                    toast({ title: "Switched to Test mode", description: "No real charges will be made." });
                  }
                }}
              />
            </div>

            {/* Live confirmation panel */}
            {confirmingLive && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">Switch to Live mode?</p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                      Real payments will be processed. Make sure <code className="font-mono">VITE_PAYSTACK_LIVE_KEY</code> is set in your environment before proceeding.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      setPaystackMode("live");
                      setConfirmingLive(false);
                      toast({
                        title: "Switched to Live mode",
                        description: "Real payments are now active.",
                      });
                    }}
                  >
                    Yes, go Live
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmingLive(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Live mode warning banner */}
            {paystackIsLive && !confirmingLive && (
              <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-3 py-2.5">
                <Zap className="h-4 w-4 text-green-700 dark:text-green-400 mt-0.5 shrink-0" />
                <p className="text-xs text-green-800 dark:text-green-300">
                  <strong>Live mode is active.</strong> Customers will be charged real money. Toggle off to return to Test mode.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};
