import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/shared/components/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  X,
  MagnifyingGlass,
  ArrowUp,
  ArrowDown,
  Plus,
  Lightning,
} from "@phosphor-icons/react";

interface SlideshowItem {
  id: string;
  product_id: string;
  display_order: number;
  discount_percent: number | null;
  discount_label: string | null;
  is_active: boolean;
  product?: {
    id: string;
    name: string;
    image_url: string | null;
    brand: string | null;
    price: number;
    sku: string;
    style: string | null;
  };
}

interface ProductOption {
  id: string;
  name: string;
  image_url: string | null;
  brand: string | null;
  sku: string;
  price: number;
}

const SlideshowManager = () => {
  const queryClient = useQueryClient();
  const [productSearch, setProductSearch] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-slideshow-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slideshow_items")
        .select("*, product:products(id, name, image_url, brand, price, sku, style)")
        .order("display_order");
      if (error) throw error;
      return (data || []) as unknown as SlideshowItem[];
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["slideshow-product-search", productSearch],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, image_url, brand, sku, price")
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .not("image_url", "is", null)
        .or(`name.ilike.%${productSearch}%,brand.ilike.%${productSearch}%,sku.ilike.%${productSearch}%`)
        .limit(10);
      return (data || []) as ProductOption[];
    },
    enabled: productSearch.length > 1,
  });

  const existingProductIds = items.map((i) => i.product_id);

  const addMutation = useMutation({
    mutationFn: async (product: ProductOption) => {
      const { error } = await supabase.from("slideshow_items").insert({
        product_id: product.id,
        display_order: items.length,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slideshow-items"] });
      queryClient.invalidateQueries({ queryKey: ["promo-slideshow-products"] });
      setProductSearch("");
      toast.success("Product added to slideshow");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: {
      id: string;
      discount_percent?: number | null;
      discount_label?: string | null;
      is_active?: boolean;
      display_order?: number;
    }) => {
      const { error } = await supabase
        .from("slideshow_items")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slideshow-items"] });
      queryClient.invalidateQueries({ queryKey: ["promo-slideshow-products"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("slideshow_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slideshow-items"] });
      queryClient.invalidateQueries({ queryKey: ["promo-slideshow-products"] });
      toast.success("Removed from slideshow");
    },
    onError: (e) => toast.error(e.message),
  });

  const moveItem = (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const a = items[index];
    const b = items[swapIndex];
    updateMutation.mutate({ id: a.id, display_order: b.display_order });
    updateMutation.mutate({ id: b.id, display_order: a.display_order });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Hot Picks Slideshow</h1>
          <p className="text-muted-foreground">
            Select products to feature in the homepage slideshow. Set discounts and labels per item.
          </p>
        </div>

        {/* Add product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus weight="bold" className="w-4 h-4" />
              Add Product ({items.length}/8)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, brand or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9"
                disabled={items.length >= 8}
              />
            </div>
            {searchResults && searchResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {searchResults
                  .filter((p) => !existingProductIds.includes(p.id))
                  .map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addMutation.mutate(product)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                    >
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.brand} • {product.sku} • ₦{product.price?.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items list */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.id} className={!item.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.product?.image_url || "/placeholder.svg"}
                    alt={item.product?.name}
                    className="w-16 h-16 rounded-lg object-cover bg-muted flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold truncate">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.product?.brand} • ₦{item.product?.price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={index === 0}
                          onClick={() => moveItem(index, "up")}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={index === items.length - 1}
                          onClick={() => moveItem(index, "down")}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Discount fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Discount %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={99}
                          placeholder="e.g. 20"
                          value={item.discount_percent ?? ""}
                          onChange={(e) =>
                            updateMutation.mutate({
                              id: item.id,
                              discount_percent: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Label</Label>
                        <Input
                          placeholder="e.g. CLEARANCE"
                          value={item.discount_label ?? ""}
                          onChange={(e) =>
                            updateMutation.mutate({
                              id: item.id,
                              discount_label: e.target.value || null,
                            })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.discount_percent && (
                          <Badge variant="destructive" className="text-xs">
                            {item.discount_percent}% OFF
                          </Badge>
                        )}
                        {item.discount_label && (
                          <Badge variant="secondary" className="text-xs">
                            {item.discount_label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Active</Label>
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={(checked) =>
                            updateMutation.mutate({ id: item.id, is_active: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {items.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Lightning weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No slideshow items yet</p>
                <p className="text-sm">Search and add products above to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SlideshowManager;
