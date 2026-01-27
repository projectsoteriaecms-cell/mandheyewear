import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazy load admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Inventory = lazy(() => import("@/pages/admin/Inventory"));
const PurchaseOrders = lazy(() => import("@/pages/admin/PurchaseOrders"));
const StockTransfers = lazy(() => import("@/pages/admin/StockTransfers"));
const StockAdjustments = lazy(() => import("@/pages/admin/StockAdjustments"));
const InventoryTransactions = lazy(() => import("@/pages/admin/InventoryTransactions"));
const Suppliers = lazy(() => import("@/pages/admin/Suppliers"));
const Products = lazy(() => import("@/pages/admin/Products"));
const Services = lazy(() => import("@/pages/admin/Services"));
const AdminBranches = lazy(() => import("@/pages/admin/AdminBranches"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const Reports = lazy(() => import("@/pages/admin/Reports"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const Categories = lazy(() => import("@/pages/admin/Categories"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const adminRoutes = [
  <Route key="/admin" path="/admin" element={withSuspense(AdminDashboard)} />,
  <Route key="/admin/inventory" path="/admin/inventory" element={withSuspense(Inventory)} />,
  <Route key="/admin/inventory/purchase-orders" path="/admin/inventory/purchase-orders" element={withSuspense(PurchaseOrders)} />,
  <Route key="/admin/inventory/transfers" path="/admin/inventory/transfers" element={withSuspense(StockTransfers)} />,
  <Route key="/admin/inventory/adjustments" path="/admin/inventory/adjustments" element={withSuspense(StockAdjustments)} />,
  <Route key="/admin/inventory/transactions" path="/admin/inventory/transactions" element={withSuspense(InventoryTransactions)} />,
  <Route key="/admin/suppliers" path="/admin/suppliers" element={withSuspense(Suppliers)} />,
  <Route key="/admin/products" path="/admin/products" element={withSuspense(Products)} />,
  <Route key="/admin/services" path="/admin/services" element={withSuspense(Services)} />,
  <Route key="/admin/branches" path="/admin/branches" element={withSuspense(AdminBranches)} />,
  <Route key="/admin/users" path="/admin/users" element={withSuspense(AdminUsers)} />,
  <Route key="/admin/reports" path="/admin/reports" element={withSuspense(Reports)} />,
  <Route key="/admin/settings" path="/admin/settings" element={withSuspense(Settings)} />,
  <Route key="/admin/categories" path="/admin/categories" element={withSuspense(Categories)} />,
];
