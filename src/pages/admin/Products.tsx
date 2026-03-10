import { useState, useCallback } from "react";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { useZohoSync } from "@/hooks/admin/useZohoSync";
import { useIsAdmin } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Plus,
  Upload,
  MagnifyingGlass,
  DotsThree,
  PencilSimple,
  Trash,
  ShoppingBag,
  ImageSquare,
  FileXls,
  Camera,
  List,
  SquaresFour,
  ArrowsClockwise,
  CloudArrowDown,
  Sparkle,
} from "@phosphor-icons/react";
import { useAdminProducts } from "@/modules/products";
import { CreateProductDialog } from "@/components/admin/products/CreateProductDialog";
import { BulkUploadDialog } from "@/components/admin/products/BulkUploadDialog";
import { EditProductDialog } from "@/components/admin/products/EditProductDialog";
import { BulkImageUploadDialog } from "@/components/admin/products/BulkImageUploadDialog";
import { ECMSImportDialog } from "@/components/admin/products/ECMSImportDialog";
import { ImportHistoryPanel } from "@/components/admin/products/ImportHistoryPanel";
import { ZohoSyncHistoryPanel } from "@/components/admin/products/ZohoSyncHistoryPanel";
import { QuickImageUploadModal } from "@/components/admin/products/QuickImageUploadModal";
import { ProductListView } from "@/components/admin/products/ProductListView";
import { LinkToZohoDialog } from "@/components/admin/products/LinkToZohoDialog";
import { Skeleton } from "@/components/ui/skeleton";
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

type Product = Database["public"]["Tables"]["products"]["Row"];
type ViewMode = "grid" | "list";

const Products = () => {
  const { products, isLoading, deleteProduct } = useAdminProducts();
  const { isAdmin } = useIsAdmin();
  const { status: syncStatus, pullItems } = useZohoSync();
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBulkImageUploadOpen, setIsBulkImageUploadOpen] = useState(false);
  const [isECMSImportOpen, setIsECMSImportOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [quickUploadProduct, setQuickUploadProduct] = useState<Product | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand =
      brandFilter === "all" || product.brand_line === brandFilter;
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <RoleGuard allowedRoles={["branch_manager", "admin", "super_admin"]}>
      <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={pullItems}
                disabled={syncStatus === "syncing"}
              >
                {syncStatus === "syncing" ? (
                  <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" weight="bold" />
                ) : (
                  <CloudArrowDown className="mr-2 h-4 w-4" weight="light" />
                )}
                {syncStatus === "syncing" ? "Syncing…" : "Zoho Sync"}
              </Button>
            )}
            {isAdmin && (
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(true)}>
                <ArrowsClockwise className="mr-2 h-4 w-4" weight="light" />
                Link to Zoho
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsBulkImageUploadOpen(true)}>
              <ImageSquare className="mr-2 h-4 w-4" weight="light" />
              Upload Images
            </Button>
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" weight="light" />
              Bulk Upload
            </Button>
            <Button variant="outline" onClick={() => setIsECMSImportOpen(true)}>
              <FileXls className="mr-2 h-4 w-4" weight="light" />
              ECMS Import
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" weight="light" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="light" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="soteria_medical">Soteria Medical</SelectItem>
                  <SelectItem value="m_and_h_fashion">M&H Fashion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Import History */}
        <ImportHistoryPanel />

        {/* Zoho Sync History */}
        <ZohoSyncHistoryPanel />

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" weight="light" />
                Product Catalog ({filteredProducts.length})
              </CardTitle>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value as ViewMode)}
                className="border rounded-lg p-1"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
                  <SquaresFour className="h-4 w-4" weight="light" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" className="px-3">
                  <List className="h-4 w-4" weight="light" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-50" weight="light" />
                <p>No products found</p>
                <p className="text-sm">Add your first product to get started</p>
              </div>
            ) : viewMode === "list" ? (
              <ProductListView
                products={filteredProducts}
                onEdit={setEditProduct}
                onDelete={setDeleteProductId}
                onQuickUpload={setQuickUploadProduct}
                formatPrice={formatPrice}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded bg-muted flex items-center justify-center group">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <ShoppingBag className="h-5 w-5 text-muted-foreground" weight="light" />
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQuickUploadProduct(product);
                                    }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                  >
                                    <Camera className="h-4 w-4 text-white" weight="fill" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Quick upload image</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.color && (
                                <p className="text-xs text-muted-foreground">
                                  {product.color}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          {(product as any).brand ? (
                            <span className="text-sm">{(product as any).brand}</span>
                          ) : (
                            <Badge variant="outline">
                              {product.brand_line === "soteria_medical"
                                ? "Soteria"
                                : "M&H"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">
                          {product.item_type?.replace("_", " ") || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell>
                          {(product as any).price_tier && (
                            <Badge 
                              variant="outline"
                              className={
                                (product as any).price_tier === "luxury" ? "border-amber-500 text-amber-600" :
                                (product as any).price_tier === "premium" ? "border-purple-500 text-purple-600" :
                                (product as any).price_tier === "standard" ? "border-blue-500 text-blue-600" :
                                "border-gray-400 text-gray-500"
                              }
                            >
                              {(product as any).price_tier}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.is_active ? "default" : "secondary"}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <DotsThree className="h-4 w-4" weight="bold" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditProduct(product)}>
                                <PencilSimple className="mr-2 h-4 w-4" weight="light" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteProductId(product.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" weight="light" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateProductDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
      />

      <EditProductDialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        product={editProduct}
      />

      <BulkImageUploadDialog
        open={isBulkImageUploadOpen}
        onOpenChange={setIsBulkImageUploadOpen}
      />

      <QuickImageUploadModal
        product={quickUploadProduct}
        open={!!quickUploadProduct}
        onOpenChange={(open) => !open && setQuickUploadProduct(null)}
      />

      <ECMSImportDialog
        open={isECMSImportOpen}
        onOpenChange={setIsECMSImportOpen}
      />

      <LinkToZohoDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
      />

      <AlertDialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
      >
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
