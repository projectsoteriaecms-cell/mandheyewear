import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, MagnifyingGlass as Search } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  sku: string;
  name: string;
  item_type: string | null;
  brand: string | null;
  image_url: string | null;
  additional_images: string[] | null;
}

interface ProductWithStatus extends Product {
  hasReferenceImages: boolean;
  status: "ready" | "waiting";
}

interface ProductSelectorProps {
  onSelect: (products: Product[]) => void;
  isLoading?: boolean;
}

export const ProductSelector = ({ onSelect, isLoading }: ProductSelectorProps) => {
  const [products, setProducts] = useState<ProductWithStatus[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "ready" | "waiting">("ready");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch products with reference images status
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("id, sku, name, item_type, brand, image_url, additional_images")
          .eq("is_active", true)
          .order("item_type", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;

        // Add status based on whether they have reference images (additional_images)
        const productsWithStatus: ProductWithStatus[] = (data || []).map((p) => {
          const additionalCount = (p.additional_images || []).filter((img) => img && img.length > 0).length;
          const hasReferenceImages = additionalCount > 0;
          return {
            ...p,
            hasReferenceImages,
            status: hasReferenceImages ? "ready" : "waiting",
          };
        });

        setProducts(productsWithStatus);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Status filter
      if (filterStatus !== "all" && p.status !== filterStatus) return false;

      // Category filter
      if (filterCategory !== "all" && p.item_type !== filterCategory) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.sku.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [products, filterStatus, filterCategory, searchQuery]);

  // Unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.item_type).filter(Boolean)));
  }, [products]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: products.length,
      ready: products.filter((p) => p.status === "ready").length,
      waiting: products.filter((p) => p.status === "waiting").length,
      selected: selectedIds.size,
    };
  }, [products, selectedIds]);

  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleGenerate = () => {
    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    onSelect(selectedProducts);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-100 p-2 rounded">
          <div className="font-semibold">{stats.total}</div>
          <div className="text-slate-600">Total</div>
        </div>
        <div className="bg-green-50 p-2 rounded border border-green-200">
          <div className="font-semibold text-green-700">{stats.ready}</div>
          <div className="text-green-600">Ready ✅</div>
        </div>
        <div className="bg-amber-50 p-2 rounded border border-amber-200">
          <div className="font-semibold text-amber-700">{stats.waiting}</div>
          <div className="text-amber-600">Waiting ⏳</div>
        </div>
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
          <div className="font-semibold text-blue-700">{stats.selected}</div>
          <div className="text-blue-600">Selected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by SKU, name, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">✅ Ready (Has Images)</SelectItem>
              <SelectItem value="waiting">⏳ Waiting (Needs Images)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat || "other"}>
                  {cat || "Other"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product List */}
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-4 text-center text-slate-500">No products found</div>
        ) : (
          <div className="divide-y">
            {/* Select All Header */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 sticky top-0">
              <Checkbox
                checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                onChange={toggleAll}
              />
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {filteredProducts.length} products
                </div>
              </div>
            </div>

            {/* Product Rows */}
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors",
                  selectedIds.has(product.id) && "bg-blue-50"
                )}
                onClick={() => toggleProduct(product.id)}
              >
                <Checkbox
                  checked={selectedIds.has(product.id)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{product.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {product.sku} • {product.item_type || "other"}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {product.status === "ready" ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded text-xs font-semibold text-green-700">
                      <CheckCircle weight="fill" className="w-3 h-3" />
                      Ready
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-xs font-semibold text-amber-700">
                      <Clock weight="fill" className="w-3 h-3" />
                      Waiting
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setSelectedIds(new Set())}
          disabled={selectedIds.size === 0}
        >
          Clear
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={selectedIds.size === 0 || isLoading}
          className="flex-1"
        >
          Generate Selected {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
        </Button>
      </div>
    </div>
  );
};
