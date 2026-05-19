import { Badge } from "@/components/ui/badge";

const STAGE_META: Record<string, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  patient: { label: "Patient", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
  cancelled: { label: "Cancelled", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  no_show: { label: "No-show", className: "bg-rose-100 text-rose-800 hover:bg-rose-100" },
};

export const CrmStageBadge = ({ stage }: { stage?: string | null }) => {
  if (!stage) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Not synced
      </Badge>
    );
  }
  const meta = STAGE_META[stage] ?? { label: stage, className: "" };
  return <Badge className={`text-xs ${meta.className}`}>{meta.label}</Badge>;
};
