import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/shared/layouts/admin";

import { useAdminProducts } from "@/modules/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleGuard } from "@/modules/auth";

const PER_PAGE = 12;

/**
 * Side-by-side compare:
 *  - LEFT  = anchor / original upload  (product.image_url, i.e. /main.{ext})
 *  - RIGHT = AI-generated catalog shot (product.additional_images[i])
 *
 * Each card has its own "shot index" stepper + an Overlay toggle that
 * swaps the right pane between the new render and the anchor for
 * direct pixel-level comparison.
 */
const ProductImageCompare = () => {
  const { products, isLoading } = useAdminProducts();
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PER_PAGE);

  const eligible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((p) => p.image_url && (p.additional_images?.length ?? 0) > 0)
      .filter((p) =>
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
      )
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  }, [products, search]);

  const visibleProducts = eligible.slice(0, visible);

  return (
    <RoleGuard allowedRoles={["branch_manager", "admin", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  to="/admin/products/images"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Image Manager
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-foreground mt-1">
                Compare: Anchor vs AI Render
              </h1>
              <p className="text-muted-foreground text-sm">
                Original uploaded photo on the left, generated catalog shot on
                the right. Toggle overlay to A/B the same frame.
              </p>
            </div>
            <Input
              placeholder="Search SKU, name, brand…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisible(PER_PAGE);
              }}
              className="w-full sm:w-72"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {eligible.length} product{eligible.length !== 1 ? "s" : ""} with
              renders
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : eligible.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <ImageOff className="h-12 w-12 mb-3" />
              <p>No products with both an anchor and AI renders yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {visibleProducts.map((p) => (
                  <CompareCard
                    key={p.id}
                    sku={p.sku}
                    name={p.name}
                    brand={p.brand}
                    anchor={p.image_url!}
                    renders={p.additional_images ?? []}
                  />
                ))}
              </div>

              {visible < eligible.length && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setVisible((v) => v + PER_PAGE)}
                  >
                    Show More ({eligible.length - visible} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

interface CompareCardProps {
  sku: string;
  name: string;
  brand?: string | null;
  anchor: string;
  renders: string[];
}

const CompareCard = ({ sku, name, brand, anchor, renders }: CompareCardProps) => {
  const [idx, setIdx] = useState(0);
  const [overlay, setOverlay] = useState(false);

  const total = renders.length;
  const current = renders[idx];
  const rightSrc = overlay ? anchor : current;
  const rightLabel = overlay ? "Anchor (overlay)" : `AI render ${idx + 1}/${total}`;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <div className="font-semibold truncate text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">
            {sku}
            {brand ? ` · ${brand}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Overlay anchor</span>
          <Switch checked={overlay} onCheckedChange={setOverlay} />
        </div>
      </div>

      {/* Side-by-side */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <Pane label="Original upload (anchor)" src={anchor} />
        <Pane label={rightLabel} src={rightSrc} highlight={overlay} />
      </div>

      {/* Shot stepper */}
      {total > 1 && (
        <div className="px-4 py-2 border-t border-border flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIdx((i) => (i - 1 + total) % total)}
            disabled={overlay}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {renders.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                disabled={overlay}
                className={cn(
                  "w-2 h-2 rounded-full transition-all disabled:opacity-30",
                  i === idx ? "bg-primary w-4" : "bg-muted-foreground/40"
                )}
                aria-label={`Render ${i + 1}`}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIdx((i) => (i + 1) % total)}
            disabled={overlay}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const Pane = ({
  label,
  src,
  highlight,
}: {
  label: string;
  src: string;
  highlight?: boolean;
}) => (
  <div className="bg-secondary relative">
    <div className="aspect-square overflow-hidden">
      <img
        src={src}
        alt={label}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div
      className={cn(
        "absolute top-2 left-2 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded backdrop-blur-sm",
        highlight
          ? "bg-accent text-accent-foreground"
          : "bg-background/80 text-foreground"
      )}
    >
      {label}
    </div>
  </div>
);

export default ProductImageCompare;
