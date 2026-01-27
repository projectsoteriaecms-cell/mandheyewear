import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ProfileSection, 
  OrderHistorySection, 
  WishlistSection, 
  AppointmentsSection,
  AddressesSection,
  FrameProfileSection,
  SettingsSection,
} from "@/components/dashboard";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useAppointments } from "@/hooks/useAppointments";
import { useUserRole } from "@/hooks/useUserRole";
import { hasAdminAccess } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  LogOut, 
  User, 
  ShoppingBag, 
  Calendar, 
  Heart, 
  MapPin, 
  Sparkles, 
  Settings 
} from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { wishlistCount } = useWishlist();
  const { data: appointments } = useAppointments();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab") || "profile";

  const upcomingAppointments = appointments?.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed" && new Date(a.scheduled_date) >= new Date()
  ).length || 0;

  // Redirect staff users to admin panel
  useEffect(() => {
    if (!roleLoading && role && hasAdminAccess(role)) {
      navigate("/admin");
    }
  }, [role, roleLoading, navigate]);

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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg border bg-card">
              <ShoppingBag className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">0</p>
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
              <Sparkles className="h-5 w-5 text-accent mb-2" />
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Frame Profile</p>
            </div>
          </div>

          {/* Tabs - Warby Parker Style */}
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-transparent border-b rounded-none p-0 h-auto">
              <TabsTrigger 
                value="profile" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <User className="mr-2 h-4 w-4 hidden sm:inline" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <ShoppingBag className="mr-2 h-4 w-4 hidden sm:inline" />
                Orders
              </TabsTrigger>
              <TabsTrigger 
                value="appointments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Calendar className="mr-2 h-4 w-4 hidden sm:inline" />
                Appointments
              </TabsTrigger>
              <TabsTrigger 
                value="addresses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <MapPin className="mr-2 h-4 w-4 hidden sm:inline" />
                Addresses
              </TabsTrigger>
              <TabsTrigger 
                value="wishlist"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Heart className="mr-2 h-4 w-4 hidden sm:inline" />
                Favorites
              </TabsTrigger>
              <TabsTrigger 
                value="frame-profile"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Sparkles className="mr-2 h-4 w-4 hidden sm:inline" />
                Frame Profile
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Settings className="mr-2 h-4 w-4 hidden sm:inline" />
                Settings
              </TabsTrigger>
            </TabsList>

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
