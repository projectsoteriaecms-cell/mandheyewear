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
import { Mail, Send, Pause, Play, X, Pencil, Trophy, FlaskConical, Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCampaignSendStatus, usePauseCampaign, useResumeCampaign, useTriggerCampaignSend, useCampaignAnalytics, CampaignAnalyticsCard, CampaignWhatsAppSection } from "@/modules/crm";
import type { CrmCampaign } from "@/modules/crm";
import { useAbStats, useResolveAbWinner } from "../hooks/useAbWinner";
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

// ── A/B Test Results Panel ────────────────────────────────────────────────────

function AbTestPanel({ campaign }: { campaign: CrmCampaign }) {
  const stats = useAbStats(campaign.id);
  const resolve = useResolveAbWinner();

  const hoursElapsed = campaign.started_at
    ? (Date.now() - new Date(campaign.started_at).getTime()) / (1000 * 60 * 60)
    : 0;
  const testWindowPassed = hoursElapsed >= 4;

  const winner = stats.data?.ab_winner ?? campaign.ab_winner;
  const s = stats.data;

  const VariantBar = ({ label, subject, opens, sent, rate, isWinner }: {
    label: string; subject: string; opens: number; sent: number; rate: number; isWinner: boolean;
  }) => (
    <div className={cn(
      "rounded-lg border p-3 space-y-2",
      isWinner
        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
        : "border-border bg-muted/30",
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-muted-foreground">
            {label}
          </span>
          {isWinner && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Trophy className="h-3 w-3" /> Winner
            </span>
          )}
        </div>
        <span className="text-sm font-bold tabular-nums">
          {rate}% opens
        </span>
      </div>
      <p className="text-xs text-muted-foreground italic line-clamp-1">"{subject}"</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{opens} unique opens</span>
        <span>·</span>
        <span>{sent} sent</span>
      </div>
    </div>
  );

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-violet-500" />
          <p className="text-sm font-medium">A/B Subject Line Test</p>
        </div>
        {!winner && !testWindowPassed && campaign.started_at && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {hoursElapsed < 1
                ? "< 1 hr elapsed"
                : `${Math.floor(hoursElapsed)}h elapsed`}
              {" · resolves after 4h"}
            </span>
          </div>
        )}
      </div>

      {stats.isLoading ? (
        <div className="text-xs text-muted-foreground">Loading stats…</div>
      ) : s?.ok ? (
        <div className="space-y-2">
          <VariantBar
            label="Subject A"
            subject={campaign.subject_line ?? ""}
            opens={s.opens_a}
            sent={s.sent_a}
            rate={s.open_rate_a}
            isWinner={winner === 'a'}
          />
          <VariantBar
            label="Subject B"
            subject={campaign.subject_line_b ?? ""}
            opens={s.opens_b}
            sent={s.sent_b}
            rate={s.open_rate_b}
            isWinner={winner === 'b'}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {s?.reason === 'ab_not_enabled'
            ? "A/B not enabled on this campaign."
            : "Stats not available yet — data arrives via Resend webhooks after emails are opened."}
        </p>
      )}

      {!winner && (testWindowPassed || !campaign.started_at) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => resolve.mutate(campaign.id)}
          disabled={resolve.isPending}
          className="w-full"
        >
          {resolve.isPending
            ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Resolving…</>
            : <><Trophy className="mr-1.5 h-3.5 w-3.5" /> Resolve winner now</>}
        </Button>
      )}

      {winner && (
        <p className="text-xs text-muted-foreground text-center">
          Winner locked: Subject {winner.toUpperCase()} with{' '}
          {winner === 'a' ? s?.open_rate_a : s?.open_rate_b}% open rate.
        </p>
      )}
    </Card>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onSendClick,
  onTestClick,
}: CampaignDetailModalProps) {
  const navigate = useNavigate();
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

          {/* A/B Test Results */}
          {campaign.ab_enabled && campaign.subject_line_b && (
            <AbTestPanel campaign={campaign} />
          )}

          {/* WhatsApp Channel Section */}
          <CampaignWhatsAppSection campaign={campaign} />

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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      navigate(`/admin/crm/campaigns/${campaign!.id}/edit`);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Campaign
                  </Button>
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
