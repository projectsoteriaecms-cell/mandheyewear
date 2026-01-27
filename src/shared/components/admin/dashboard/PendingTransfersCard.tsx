import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import type { StockTransfer } from "@/modules/inventory";

interface PendingTransfersCardProps {
  pendingTransfers: StockTransfer[] | undefined;
}

export const PendingTransfersCard = ({ pendingTransfers }: PendingTransfersCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Pending Transfers</CardTitle>
        <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {pendingTransfers && pendingTransfers.length > 0 ? (
          <div className="space-y-2">
            {pendingTransfers.slice(0, 3).map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono">{transfer.transfer_number}</span>
                <Badge variant="outline">{transfer.status}</Badge>
              </div>
            ))}
            {pendingTransfers.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{pendingTransfers.length - 3} more
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No pending transfers
          </p>
        )}
        <Button asChild variant="link" className="px-0 mt-2">
          <Link to="/admin/inventory/transfers">View all →</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
