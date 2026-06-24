import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignListItem } from "./CampaignListItem";
import type { CrmCampaign } from "@/modules/crm";
import { Megaphone } from "lucide-react";
import { memo } from "react";

interface CampaignsTabContentProps {
  campaigns: CrmCampaign[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
  onCampaignClick: (campaign: CrmCampaign) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (campaignId: string, selected: boolean) => void;
  showCheckboxes?: boolean;
}

function CampaignsTabContentComponent({
  campaigns,
  isLoading,
  emptyMessage,
  onCampaignClick,
  selectedIds = new Set(),
  onSelectionChange,
  showCheckboxes = false,
}: CampaignsTabContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => (
        <CampaignListItem
          key={campaign.id}
          campaign={campaign}
          onClick={() => onCampaignClick(campaign)}
          showCheckbox={showCheckboxes}
          isSelected={selectedIds.has(campaign.id)}
          onSelect={(selected) => onSelectionChange?.(campaign.id, selected)}
        />
      ))}
    </div>
  );
}

export const CampaignsTabContent = memo(CampaignsTabContentComponent);
