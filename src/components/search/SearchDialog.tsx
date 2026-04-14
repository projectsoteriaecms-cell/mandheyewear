import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, X, ArrowsDownUp, Clock, TrendUp } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

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

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "eyeglasses", label: "Eyeglasses" },
  { key: "sunglasses", label: "Sunglasses" },
  { key: "accessories", label: "Accessories" },
];

const RECENT_SEARCHES_KEY = "mh_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const recent = getRecentSearches().filter((s) => s !== term);
  recent.unshift(term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("all");
  const [sortAZ, setSortAZ] = useState<"asc" | "desc" | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebouncedValue(query, 300);
  const navigate = useNavigate();

  const search = useCallback(async (term: string, cat: string, sort: "asc" | "desc" | null) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);

    let q = supabase
      .from("products")
      .select("id, name, brand, price, image_url, item_type")
      .eq("is_active", true)
      .eq("brand_line", "m_and_h_fashion")
      .or(`name.ilike.%${term}%,brand.ilike.%${term}%,color.ilike.%${term}%`);

    // Category filter
    if (cat === "eyeglasses") {
      q = q.eq("item_type", "frames").eq("is_prescription_compatible", true);
    } else if (cat === "sunglasses") {
      q = q.eq("item_type", "frames").eq("is_prescription_compatible", false);
    } else if (cat === "accessories") {
      q = q.in("item_type", ["accessories", "solutions", "cleanser", "other"]);
    }

    // Sort
    if (sort === "asc") {
      q = q.order("name", { ascending: true });
    } else if (sort === "desc") {
      q = q.order("name", { ascending: false });
    } else {
      q = q.order("name");
    }

    const { data } = await q.limit(12);
    setResults(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    search(debouncedQuery, category, sortAZ);
  }, [debouncedQuery, category, sortAZ, search]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setCategory("all");
      setSortAZ(null);
    } else {
      setRecentSearches(getRecentSearches());
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
    if (query.length >= 2) saveRecentSearch(query);
    onOpenChange(false);
    navigate(`/product/${id}`);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const toggleSort = () => {
    setSortAZ((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b px-4">
          <MagnifyingGlass weight="bold" className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, brand, or color..."
            className="border-0 focus-visible:ring-0 h-12 text-base"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category chips + Sort */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                category === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={toggleSort}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
              sortAZ ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            title="Sort alphabetically"
          >
            <ArrowsDownUp className="h-3.5 w-3.5" />
            {sortAZ === "asc" ? "A→Z" : sortAZ === "desc" ? "Z→A" : "Sort"}
          </button>
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

          {/* Empty state: recent searches + trending */}
          {!loading && debouncedQuery.length < 2 && (
            <div className="p-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                    <Clock className="h-3.5 w-3.5" />
                    Recent Searches
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                  <TrendUp className="h-3.5 w-3.5" />
                  Popular
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Aviator", "Cat Eye", "Round", "Rectangle", "Wayfarer"].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleRecentClick(term)}
                      className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground pt-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd> to open anytime
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
