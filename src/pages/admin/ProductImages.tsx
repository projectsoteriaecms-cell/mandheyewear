import { useState, useMemo, useCallback } from "react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { useAdminProducts, useProductImageStats } from "@/modules/products";
import { isKnownBrand, isHouseBrand } from "@/modules/products/lib/brand-classification";
import { ProductImageCard } from "@/modules/products/components/ProductImageCard";
import { ProductImageListView } from "@/modules/products/components/ProductImageListView";
import { QuickImageUploadModal } from "@/modules/products/components/QuickImageUploadModal";
import { GenerateImagesDialog } from "@/modules/products/components/GenerateImagesDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Images, Lightning } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageStatsCards, ImageFilterBar, SelectionActionBar } from "./product-images";

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
  const queryClient = useQueryClient();

  const { data: serverCategoryStats } = useQuery({
    queryKey: ["product-image-category-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_product_image_category_stats");
      if (error) throw error;
      return (data as any[] | null) || [];
    },
    staleTime: 30_000,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ImageFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandTypeFilter, setBrandTypeFilter] = useState<"all" | "known" | "house" | "no_brand">("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generateForSelected, setGenerateForSelected] = useState(false);

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

  const itemTypeOptions = useMemo(() => {
    if (serverCategoryStats && serverCategoryStats.length > 0) {
      return serverCategoryStats.map((stat: any) => ({
        type: stat.item_type || "other",
        label: ITEM_TYPE_LABELS[stat.item_type] || stat.item_type || "Other",
        count: stat.total || 0,
      }));
    }
    const counts: Record<string, number> = {};
    Object.keys(ITEM_TYPE_LABELS).forEach((t) => (counts[t] = 0));
    products.forEach((p) => {
      const type = p.item_type || "other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(ITEM_TYPE_LABELS)
      .map(([type, label]) => ({ type, label, count: counts[type] || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [serverCategoryStats, products]);

  const isFiltered = searchTerm || categoryFilter !== "all" || filter !== "all" || brandTypeFilter !== "all";

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || p.brand?.toLowerCase().includes(term)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((p) => (p.item_type || "other") === categoryFilter);
    }
    if (brandTypeFilter === "known") {
      result = result.filter((p) => isKnownBrand(p.brand));
    } else if (brandTypeFilter === "house") {
      result = result.filter((p) => p.brand && !isKnownBrand(p.brand));
    } else if (brandTypeFilter === "no_brand") {
      result = result.filter((p) => !p.brand);
    }
    switch (filter) {
      case "with_images": result = result.filter((p) => p.image_url); break;
      case "missing_primary": result = result.filter((p) => !p.image_url); break;
      case "complete": result = result.filter((p) => p.image_url && p.additional_images && p.additional_images.length >= MAX_ADDITIONAL); break;
    }
    return result.sort((a, b) => {
      const aHas = a.image_url ? 1 : 0;
      const bHas = b.image_url ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [products, searchTerm, filter, categoryFilter, brandTypeFilter]);

  const filteredStats = useMemo(() => {
    if (!isFiltered) return null;
    const total = filteredProducts.length;
    const withPrimary = filteredProducts.filter((p) => p.image_url).length;
    const complete = filteredProducts.filter((p) => p.image_url && p.additional_images && p.additional_images.length >= MAX_ADDITIONAL).length;
    return { total, withPrimary, missingPrimary: total - withPrimary, complete };
  }, [filteredProducts, isFiltered]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const visibleIds = visibleProducts.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  }, [visibleProducts, selectedIds]);

  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((p) => selectedIds.has(p.id));

  const exitSelectMode = useCallback(() => { setSelectMode(false); setSelectedIds(new Set()); }, []);

  const selectedProductsData = useMemo(() => {
    if (!generateForSelected) return undefined;
    return products.filter((p) => selectedIds.has(p.id)).map((p) => ({ id: p.id, name: p.name, sku: p.sku, item_type: p.item_type, brand: p.brand }));
  }, [products, selectedIds, generateForSelected]);

  const selectionSummary = useMemo(() => {
    const selected = products.filter((p) => selectedIds.has(p.id));
    const frames = selected.filter((p) => p.item_type === "frames").length;
    const others = selected.length - frames;
    return { total: selected.length, frames, others, shots: frames * 6 + others };
  }, [products, selectedIds]);

  const handleRegenerateProduct = useCallback(async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const { toast } = await import("sonner");
    toast.info(`Regenerating images for ${product?.sku || "product"}...`);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-image", { body: { productId } });
      if (error) throw error;
      if (data?.succeeded > 0) {
        toast.success(`Regenerated ${data.results?.[0]?.shots || 1} image(s)`);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } else {
        toast.error(data?.results?.[0]?.error || "Failed to regenerate");
      }
    } catch { toast.error("Failed to regenerate images"); }
  }, [products, queryClient]);

  return (
    <RoleGuard allowedRoles={["branch_manager", "admin", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Product Images Manager</h1>
              <p className="text-muted-foreground">Manage product images for your catalog</p>
            </div>
            <div className="flex items-center gap-2">
              {stats.missingPrimary > 0 && (
                <Button onClick={() => { setGenerateForSelected(false); setGenerateDialogOpen(true); }} variant="gold">
                  <Lightning className="h-4 w-4" weight="fill" />
                  Generate Missing Images
                </Button>
              )}
            </div>
          </div>

          <ImageStatsCards stats={stats} filteredStats={filteredStats} />

          <ImageFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filter={filter}
            onFilterChange={setFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={(v) => { setCategoryFilter(v); setVisibleCount(ITEMS_PER_PAGE); }}
            brandTypeFilter={brandTypeFilter}
            onBrandTypeFilterChange={(v) => { setBrandTypeFilter(v); setVisibleCount(ITEMS_PER_PAGE); }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectMode={selectMode}
            onToggleSelectMode={() => selectMode ? exitSelectMode() : setSelectMode(true)}
            itemTypeOptions={itemTypeOptions}
          />

          {/* Results Count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              {categoryFilter !== "all" && ` in ${ITEM_TYPE_LABELS[categoryFilter] || categoryFilter}`}
            </Badge>
            {searchTerm && <span className="text-sm text-muted-foreground">matching "{searchTerm}"</span>}
            {selectMode && selectedIds.size > 0 && <Badge variant="default">{selectedIds.size} selected</Badge>}
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
                  <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}>
                    Show More ({filteredProducts.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}

          <SelectionActionBar
            visible={selectMode && selectedIds.size > 0}
            total={selectionSummary.total}
            frames={selectionSummary.frames}
            others={selectionSummary.others}
            shots={selectionSummary.shots}
            onGenerate={() => { setGenerateForSelected(true); setGenerateDialogOpen(true); }}
            onExit={exitSelectMode}
          />
        </div>

        <QuickImageUploadModal
          product={selectedProduct ?? null}
          open={!!selectedProductId}
          onOpenChange={(open) => { if (!open) setSelectedProductId(null); }}
        />
        <GenerateImagesDialog
          open={generateDialogOpen}
          onOpenChange={(open) => { setGenerateDialogOpen(open); if (!open) setGenerateForSelected(false); }}
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
