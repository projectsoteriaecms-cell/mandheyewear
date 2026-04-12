import { useState } from "react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { useZohoSync } from "@/modules/integrations";
import { useIsAdmin } from "@/modules/auth/hooks/useUserRole";
import { useAdminProducts } from "@/modules/products";
import { CreateProductDialog } from "@/modules/products/components/CreateProductDialog";
import { BulkUploadDialog } from "@/modules/products/components/BulkUploadDialog";
import { EditProductDialog } from "@/modules/products/components/EditProductDialog";
import { BulkImageUploadDialog } from "@/modules/products/components/BulkImageUploadDialog";
import { ECMSImportDialog } from "@/modules/products/components/ECMSImportDialog";
import { ImportHistoryPanel } from "@/modules/products/components/ImportHistoryPanel";
import { ZohoSyncHistoryPanel } from "@/modules/products/components/ZohoSyncHistoryPanel";
import { QuickImageUploadModal } from "@/modules/products/components/QuickImageUploadModal";
import { LinkToZohoDialog } from "@/modules/products/components/LinkToZohoDialog";
import { DataCleanupDialog } from "@/modules/products/components/DataCleanupDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";
import { ProductsToolbar, ProductsFilterBar, ProductsTable, useEnrichProducts } from "./products";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ViewMode = "grid" | "list";

const Products = () => {
  const { products, isLoading, deleteProduct } = useAdminProducts();
  const { isAdmin } = useIsAdmin();
  const { status: syncStatus, pullItems, syncStock } = useZohoSync();
  const { isEnriching, enrichProgress, handleEnrichProducts } = useEnrichProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBulkImageUploadOpen, setIsBulkImageUploadOpen] = useState(false);
  const [isECMSImportOpen, setIsECMSImportOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isDataCleanupOpen, setIsDataCleanupOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [quickUploadProduct, setQuickUploadProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = brandFilter === "all" || product.brand_line === brandFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.is_active) ||
      (statusFilter === "inactive" && !product.is_active);
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const handleDelete = async () => {
    if (deleteProductId) {
      await deleteProduct.mutateAsync(deleteProductId);
      setDeleteProductId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <RoleGuard allowedRoles={["branch_manager", "admin", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <ProductsToolbar
            isAdmin={isAdmin}
            isEnriching={isEnriching}
            enrichProgress={enrichProgress}
            syncStatus={syncStatus}
            stockSyncStatus={syncStatus}
            onEnrichProducts={handleEnrichProducts}
            onPullItems={pullItems}
            onSyncStock={syncStock}
            onOpenLinkDialog={() => setIsLinkDialogOpen(true)}
            onOpenBulkImageUpload={() => setIsBulkImageUploadOpen(true)}
            onOpenBulkUpload={() => setIsBulkUploadOpen(true)}
            onOpenECMSImport={() => setIsECMSImportOpen(true)}
            onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
            onOpenDataCleanup={() => setIsDataCleanupOpen(true)}
          />

          <ProductsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            brandFilter={brandFilter}
            onBrandFilterChange={setBrandFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <ImportHistoryPanel />
          <ZohoSyncHistoryPanel />

          <ProductsTable
            products={filteredProducts}
            isLoading={isLoading}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onEdit={setEditProduct}
            onDelete={setDeleteProductId}
            onQuickUpload={setQuickUploadProduct}
            formatPrice={formatPrice}
          />
        </div>

        <CreateProductDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
        <BulkUploadDialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen} />
        <EditProductDialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)} product={editProduct} />
        <BulkImageUploadDialog open={isBulkImageUploadOpen} onOpenChange={setIsBulkImageUploadOpen} />
        <QuickImageUploadModal product={quickUploadProduct} open={!!quickUploadProduct} onOpenChange={(open) => !open && setQuickUploadProduct(null)} />
        <ECMSImportDialog open={isECMSImportOpen} onOpenChange={setIsECMSImportOpen} />
        <LinkToZohoDialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen} />
        <DataCleanupDialog open={isDataCleanupOpen} onOpenChange={setIsDataCleanupOpen} />

        <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Product?</AlertDialogTitle>
              <AlertDialogDescription>
                This will hide the product from the catalog. You can reactivate it later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Deactivate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </RoleGuard>
  );
};

export default Products;
