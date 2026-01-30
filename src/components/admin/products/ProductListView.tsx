import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DotsThree,
  PencilSimple,
  Trash,
  ShoppingBag,
  Camera,
} from "@phosphor-icons/react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductListViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onQuickUpload: (product: Product) => void;
  formatPrice: (price: number) => string;
}

export const ProductListView = ({
  products,
  onEdit,
  onDelete,
  onQuickUpload,
  formatPrice,
}: ProductListViewProps) => {
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
        >
          {/* Image */}
          <div className="relative h-20 w-20 rounded-lg bg-muted flex items-center justify-center group flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
            ) : (
              <ShoppingBag className="h-8 w-8 text-muted-foreground" weight="light" />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickUpload(product);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                >
                  <Camera className="h-5 w-5 text-white" weight="fill" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick upload image</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-base truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
                {product.color && (
                  <p className="text-xs text-muted-foreground mt-1">{product.color}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-lg">{formatPrice(product.price)}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {product.item_type?.replace("_", " ") || "—"}
                </p>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {(product as any).brand ? (
                <Badge variant="outline" className="text-xs">
                  {(product as any).brand}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  {product.brand_line === "soteria_medical" ? "M&H Medical" : "M&H Lifestyle"}
                </Badge>
              )}
              
              {(product as any).price_tier && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    (product as any).price_tier === "luxury"
                      ? "border-amber-500 text-amber-600"
                      : (product as any).price_tier === "premium"
                      ? "border-purple-500 text-purple-600"
                      : (product as any).price_tier === "standard"
                      ? "border-blue-500 text-blue-600"
                      : "border-gray-400 text-gray-500"
                  }`}
                >
                  {(product as any).price_tier}
                </Badge>
              )}

              <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <DotsThree className="h-5 w-5" weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <PencilSimple className="mr-2 h-4 w-4" weight="light" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash className="mr-2 h-4 w-4" weight="light" />
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};
