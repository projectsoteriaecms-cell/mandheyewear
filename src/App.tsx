import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import Eyewear from "./pages/Eyewear";
import Branches from "./pages/Branches";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EyeCare from "./pages/EyeCare";
import FAQ from "./pages/FAQ";
import TryOn from "./pages/TryOn";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Returns from "./pages/Returns";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import Inventory from "./pages/admin/Inventory";
import PurchaseOrders from "./pages/admin/PurchaseOrders";
import StockTransfers from "./pages/admin/StockTransfers";
import StockAdjustments from "./pages/admin/StockAdjustments";
import InventoryTransactions from "./pages/admin/InventoryTransactions";
import Suppliers from "./pages/admin/Suppliers";
import Products from "./pages/admin/Products";
import Services from "./pages/admin/Services";
import AdminBranches from "./pages/admin/AdminBranches";
import AdminUsers from "./pages/admin/AdminUsers";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import Categories from "./pages/admin/Categories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/eyewear" element={<Eyewear />} />
          <Route path="/eye-care" element={<EyeCare />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/try-on" element={<TryOn />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/inventory/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/admin/inventory/transfers" element={<StockTransfers />} />
          <Route path="/admin/inventory/adjustments" element={<StockAdjustments />} />
          <Route path="/admin/inventory/transactions" element={<InventoryTransactions />} />
          <Route path="/admin/suppliers" element={<Suppliers />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/services" element={<Services />} />
          <Route path="/admin/branches" element={<AdminBranches />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/categories" element={<Categories />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
