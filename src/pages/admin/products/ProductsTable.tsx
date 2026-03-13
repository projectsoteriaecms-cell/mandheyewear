import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DotsThree,
  PencilSimple,
  Trash,
  ShoppingBag,
  Camera,
  List,
  SquaresFour,
} from "@phosphor-icons/react";
import { ProductListView } from "@/modules/products/components/ProductListView";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ViewMode = "grid" | "list";

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onQuickUpload: (product: Product) => void;
  formatPrice: (price: number) => string;
}

export const ProductsTable = ({
  products,
  isLoading,
  viewMode,
  onViewModeChange,
  onEdit,
  onDelete,
  onQuickUpload,
  formatPrice,
}: ProductsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" weight="light" />
            Product Catalog ({products.length})
          </CardTitle>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
            className="border rounded-lg p-1"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
              <SquaresFour className="h-4 w-4" weight="light" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="px-3">
              <List className="h-4 w-4" weight="light" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-50" weight="light" />
            <p>No products found</p>
            <p className="text-sm">Add your first product to get started</p>
          </div>
        ) : viewMode === "list" ? (
          <ProductListView
            products={products}
            onEdit={onEdit}
            onDelete={onDelete}
            onQuickUpload={onQuickUpload}
            formatPrice={formatPrice}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded bg-muted flex items-center justify-center group">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-muted-foreground" weight="light" />
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickUpload(product);
                                }}
                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                              >
                                <Camera className="h-4 w-4 text-white" weight="fill" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Quick upload image</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.color && (
                            <p className="text-xs text-muted-foreground">{product.color}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      {product.brand ? (
                        <span className="text-sm">{product.brand}</span>
                      ) : (
                        <Badge variant="outline">
                          {product.brand_line === "soteria_medical" ? "Soteria" : "M&H"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {product.item_type?.replace("_", " ") || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell>
                      {product.price_tier && (
                        <Badge
                          variant="outline"
                          className={
                            product.price_tier === "luxury" ? "border-amber-500 text-amber-600" :
                            product.price_tier === "premium" ? "border-purple-500 text-purple-600" :
                            product.price_tier === "standard" ? "border-blue-500 text-blue-600" :
                            "border-gray-400 text-gray-500"
                          }
                        >
                          {product.price_tier}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <DotsThree className="h-4 w-4" weight="bold" />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
