import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "@phosphor-icons/react";

interface InventoryItem {
  id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  bin_location: string | null;
  product?: {
    sku?: string;
    name?: string;
    image_url?: string | null;
    item_type?: string | null;
  };
  branch?: {
    name?: string;
    city?: string;
  };
}

const getStockStatus = (quantity: number, threshold: number) => {
  if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const };
  if (quantity <= threshold) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "default" as const };
};

const StockStatusBadge = ({ quantity, threshold }: { quantity: number; threshold: number }) => {
  const status = getStockStatus(quantity, threshold);
  if (status.variant === "warning") {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
        {status.label}
      </Badge>
    );
  }
  return <Badge variant={status.variant}>{status.label}</Badge>;
};

interface InventoryTableProps {
  items?: InventoryItem[];
  loading?: boolean;
  showLowStockOnly?: boolean;
}

export const InventoryTable = ({ items, loading, showLowStockOnly }: InventoryTableProps) => (
  <Card>
    <CardContent className="p-0">
      {loading ? (
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">On Hand</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bin Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">{item.product?.sku}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" weight="light" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.product?.item_type?.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{item.branch?.name}</p>
                    <p className="text-xs text-muted-foreground">{item.branch?.city}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{item.quantity_on_hand}</TableCell>
                <TableCell className="text-right font-mono">{item.quantity_reserved}</TableCell>
                <TableCell className="text-right font-mono">
                  {item.quantity_on_hand - item.quantity_reserved}
                </TableCell>
                <TableCell>
                  <StockStatusBadge
                    quantity={item.quantity_on_hand}
                    threshold={item.low_stock_threshold || 5}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{item.bin_location || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" weight="light" />
          <h3 className="text-lg font-medium">No inventory found</h3>
          <p className="text-muted-foreground">
            {showLowStockOnly
              ? "No items are currently low on stock"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);
