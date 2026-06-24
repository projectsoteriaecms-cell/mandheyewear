import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Eye, Click } from 'lucide-react';
import { memo } from 'react';
import type { CampaignAnalytics } from '../hooks/useCampaignAnalytics';

interface CampaignAnalyticsCardProps {
  analytics: CampaignAnalytics | undefined;
  isLoading: boolean;
  isCompact?: boolean;
}

function CampaignAnalyticsCardComponent({
  analytics,
  isLoading,
  isCompact = false,
}: CampaignAnalyticsCardProps) {
  if (isLoading) {
    return <Skeleton className={isCompact ? 'h-16' : 'h-24'} />;
  }

  if (!analytics) {
    return null;
  }

  if (isCompact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Send className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-medium">{analytics.sentPercentage}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5 text-purple-500" />
          <span className="font-medium">{analytics.estimatedOpenRate}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Click className="h-3.5 w-3.5 text-green-500" />
          <span className="font-medium">{analytics.estimatedClickRate}%</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-muted/50 to-muted/25">
      <div className="space-y-4">
        {/* Send Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Delivery Rate</span>
            </div>
            <span className="text-sm font-bold text-blue-600">
              {analytics.totalSent.toLocaleString()} / {analytics.totalRecipients.toLocaleString()}
            </span>
          </div>
          <Progress value={analytics.sentPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{analytics.sentPercentage}% sent</p>
        </div>

        {/* Open & Click Rates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Eye className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-xs font-medium">Open Rate</span>
            </div>
            <div className="text-lg font-bold text-purple-600">{analytics.estimatedOpenRate}%</div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Click className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs font-medium">Click Rate</span>
            </div>
            <div className="text-lg font-bold text-green-600">{analytics.estimatedClickRate}%</div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export const CampaignAnalyticsCard = memo(CampaignAnalyticsCardComponent);
