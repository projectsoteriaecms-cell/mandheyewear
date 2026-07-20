import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ProfileSection,
  OrderHistorySection,
  WishlistSection,
  AppointmentsSection,
  AddressesSection,
  FrameProfileSection,
  SettingsSection,
  EmailVerificationBanner,
  PrescriptionsSection,
} from "@/components/dashboard";
import { isPast, isToday } from "date-fns";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useWishlist } from "@/modules/orders/hooks/useWishlist";
import { useOrders } from "@/modules/orders/hooks/useOrders";
import { useAppointments } from "@/modules/appointments/hooks/useAppointments";
import { usePrescriptions } from "@/modules/prescriptions/hooks/usePrescriptions";
import { useUserRole } from "@/modules/auth/hooks/useUserRole";
import { useOnboardingStatus } from "@/modules/personalization/hooks/useOnboardingStatus";
import { hasAdminAccess, isUnverifiedUser } from "@/shared/lib/permissions";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Loader2,
  LogOut,
  User,
  ShoppingBag,
  Calendar,
  Heart,
  MapPin,
  Sparkles,
  Settings,
  AlertCircle,
  Clock,
  ClipboardList,
} from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { needsOnboarding } = useOnboardingStatus(user?.id);
  const { wishlistCount } = useWishlist();
  const { data: appointments } = useAppointments();
  const { activePrescriptions } = usePrescriptions();
  const { data: orders } = useOrders(user?.id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab") || "profile";
  // Allow staff to access their profile/settings tabs, redirect otherwise
  const allowedStaffTabs = ["profile", "settings", "addresses", "frame-profile", "prescriptions"];
  const isStaffViewingAllowedTab = allowedStaffTabs.includes(defaultTab);

  const upcomingAppointments = appointments?.filter((a) => {
    if (a.status === "cancelled" || a.status === "completed") return false;
    const date = new Date(a.scheduled_date);
    return isToday(date) || !isPast(date);
  }).length || 0;

  // Check if user is unverified
  const isUnverified = isUnverifiedUser(role ?? null);

  // Redirect staff users to admin panel (unless they're viewing their profile/settings)
  useEffect(() => {
    if (!roleLoading && role && hasAdminAccess(role) && !isStaffViewingAllowedTab) {
      navigate("/admin");
    }
  }, [role, roleLoading, navigate, isStaffViewingAllowedTab]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="h-16 lg:h-[104px]" />
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Unverified user view - limited dashboard
  if (isUnverified) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Spacer for fixed navigation */}
        <div className="h-16 lg:h-[104px]" />

        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  My Account
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your account is pending verification
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {/* Email verification banner (only when email unconfirmed) */}
            <EmailVerificationBanner />

            {/* Verification Pending Card */}
            <Card className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                  Account Verification Pending
                </CardTitle>
                <CardDescription className="text-amber-600 dark:text-amber-500">
                  Your account is being reviewed. Once verified, you'll be able to:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
                  <li className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Purchase eyewear and accessories
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book eye care appointments
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Save items to your wishlist
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get personalized frame recommendations
                  </li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  In the meantime, feel free to browse our collection!
                </p>
              </CardContent>
            </Card>

            {/* What you can do now */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>What you can do now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/shop">Browse Eyewear Collection</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/branches">Find Our Locations</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profile Section - Always available */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileSection userId={user.id} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Spacer for fixed navigation */}
      <div className="h-16 lg:h-[104px]" />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                My Account
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your orders, preferences, and settings
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Email verification banner (only when email unconfirmed) */}
          <EmailVerificationBanner />

          {/* Onboarding Banner */}
          {needsOnboarding && (
            <Card className="mb-8 border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Complete Your Profile</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Get personalized frame recommendations by completing your face scan and style quiz.
                    </p>
                  </div>
                </div>
                <Button variant="hero" size="sm" asChild className="shrink-0">
                  <Link to="/onboarding">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <div className="p-4 rounded-lg border bg-card">
              <ShoppingBag className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{orders?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Orders</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <Calendar className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{upcomingAppointments}</p>
              <p className="text-sm text-muted-foreground">Appointments</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <Heart className="h-5 w-5 text-destructive mb-2" />
              <p className="text-2xl font-bold">{wishlistCount}</p>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <ClipboardList className="h-5 w-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{activePrescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Rx Valid</p>
            </div>
            <div className="p-4 rounded-lg border bg-card cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => {
              const tabs = document.querySelector('[data-value="frame-profile"]') as HTMLElement;
              tabs?.click();
            }}>
              <Sparkles className="h-5 w-5 text-accent mb-2" />
              <p className="text-sm font-semibold text-muted-foreground mt-1">
                {needsOnboarding ? "Not set up" : "Active"}
              </p>
              <p className="text-sm text-muted-foreground">Frame Profile</p>
            </div>
          </div>

          {/* Tabs - Warby Parker Style */}
          <Tabs defaultValue={defaultTab} className="space-y-6">
            {/* Scrollable tab bar with fade-out hint on mobile */}
            <div className="relative">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-transparent border-b rounded-none p-0 h-auto scrollbar-hide">
                <TabsTrigger
                  value="profile"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <User className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <ShoppingBag className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Orders</span>
                  {(orders?.length ?? 0) > 0 && (
                    <span className="ml-1.5 hidden sm:inline-flex h-4 min-w-4 px-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold items-center justify-center">
                      {orders!.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="appointments"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Appointments</span>
                  {upcomingAppointments > 0 && (
                    <span className="ml-1.5 hidden sm:inline-flex h-4 min-w-4 px-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold items-center justify-center">
                      {upcomingAppointments}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <MapPin className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Addresses</span>
                </TabsTrigger>
                <TabsTrigger
                  value="wishlist"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Heart className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Favorites</span>
                  {wishlistCount > 0 && (
                    <span className="ml-1.5 hidden sm:inline-flex h-4 min-w-4 px-1 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="prescriptions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <ClipboardList className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Prescriptions</span>
                  {activePrescriptions.length > 0 && (
                    <span className="ml-1.5 hidden sm:inline-flex h-4 min-w-4 px-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold items-center justify-center">
                      {activePrescriptions.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="frame-profile"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Sparkles className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Frame Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
              {/* Right-side fade hint so users know the tab bar scrolls on mobile */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent sm:hidden" />
            </div>

            <TabsContent value="profile">
              <ProfileSection userId={user.id} />
            </TabsContent>

            <TabsContent value="orders">
              <OrderHistorySection userId={user.id} />
            </TabsContent>

            <TabsContent value="appointments">
              <AppointmentsSection />
            </TabsContent>

            <TabsContent value="addresses">
              <AddressesSection />
            </TabsContent>

            <TabsContent value="wishlist">
              <WishlistSection />
            </TabsContent>

            <TabsContent value="prescriptions">
              <PrescriptionsSection />
            </TabsContent>

            <TabsContent value="frame-profile">
              <FrameProfileSection />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
