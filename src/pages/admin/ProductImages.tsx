import { useState, useMemo, useCallback } from "react";
import { AdminLayout } from "@/shared/components/admin/AdminLayout";
import { RoleGuard } from "@/shared/components/admin/RoleGuard";
import { useAdminProducts, useProductImageStats } from "@/modules/products";
import { ProductImageCard } from "@/components/admin/products/ProductImageCard";
import { ProductImageListView } from "@/components/admin/products/ProductImageListView";
import { QuickImageUploadModal } from "@/components/admin/products/QuickImageUploadModal";
import { GenerateImagesDialog } from "@/components/admin/products/GenerateImagesDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MagnifyingGlass, Images, CheckCircle, Warning, SquaresFour, List, Lightning } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const ITEM_TYPE_LABELS: Record<string, string> = {
  frames: "Frames",
  contact_lenses: "Contact Lenses",
  lenses: "Lenses",
  solutions: "Solutions",
  medications: "Medications",
  accessories: "Accessories",
  cleanser: "Cleanser",
  packaging: "Packaging",
  other: "Other",
};

type ImageFilter = "all" | "with_images" | "missing_primary" | "complete";
type ViewMode = "grid" | "list";

// Priority order for item types (frames first, then contact lenses, lenses, then others)
const ITEM_TYPE_PRIORITY: Record<string, number> = {
  frames: 1,
  contact_lenses: 2,
  lenses: 3,
  solutions: 4,
  medications: 5,
  accessories: 6,
  cleanser: 7,
  packaging: 8,
  other: 9,
};

const ITEMS_PER_PAGE = 24;
const MAX_ADDITIONAL = 5;

const ProductImages = () => {
  const { products, isLoading } = useAdminProducts();
  const stats = useProductImageStats();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ImageFilter>("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Compute per-category missing image counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (!p.image_url) {
        const type = p.item_type || "other";
        counts[type] = (counts[type] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([type, missing]) => ({
        type,
        label: ITEM_TYPE_LABELS[type] || type,
        missing,
        shots: type === "frames" ? 6 : 1,
      }))
      .sort((a, b) => b.missing - a.missing);
  }, [products]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term)
      );
    }

    // Apply image status filter
    switch (filter) {
      case "with_images":
        result = result.filter((p) => p.image_url);
        break;
      case "missing_primary":
        result = result.filter((p) => !p.image_url);
        break;
      case "complete":
        result = result.filter(
          (p) =>
            p.image_url &&
            p.additional_images &&
            p.additional_images.length >= MAX_ADDITIONAL
        );
        break;
    }

    // Sort: products with images first, then by most recently updated
    result = result.sort((a, b) => {
      const aHasImage = a.image_url ? 1 : 0;
      const bHasImage = b.image_url ? 1 : 0;
      if (aHasImage !== bHasImage) return bHasImage - aHasImage;
      // Within same image status, sort by updated_at descending
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [products, searchTerm, filter]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleRegenerateProduct = useCallback(async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const { toast } = await import("sonner");
    toast.info(`Regenerating images for ${product?.sku || "product"}...`);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("generate-product-image", {
        body: { productId },
      });
      if (error) throw error;
      if (data?.succeeded > 0) {
        toast.success(`Regenerated ${data.results?.[0]?.shots || 1} image(s)`);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } else {
        toast.error(data?.results?.[0]?.error || "Failed to regenerate");
      }
    } catch (err) {
      toast.error("Failed to regenerate images");
    }
  }, [products, queryClient]);

  return (
    <RoleGuard allowedRoles={["branch_manager", "admin", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Product Images Manager</h1>
              <p className="text-muted-foreground">
                Manage product images for your catalog
              </p>
            </div>
            {stats.missingPrimary > 0 && (
              <Button onClick={() => setGenerateDialogOpen(true)} variant="gold">
                <Lightning className="h-4 w-4" weight="fill" />
                Generate Missing Images
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Images className="h-4 w-4" />
                Total Products
              </div>
              <p className="text-2xl font-bold mt-1">
                {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : stats.total}
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                With Images
              </div>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : stats.withPrimary}
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Warning className="h-4 w-4 text-amber-500" />
                Missing Primary
              </div>
              <p className="text-2xl font-bold mt-1 text-amber-600">
                {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : stats.missingPrimary}
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                Complete (6/6)
              </div>
              <p className="text-2xl font-bold mt-1 text-primary">
                {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : stats.complete}
              </p>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as ImageFilter)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="with_images">With Images</SelectItem>
                <SelectItem value="missing_primary">Missing Primary</SelectItem>
                <SelectItem value="complete">Complete (6/6)</SelectItem>
              </SelectContent>
            </Select>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              className="flex-shrink-0"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <SquaresFour className="h-4 w-4" weight={viewMode === "grid" ? "fill" : "regular"} />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" weight={viewMode === "list" ? "bold" : "regular"} />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </Badge>
            {searchTerm && (
              <span className="text-sm text-muted-foreground">
                matching "{searchTerm}"
              </span>
            )}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Images className="h-12 w-12 mb-4" />
              <p>No products found</p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {visibleProducts.map((product) => (
                    <ProductImageCard
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProductId(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <ProductImageListView
                  products={visibleProducts}
                  onUploadClick={(id) => setSelectedProductId(id)}
                  maxImages={MAX_ADDITIONAL + 1}
                />
              )}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={handleShowMore}>
                    Show More ({filteredProducts.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Upload Modal */}
        <QuickImageUploadModal
          product={selectedProduct ?? null}
          open={!!selectedProductId}
          onOpenChange={(open) => {
            if (!open) setSelectedProductId(null);
          }}
        />
        {/* Generate Images Dialog */}
        <GenerateImagesDialog
          open={generateDialogOpen}
          onOpenChange={setGenerateDialogOpen}
          categoryCounts={categoryCounts}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
          }}
        />
      </AdminLayout>
    </RoleGuard>
  );
};

export default ProductImages;
