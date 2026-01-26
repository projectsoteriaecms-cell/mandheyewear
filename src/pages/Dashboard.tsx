import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { OrderHistorySection } from "@/components/dashboard/OrderHistorySection";
import { WishlistSection } from "@/components/dashboard/WishlistSection";
import { AppointmentsSection } from "@/components/dashboard/AppointmentsSection";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, User, ShoppingBag, Calendar, Heart } from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlist();
  const { data: appointments } = useAppointments();
  const { toast } = useToast();
  const navigate = useNavigate();

  const upcomingAppointments = appointments?.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed" && new Date(a.scheduled_date) >= new Date()
  ).length || 0;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4 flex items-center justify-center">
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

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                My Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back! Manage your account and orders.
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
              <User className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Profile</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <ShoppingBag className="h-5 w-5 text-accent mb-2" />
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
              <p className="text-sm text-muted-foreground">Wishlist</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4 hidden sm:inline" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag className="mr-2 h-4 w-4 hidden sm:inline" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="mr-2 h-4 w-4 hidden sm:inline" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Heart className="mr-2 h-4 w-4 hidden sm:inline" />
                Wishlist
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

            <TabsContent value="wishlist">
              <WishlistSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
