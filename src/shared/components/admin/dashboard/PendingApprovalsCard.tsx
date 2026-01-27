import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import type { PurchaseOrder } from "@/modules/inventory";

interface PendingApprovalsCardProps {
  pendingPOs: PurchaseOrder[] | undefined;
}

export const PendingApprovalsCard = ({ pendingPOs }: PendingApprovalsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Pending Approvals</CardTitle>
        <Truck className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {pendingPOs && pendingPOs.length > 0 ? (
          <div className="space-y-2">
            {pendingPOs.slice(0, 3).map((po) => (
              <div
                key={po.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono">{po.order_number}</span>
                <Badge variant="secondary">{po.status}</Badge>
              </div>
            ))}
            {pendingPOs.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{pendingPOs.length - 3} more
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No pending purchase orders
          </p>
        )}
        <Button asChild variant="link" className="px-0 mt-2">
          <Link to="/admin/inventory/purchase-orders">View all →</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
