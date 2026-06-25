import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Force rebuild - CRM routes enabled
// Retry wrapper for lazy imports to handle stale chunk errors after deployments
function lazyRetry(importFn: () => Promise<any>) {
  return lazy(() =>
    importFn().catch((err) => {
      const key = `chunk-retry:${importFn.toString()}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return new Promise(() => {});
      }
      throw err;
    })
  );
}

// Lazy load admin pages
const AdminDashboard = lazyRetry(() => import("@/pages/admin/Dashboard"));
const Inventory = lazyRetry(() => import("@/pages/admin/Inventory"));
const PurchaseOrders = lazyRetry(() => import("@/pages/admin/PurchaseOrders"));
const StockTransfers = lazyRetry(() => import("@/pages/admin/StockTransfers"));
const StockAdjustments = lazyRetry(() => import("@/pages/admin/StockAdjustments"));
const InventoryTransactions = lazyRetry(() => import("@/pages/admin/InventoryTransactions"));
const Suppliers = lazyRetry(() => import("@/pages/admin/Suppliers"));
const Products = lazyRetry(() => import("@/pages/admin/Products"));
const ProductImages = lazyRetry(() => import("@/pages/admin/ProductImages"));
const ProductImageCompare = lazyRetry(() => import("@/pages/admin/ProductImageCompare"));
const Services = lazyRetry(() => import("@/pages/admin/Services"));
const AdminBranches = lazyRetry(() => import("@/pages/admin/AdminBranches"));
const AdminUsers = lazyRetry(() => import("@/pages/admin/AdminUsers"));
const AdminAppointments = lazyRetry(() => import("@/pages/admin/Appointments"));
const Reports = lazyRetry(() => import("@/pages/admin/Reports"));
const Settings = lazyRetry(() => import("@/pages/admin/Settings"));
const Categories = lazyRetry(() => import("@/pages/admin/Categories"));
const DeliveryReport = lazyRetry(() => import("@/pages/admin/DeliveryReport"));
const Orders = lazyRetry(() => import("@/pages/admin/Orders"));
const PromoBanner = lazyRetry(() => import("@/pages/admin/PromoBanner"));
const SlideshowManager = lazyRetry(() => import("@/pages/admin/SlideshowManager"));
const SystemStatus = lazyRetry(() => import("@/pages/admin/SystemStatus"));
const QAFeedback = lazyRetry(() => import("@/pages/admin/QAFeedback"));
const CrmCustomers = lazyRetry(() => import("@/pages/admin/crm/Customers"));
const CrmSegments = lazyRetry(() => import("@/pages/admin/crm/Segments"));
const CrmCampaigns = lazyRetry(() => import("@/pages/admin/crm/Campaigns"));
const CrmAnalytics = lazyRetry(() => import("@/pages/admin/crm/Analytics"));
const CrmBehavioralInsights = lazyRetry(() => import("@/pages/admin/crm/BehavioralInsights"));
const CrmWhatsAppTemplates = lazyRetry(() => import("@/pages/admin/crm/WhatsAppTemplates"));
const CrmCompliance = lazyRetry(() => import("@/pages/admin/crm/Compliance"));
const CrmCampaignBuilder = lazyRetry(() => import("@/pages/admin/crm/CampaignBuilder"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
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
  <Route key="/admin/products/images" path="/admin/products/images" element={withSuspense(ProductImages)} />,
  <Route key="/admin/products/images/compare" path="/admin/products/images/compare" element={withSuspense(ProductImageCompare)} />,
  <Route key="/admin/services" path="/admin/services" element={withSuspense(Services)} />,
  <Route key="/admin/appointments" path="/admin/appointments" element={withSuspense(AdminAppointments)} />,
  <Route key="/admin/branches" path="/admin/branches" element={withSuspense(AdminBranches)} />,
  <Route key="/admin/users" path="/admin/users" element={withSuspense(AdminUsers)} />,
  <Route key="/admin/reports" path="/admin/reports" element={withSuspense(Reports)} />,
  <Route key="/admin/settings" path="/admin/settings" element={withSuspense(Settings)} />,
  <Route key="/admin/categories" path="/admin/categories" element={withSuspense(Categories)} />,
  <Route key="/admin/delivery-report" path="/admin/delivery-report" element={withSuspense(DeliveryReport)} />,
  <Route key="/admin/orders" path="/admin/orders" element={withSuspense(Orders)} />,
  <Route key="/admin/promo-banner" path="/admin/promo-banner" element={withSuspense(PromoBanner)} />,
  <Route key="/admin/slideshow" path="/admin/slideshow" element={withSuspense(SlideshowManager)} />,
  <Route key="/admin/system-status" path="/admin/system-status" element={withSuspense(SystemStatus)} />,
  <Route key="/admin/qa-feedback" path="/admin/qa-feedback" element={withSuspense(QAFeedback)} />,
  <Route key="/admin/crm/customers" path="/admin/crm/customers" element={withSuspense(CrmCustomers)} />,
  <Route key="/admin/crm/segments" path="/admin/crm/segments" element={withSuspense(CrmSegments)} />,
  <Route key="/admin/crm/campaigns" path="/admin/crm/campaigns" element={withSuspense(CrmCampaigns)} />,
  <Route key="/admin/crm/analytics" path="/admin/crm/analytics" element={withSuspense(CrmAnalytics)} />,
  <Route key="/admin/crm/behavioral" path="/admin/crm/behavioral" element={withSuspense(CrmBehavioralInsights)} />,
  <Route key="/admin/crm/whatsapp" path="/admin/crm/whatsapp" element={withSuspense(CrmWhatsAppTemplates)} />,
  <Route key="/admin/crm/compliance" path="/admin/crm/compliance" element={withSuspense(CrmCompliance)} />,
  <Route key="/admin/crm/campaigns/:id/edit" path="/admin/crm/campaigns/:id/edit" element={withSuspense(CrmCampaignBuilder)} />,
];
