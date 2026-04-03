import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "@phosphor-icons/react";

export type StockStatus = "in_stock" | "available_sourcing" | "out_of_stock" | "unknown";

interface StockBadgeProps {
  status: StockStatus;
  className?: string;
}

const config: Record<StockStatus, { label: string; icon: React.ElementType; className: string }> = {
  in_stock: {
    label: "In Stock",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  available_sourcing: {
    label: "Available — 3-5 days",
    icon: Clock,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  out_of_stock: {
    label: "Out of Stock",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  unknown: {
    label: "Check Availability",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
};

export const StockBadge = ({ status, className }: StockBadgeProps) => {
  const { label, icon: Icon, className: badgeClass } = config[status];

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", badgeClass, className)}>
      <Icon weight="fill" className="h-3 w-3" />
      {label}
    </span>
  );
};
