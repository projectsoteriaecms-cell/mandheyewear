import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, ArrowsLeftRight, Package } from "@phosphor-icons/react";

export const QuickActionsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/admin/inventory/purchase-orders?new=true">
            <Truck className="mr-2 h-4 w-4" weight="light" />
            New Purchase Order
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/inventory/transfers?new=true">
            <ArrowsLeftRight className="mr-2 h-4 w-4" weight="light" />
            New Stock Transfer
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/inventory/adjustments?new=true">
            <Package className="mr-2 h-4 w-4" weight="light" />
            Stock Adjustment
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
