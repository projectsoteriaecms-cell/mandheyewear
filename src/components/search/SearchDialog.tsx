import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

interface SearchResult {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  item_type: string | null;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, price, image_url, item_type")
      .eq("is_active", true)
      .eq("brand_line", "m_and_h_fashion")
      .or(`name.ilike.%${term}%,brand.ilike.%${term}%,color.ilike.%${term}%`)
      .order("name")
      .limit(8);

    setResults(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  const handleSelect = (id: string) => {
    onOpenChange(false);
    navigate(`/product/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b px-4">
          <MagnifyingGlass weight="bold" className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search eyewear by name, brand, or color..."
            className="border-0 focus-visible:ring-0 h-12 text-base"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <p className="p-4 text-sm text-muted-foreground text-center">Searching...</p>
          )}

          {!loading && debouncedQuery.length >= 2 && results.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No products found for "{debouncedQuery}"
            </p>
          )}

          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product.id)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">—</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                {product.brand && (
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                )}
              </div>
              <p className="text-sm font-semibold text-accent flex-shrink-0">
                ₦{product.price.toLocaleString()}
              </p>
            </button>
          ))}

          {!loading && debouncedQuery.length < 2 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <p>Type at least 2 characters to search</p>
              <p className="mt-1 text-xs">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd> to open anytime
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
