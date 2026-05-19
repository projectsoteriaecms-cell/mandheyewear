import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Warning } from "@phosphor-icons/react";
import type { InventoryItem } from "@/modules/inventory";

interface LowStockAlertsCardProps {
  lowStockItems: InventoryItem[] | undefined;
  loading?: boolean;
}

export const LowStockAlertsCard = ({ lowStockItems, loading }: LowStockAlertsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Low Stock Alerts</CardTitle>
        <Warning className="h-5 w-5 text-amber-500" weight="fill" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : lowStockItems && lowStockItems.length > 0 ? (
          <div className="space-y-2">
            {lowStockItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate max-w-[150px]">
                  {item.product?.name}
                </span>
                <Badge variant="destructive">
                  {item.quantity_on_hand} left
                </Badge>
              </div>
            ))}
            {lowStockItems.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{lowStockItems.length - 3} more items
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            All stock levels are healthy
          </p>
        )}
        <Button asChild variant="link" className="px-0 mt-2">
          <Link to="/admin/inventory">View inventory →</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
