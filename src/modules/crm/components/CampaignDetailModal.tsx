import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, Send, Pause, Play, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCampaignSendStatus, usePauseCampaign, useResumeCampaign, useTriggerCampaignSend, useCampaignAnalytics, CampaignAnalyticsCard } from "@/modules/crm";
import type { CrmCampaign } from "@/modules/crm";
import { Loader2 } from "lucide-react";

interface CampaignDetailModalProps {
  campaign: CrmCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSendClick: () => void;
  onTestClick: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  running:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  paused:    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onSendClick,
  onTestClick,
}: CampaignDetailModalProps) {
  const status = useCampaignSendStatus(campaign?.id || null);
  const pause = usePauseCampaign();
  const resume = useResumeCampaign();
  const trigger = useTriggerCampaignSend();
  const analytics = useCampaignAnalytics(campaign?.id || null);

  if (!campaign) return null;

  const isDraft = campaign.status === "draft";
  const isRunning = campaign.status === "running";
  const isPaused = campaign.status === "paused";
  const busy = pause.isPending || resume.isPending || trigger.isPending;

  const createdAt = new Date(campaign.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{campaign.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {createdAt}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Status
                </p>
                <div className={cn("rounded-full px-3 py-1 w-fit text-sm font-medium capitalize", STATUS_STYLES[campaign.status])}>
                  {campaign.status}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Segment
                </p>
                <p className="text-sm font-medium">{campaign.segment_name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Subject Line
                </p>
                <p className="text-sm">{campaign.subject_line || "No subject"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Template
                </p>
                <p className="text-sm">{campaign.template_id || "Default"}</p>
              </div>
            </div>
          </Card>

          {/* Analytics Section */}
          {(isRunning || isPaused || campaign.status === "completed") && (
            <CampaignAnalyticsCard
              analytics={analytics.data}
              isLoading={analytics.isLoading}
              isCompact={false}
            />
          )}

          {/* Progress Section (if running/paused/completed) */}
          {(isRunning || isPaused || campaign.status === "completed") && status.totalRecipients > 0 && (
            <Card className="p-4">
              <p className="text-sm font-medium mb-3">Delivery Progress</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{status.sentCount.toLocaleString()} / {status.totalRecipients.toLocaleString()} sent</span>
                    <span>{status.percentDone}%</span>
                  </div>
                  <Progress value={status.percentDone} className="h-2" />
                </div>
                {status.startedAt && (
                  <p className="text-xs text-muted-foreground">
                    Started: {new Date(status.startedAt).toLocaleString()}
                  </p>
                )}
                {status.completedAt && (
                  <p className="text-xs text-muted-foreground">
                    Completed: {new Date(status.completedAt).toLocaleString()}
                  </p>
                )}
                {status.errorMessage && (
                  <p className="text-xs text-destructive">Error: {status.errorMessage}</p>
                )}
              </div>
            </Card>
          )}

          {/* Actions Section */}
          <Card className="p-4 bg-muted/50">
            <p className="text-sm font-medium mb-3">Actions</p>
            <div className="flex flex-wrap gap-2">
              {isDraft && (
                <>
                  <Button size="sm" variant="outline" onClick={onTestClick}>
                    <Mail className="mr-1.5 h-3.5 w-3.5" /> Test Email
                  </Button>
                  <Button size="sm" onClick={onSendClick}>
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Send Campaign
                  </Button>
                </>
              )}
              {isRunning && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => pause.mutate(campaign.id)}
                  disabled={busy}
                >
                  {pause.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
                </Button>
              )}
              {isPaused && (
                <Button
                  size="sm"
                  onClick={() => resume.mutate(campaign.id)}
                  disabled={busy}
                >
                  {resume.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  <Play className="mr-1.5 h-3.5 w-3.5" /> Resume
                </Button>
              )}
            </div>
          </Card>

          {/* Campaign Info */}
          <Card className="p-4">
            <p className="text-sm font-medium mb-3">Campaign Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{campaign.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{createdAt}</span>
              </div>
              {campaign.scheduled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled for:</span>
                  <span>{new Date(campaign.scheduled_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
