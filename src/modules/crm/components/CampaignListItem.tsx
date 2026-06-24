import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/shared/lib/utils";
import { ChevronRight } from "lucide-react";
import type { CrmCampaign } from "@/modules/crm";
import { memo } from "react";
import { useCampaignAnalytics } from "../hooks/useCampaignAnalytics";
import { CampaignAnalyticsCard } from "./CampaignAnalyticsCard";

interface CampaignListItemProps {
  campaign: CrmCampaign;
  onClick: () => void;
  onSelect?: (selected: boolean) => void;
  isSelected?: boolean;
  showCheckbox?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  running:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  paused:    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function CampaignListItemComponent({
  campaign,
  onClick,
  onSelect,
  isSelected = false,
  showCheckbox = false,
}: CampaignListItemProps) {
  const createdAt = new Date(campaign.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const analytics = useCampaignAnalytics(campaign.id);
  const showAnalytics = campaign.status === "running" || campaign.status === "completed" || campaign.status === "paused";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]",
        isSelected && "border-primary/50 bg-primary/5",
        showCheckbox && "hover:border-primary/50"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          {showCheckbox && (
            <div className="flex-none pt-1" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect?.(checked === true)}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{campaign.name}</h3>
              <Badge
                className={cn(
                  "text-xs capitalize whitespace-nowrap",
                  STATUS_STYLES[campaign.status]
                )}
              >
                {campaign.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {campaign.subject_line || "No subject"}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{campaign.segment_name || "No segment"}</span>
              <span>•</span>
              <span>Created {createdAt}</span>
            </div>
          </div>

          <div className="flex-none">
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors" />
          </div>
        </div>

        {showAnalytics && (
          <div className="border-t pt-3">
            <CampaignAnalyticsCard
              analytics={analytics.data}
              isLoading={analytics.isLoading}
              isCompact={true}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export const CampaignListItem = memo(CampaignListItemComponent);
