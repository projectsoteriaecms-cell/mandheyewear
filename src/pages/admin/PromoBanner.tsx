import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/shared/components/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { X, MagnifyingGlass, Tag } from "@phosphor-icons/react";

interface PromoBannerData {
  id: string;
  title_line1: string;
  title_line2: string;
  date_label: string;
  description: string;
  discount_prefix: string;
  discount_value: string;
  disclaimer: string;
  featured_product_ids: string[];
  is_active: boolean;
}

interface ProductOption {
  id: string;
  name: string;
  image_url: string | null;
  brand: string | null;
  sku: string;
}

const PromoBanner = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Omit<PromoBannerData, "id" | "is_active">>({
    title_line1: "New Season",
    title_line2: "Collection",
    date_label: "April 2026 Drop",
    description: "Every frame you love",
    discount_prefix: "Up to",
    discount_value: "20% OFF",
    disclaimer: "T&Cs apply",
    featured_product_ids: [],
  });
  const [bannerId, setBannerId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  // Fetch existing banner
  const { data: existingBanner, isLoading } = useQuery({
    queryKey: ["admin-promo-banner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existingBanner) {
      setBannerId(existingBanner.id);
      setForm({
        title_line1: existingBanner.title_line1,
        title_line2: existingBanner.title_line2,
        date_label: existingBanner.date_label,
        description: existingBanner.description,
        discount_prefix: existingBanner.discount_prefix,
        discount_value: existingBanner.discount_value,
        disclaimer: existingBanner.disclaimer,
        featured_product_ids: (existingBanner.featured_product_ids || []) as string[],
      });
    }
  }, [existingBanner]);

  // Search products
  const { data: searchResults } = useQuery({
    queryKey: ["product-search", productSearch],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, name, image_url, brand, sku")
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .not("image_url", "is", null)
        .limit(10);

      if (productSearch.trim()) {
        query = query.or(`name.ilike.%${productSearch}%,brand.ilike.%${productSearch}%,sku.ilike.%${productSearch}%`);
      }

      const { data } = await query;
      return (data || []) as ProductOption[];
    },
    enabled: productSearch.length > 0,
  });

  // Fetch selected products for display
  const { data: selectedProducts } = useQuery({
    queryKey: ["selected-promo-products", form.featured_product_ids],
    queryFn: async () => {
      if (!form.featured_product_ids.length) return [];
      const { data } = await supabase
        .from("products")
        .select("id, name, image_url, brand, sku")
        .in("id", form.featured_product_ids);
      const map = new Map((data || []).map((p) => [p.id, p]));
      return form.featured_product_ids.map((id) => map.get(id)).filter(Boolean) as ProductOption[];
    },
    enabled: form.featured_product_ids.length > 0,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (bannerId) {
        const { error } = await supabase
          .from("promo_banners")
          .update({
            title_line1: form.title_line1,
            title_line2: form.title_line2,
            date_label: form.date_label,
            description: form.description,
            discount_prefix: form.discount_prefix,
            discount_value: form.discount_value,
            disclaimer: form.disclaimer,
            featured_product_ids: form.featured_product_ids,
          })
          .eq("id", bannerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("promo_banners")
          .insert({
            title_line1: form.title_line1,
            title_line2: form.title_line2,
            date_label: form.date_label,
            description: form.description,
            discount_prefix: form.discount_prefix,
            discount_value: form.discount_value,
            disclaimer: form.disclaimer,
            featured_product_ids: form.featured_product_ids,
            is_active: true,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-banner"] });
      queryClient.invalidateQueries({ queryKey: ["active-promo-banner"] });
      toast.success("Promo banner saved successfully!");
    },
    onError: (error) => {
      toast.error("Failed to save: " + error.message);
    },
  });

  const addProduct = (product: ProductOption) => {
    if (form.featured_product_ids.length >= 4) {
      toast.error("Maximum 4 featured products allowed");
      return;
    }
    if (form.featured_product_ids.includes(product.id)) return;
    setForm((prev) => ({
      ...prev,
      featured_product_ids: [...prev.featured_product_ids, product.id],
    }));
    setProductSearch("");
  };

  const removeProduct = (id: string) => {
    setForm((prev) => ({
      ...prev,
      featured_product_ids: prev.featured_product_ids.filter((pid) => pid !== id),
    }));
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Promo Banner</h1>
            <p className="text-muted-foreground">Edit the homepage promo banner content and featured frames</p>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banner Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title Line 1</Label>
                    <Input
                      value={form.title_line1}
                      onChange={(e) => setForm((p) => ({ ...p, title_line1: e.target.value }))}
                      placeholder="New Season"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title Line 2 (gold)</Label>
                    <Input
                      value={form.title_line2}
                      onChange={(e) => setForm((p) => ({ ...p, title_line2: e.target.value }))}
                      placeholder="Collection"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date Label</Label>
                  <Input
                    value={form.date_label}
                    onChange={(e) => setForm((p) => ({ ...p, date_label: e.target.value }))}
                    placeholder="April 2026 Drop"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Every frame you love..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Prefix</Label>
                    <Input
                      value={form.discount_prefix}
                      onChange={(e) => setForm((p) => ({ ...p, discount_prefix: e.target.value }))}
                      placeholder="Up to"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Value</Label>
                    <Input
                      value={form.discount_value}
                      onChange={(e) => setForm((p) => ({ ...p, discount_value: e.target.value }))}
                      placeholder="20% OFF"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Disclaimer</Label>
                  <Input
                    value={form.disclaimer}
                    onChange={(e) => setForm((p) => ({ ...p, disclaimer: e.target.value }))}
                    placeholder="T&Cs apply"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Frames ({form.featured_product_ids.length}/4)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected products */}
                {(selectedProducts || []).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand} • {product.sku}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeProduct(product.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Search */}
                {form.featured_product_ids.length < 4 && (
                  <div className="space-y-2">
                    <div className="relative">
                      <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products to add..."
                        className="pl-9"
                      />
                    </div>
                    {searchResults && searchResults.length > 0 && (
                      <div className="border rounded-lg max-h-48 overflow-y-auto">
                        {searchResults
                          .filter((p) => !form.featured_product_ids.includes(p.id))
                          .map((product) => (
                            <button
                              key={product.id}
                              onClick={() => addProduct(product)}
                              className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors text-left"
                            >
                              {product.image_url && (
                                <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded object-cover" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-gray-900 p-6 space-y-4 border border-gray-700">
                <div className="space-y-2">
                  <h2 className="font-bold text-2xl text-white uppercase leading-tight">
                    {form.title_line1}<br />
                    <span className="text-amber-400">{form.title_line2}</span>
                  </h2>
                  <div className="inline-block px-3 py-1 border-2 border-dashed border-amber-400/50 rounded-lg">
                    <span className="font-bold text-xs text-amber-400">{form.date_label}</span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm">{form.description}</p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full">
                  <Tag weight="fill" className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-gray-900 text-xs uppercase">{form.discount_prefix}</span>
                  <span className="font-bold text-orange-500 text-xl">{form.discount_value}</span>
                </div>

                <p className="text-gray-500 text-xs">{form.disclaimer}</p>

                {/* Featured frames preview */}
                {(selectedProducts || []).length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {(selectedProducts || []).map((p) => (
                      <img
                        key={p.id}
                        src={p.image_url || ""}
                        alt={p.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-amber-400/20"
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PromoBanner;
