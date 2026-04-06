import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useZohoSync } from "@/modules/integrations";
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
import { MagnifyingGlass, Link as LinkIcon, ShoppingBag, Lightning } from "@phosphor-icons/react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface LinkToZohoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Fuzzy matching helpers (mirrors edge function logic) ──

function stripNamePrefix(name: string): string {
  return name.replace(/^(Frame|FRAME|Frames|FRAMES|ACCESSORIES|Ropes|Sunglasses|Contact Lenses?|Lenses?|Solutions?|Medications?|Cleanser|Packaging)\s*:\s*/i, "").trim();
}

function tokenizeName(name: string): Set<string> {
  const stripped = stripNamePrefix(name);
  const cleaned = stripped
    .replace(/\bFRAME\b/gi, "")
    .replace(/\bFRAMES\b/gi, "")
    .toLowerCase()
    .trim();
  const tokens = cleaned.split(/[\s]+/).filter(t => t.length > 0);
  return new Set(tokens);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
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
        .limit(100);

      if (zohoSearch) {
        query = query.or(`name.ilike.%${zohoSearch}%,sku.ilike.%${zohoSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Compute fuzzy suggestions when an ECMS product is selected
  const fuzzyMatches = useMemo(() => {
    if (!selectedEcms || !zohoProducts) return [];
    const ecmsTokens = tokenizeName(selectedEcms.name);
    
    const scored = zohoProducts.map(zp => ({
      product: zp,
      score: jaccardSimilarity(ecmsTokens, tokenizeName(zp.name)),
    }));

    return scored
      .filter(s => s.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [selectedEcms, zohoProducts]);

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

  const scoreColor = (score: number) => {
    if (score >= 0.6) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 0.4) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-muted text-muted-foreground";
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
            Select an ECMS product and a Zoho product to merge them. Fuzzy suggestions appear automatically when you select an ECMS product.
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
                    onClick={() => {
                      setSelectedEcms(p as Product);
                      setSelectedZoho(null); // Reset Zoho selection for new suggestions
                    }}
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
            <h3 className="font-medium text-sm flex items-center gap-2">
              Zoho Products (no images)
              {selectedEcms && fuzzyMatches.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Lightning className="h-3 w-3 mr-1" weight="fill" />
                  {fuzzyMatches.length} suggestions
                </Badge>
              )}
            </h3>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Zoho..."
                value={zohoSearch}
                onChange={(e) => setZohoSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Fuzzy suggestions panel */}
            {selectedEcms && fuzzyMatches.length > 0 && !zohoSearch && (
              <div className="border rounded-lg bg-accent/20 p-2 space-y-1">
                <p className="text-xs text-muted-foreground font-medium px-1">Suggested matches:</p>
                {fuzzyMatches.map(({ product: p, score }) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedZoho(p as Product)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedZoho?.id === p.id
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                      </div>
                      <Badge className={`text-xs shrink-0 ${scoreColor(score)}`}>
                        {Math.round(score * 100)}%
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <ScrollArea className={`border rounded-lg ${selectedEcms && fuzzyMatches.length > 0 && !zohoSearch ? "h-[140px]" : "h-[300px]"}`}>
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
