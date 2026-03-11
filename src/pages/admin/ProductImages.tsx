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
import { MagnifyingGlass, Images, CheckCircle, Warning, SquaresFour, List, Lightning, Cursor, X } from "@phosphor-icons/react";
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

const ITEMS_PER_PAGE = 24;
const MAX_ADDITIONAL = 5;

const ProductImages = () => {
  const { products, isLoading } = useAdminProducts();
  const stats = useProductImageStats();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ImageFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generateForSelected, setGenerateForSelected] = useState(false);
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

  // Compute unique item types with total counts for the category filter
  const itemTypeOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const type = p.item_type || "other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        label: ITEM_TYPE_LABELS[type] || type,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => (p.item_type || "other") === categoryFilter);
    }

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

    result = result.sort((a, b) => {
      const aHasImage = a.image_url ? 1 : 0;
      const bHasImage = b.image_url ? 1 : 0;
      if (aHasImage !== bHasImage) return bHasImage - aHasImage;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [products, searchTerm, filter, categoryFilter]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Selection helpers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const visibleIds = visibleProducts.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [visibleProducts, selectedIds]);

  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((p) => selectedIds.has(p.id));

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  // Selected products data for the dialog
  const selectedProductsData = useMemo(() => {
    if (!generateForSelected) return undefined;
    return products
      .filter((p) => selectedIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, sku: p.sku, item_type: p.item_type, brand: p.brand }));
  }, [products, selectedIds, generateForSelected]);

  // Selection summary for floating bar
  const selectionSummary = useMemo(() => {
    const selected = products.filter((p) => selectedIds.has(p.id));
    const frames = selected.filter((p) => p.item_type === "frames").length;
    const others = selected.length - frames;
    return { total: selected.length, frames, others, shots: frames * 6 + others };
  }, [products, selectedIds]);

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

  const handleGenerateSelected = () => {
    setGenerateForSelected(true);
    setGenerateDialogOpen(true);
  };

  const handleGenerateBulk = () => {
    setGenerateForSelected(false);
    setGenerateDialogOpen(true);
  };

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
            <div className="flex items-center gap-2">
              {stats.missingPrimary > 0 && (
                <Button onClick={handleGenerateBulk} variant="gold">
                  <Lightning className="h-4 w-4" weight="fill" />
                  Generate Missing Images
                </Button>
              )}
            </div>
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
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {itemTypeOptions.map((opt) => (
                  <SelectItem key={opt.type} value={opt.type}>
                    {opt.label} ({opt.count})
                  </SelectItem>
                ))}
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

            {/* Select mode toggle */}
            <Button
              variant={selectMode ? "default" : "outline"}
              onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
              size="sm"
              className="flex-shrink-0"
            >
              {selectMode ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Exit Select
                </>
              ) : (
                <>
                  <Cursor className="h-4 w-4 mr-1" />
                  Select
                </>
              )}
            </Button>
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
            {selectMode && selectedIds.size > 0 && (
              <Badge variant="default">
                {selectedIds.size} selected
              </Badge>
            )}
          </div>

          {/* Product Grid / List */}
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
                      selectable={selectMode}
                      selected={selectedIds.has(product.id)}
                      onSelectionToggle={toggleSelection}
                    />
                  ))}
                </div>
              ) : (
                <ProductImageListView
                  products={visibleProducts}
                  onUploadClick={(id) => setSelectedProductId(id)}
                  onRegenerateClick={handleRegenerateProduct}
                  maxImages={MAX_ADDITIONAL + 1}
                  selectable={selectMode}
                  selectedIds={selectedIds}
                  onSelectionToggle={toggleSelection}
                  onSelectAll={toggleSelectAll}
                  allSelected={allVisibleSelected}
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

          {/* Floating Selection Action Bar */}
          {selectMode && selectedIds.size > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg">
              <div className="text-sm">
                <span className="font-semibold">{selectionSummary.total}</span> selected
                {selectionSummary.frames > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({selectionSummary.frames} frame{selectionSummary.frames !== 1 ? "s" : ""} × 6 shots
                    {selectionSummary.others > 0 && ` + ${selectionSummary.others} × 1 shot`}
                    {" = ~"}{selectionSummary.shots} calls)
                  </span>
                )}
                {selectionSummary.frames === 0 && selectionSummary.others > 0 && (
                  <span className="text-muted-foreground ml-1">
                    (~{selectionSummary.shots} API call{selectionSummary.shots !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
              <Button onClick={handleGenerateSelected} size="sm">
                <Lightning className="h-4 w-4 mr-1" weight="fill" />
                Generate Selected
              </Button>
              <Button variant="ghost" size="sm" onClick={exitSelectMode}>
                <X className="h-4 w-4" />
              </Button>
            </div>
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
          onOpenChange={(open) => {
            setGenerateDialogOpen(open);
            if (!open) setGenerateForSelected(false);
          }}
          categoryCounts={categoryCounts}
          selectedProducts={selectedProductsData}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
            if (generateForSelected) exitSelectMode();
          }}
        />
      </AdminLayout>
    </RoleGuard>
  );
};

export default ProductImages;
