import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useZohoSync } from "@/hooks/admin/useZohoSync";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MagnifyingGlass, Link as LinkIcon, ShoppingBag } from "@phosphor-icons/react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface LinkToZohoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkToZohoDialog({ open, onOpenChange }: LinkToZohoDialogProps) {
  const [selectedEcms, setSelectedEcms] = useState<Product | null>(null);
  const [selectedZoho, setSelectedZoho] = useState<Product | null>(null);
  const [ecmsSearch, setEcmsSearch] = useState("");
  const [zohoSearch, setZohoSearch] = useState("");
  const [linking, setLinking] = useState(false);
  const { linkProduct } = useZohoSync();
  const queryClient = useQueryClient();

  // Fetch unlinked ECMS products (have external_id, no zoho_item_id)
  const { data: ecmsProducts } = useQuery({
    queryKey: ["unlinked-ecms", ecmsSearch],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, name, sku, price, image_url, external_id")
        .is("zoho_item_id", null)
        .not("external_id", "is", null)
        .order("name")
        .limit(50);

      if (ecmsSearch) {
        query = query.or(`name.ilike.%${ecmsSearch}%,sku.ilike.%${ecmsSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Fetch Zoho-only products (have zoho_item_id, no images — likely unlinked)
  const { data: zohoProducts } = useQuery({
    queryKey: ["zoho-unlinked", zohoSearch],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, name, sku, price, zoho_item_id, image_url")
        .not("zoho_item_id", "is", null)
        .is("image_url", null)
        .order("name")
        .limit(50);

      if (zohoSearch) {
        query = query.or(`name.ilike.%${zohoSearch}%,sku.ilike.%${zohoSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleLink = async () => {
    if (!selectedEcms || !selectedZoho?.zoho_item_id) return;

    setLinking(true);
    try {
      await linkProduct(selectedEcms.id, selectedZoho.zoho_item_id);

      // Delete the Zoho-only duplicate since the ECMS product now has the zoho_item_id
      await supabase.from("products").delete().eq("id", selectedZoho.id);

      toast.success(`Linked "${selectedEcms.name}" to Zoho item`);
      setSelectedEcms(null);
      setSelectedZoho(null);
      queryClient.invalidateQueries({ queryKey: ["unlinked-ecms"] });
      queryClient.invalidateQueries({ queryKey: ["zoho-unlinked"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to link");
    } finally {
      setLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" weight="bold" />
            Link Products to Zoho
          </DialogTitle>
          <DialogDescription>
            Select an ECMS product and a Zoho product to merge them. The ECMS product keeps its images and description; pricing syncs from Zoho.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* ECMS Products Column */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">ECMS Products (unlinked)</h3>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ECMS..."
                value={ecmsSearch}
                onChange={(e) => setEcmsSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-1">
                {ecmsProducts?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedEcms(p as Product)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedEcms?.id === p.id
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {p.image_url ? (
                        <img src={p.image_url} className="h-8 w-8 rounded object-cover" alt="" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" weight="light" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {ecmsProducts?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No unlinked ECMS products</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Zoho Products Column */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Zoho Products (no images)</h3>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Zoho..."
                value={zohoSearch}
                onChange={(e) => setZohoSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-1">
                {zohoProducts?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedZoho(p as Product)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedZoho?.id === p.id
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                    </div>
                  </button>
                ))}
                {zohoProducts?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No unlinked Zoho products</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Link action */}
        {selectedEcms && selectedZoho && (
          <div className="mt-4 p-3 rounded-lg border bg-accent/30 flex items-center justify-between gap-4">
            <div className="text-sm">
              <span className="font-medium">{selectedEcms.name}</span>
              <span className="text-muted-foreground mx-2">→</span>
              <span className="font-medium">{selectedZoho.name}</span>
            </div>
            <Button onClick={handleLink} disabled={linking} size="sm">
              <LinkIcon className="mr-2 h-4 w-4" weight="bold" />
              {linking ? "Linking…" : "Link & Merge"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
