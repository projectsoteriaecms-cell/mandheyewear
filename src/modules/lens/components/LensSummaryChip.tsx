import { Badge } from "@/components/ui/badge";
import { Glasses, AlertTriangle } from "lucide-react";
import { LENS_TYPE_LABELS, REQUIRES_FITTING, type LensType } from "../constants";

interface Props {
  lensType: LensType;
  fittingBooked?: boolean;
  lensPrice?: number;
  className?: string;
}

export function LensSummaryChip({ lensType, fittingBooked, lensPrice, className }: Props) {
  const needsFitting = REQUIRES_FITTING[lensType];
  const label = LENS_TYPE_LABELS[lensType];

  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-xs ${className ?? ""}`}>
      <Badge variant="secondary" className="gap-1">
        <Glasses className="h-3 w-3" />
        {label}
      </Badge>
      {lensPrice !== undefined && lensPrice > 0 && (
        <Badge variant="outline">+₦{lensPrice.toLocaleString()}</Badge>
      )}
      {needsFitting && (
        <Badge variant={fittingBooked ? "outline" : "destructive"} className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {fittingBooked ? "Fitting to be booked" : "Fitting required"}
        </Badge>
      )}
    </div>
  );
}
