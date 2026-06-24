import { useState } from "react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { useIsSuperAdmin } from "@/modules/auth/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Megaphone, Send, Pause, Play, Trash2, Loader2, ShieldAlert, Gauge, Zap, Mail,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  CrmAccessGate,
  TriggerCard,
  useCrmCampaigns,
  useCrmSegments,
  useCreateCampaign,
  useDeleteCampaign,
  useScheduleCampaign,
  useTriggerCampaignSend,
  useCampaignSendStatus,
  useSendQuotaStatus,
  useGlobalKillSwitch,
  usePauseCampaign,
  useResumeCampaign,
  useReengagementTriggers,
  useTestSendCampaign,
  type CrmCampaign,
} from "@/modules/crm";
import { TestEmailDialog } from "@/modules/crm/components/TestEmailDialog";
import { SendScheduleDialog, type SendScheduleOptions } from "@/modules/crm/components/SendScheduleDialog";
import { CrmTabs } from "./CrmTabs";

// ── Status badge ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  running:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  paused:    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function StatusBadge({ status }: { status: string }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_STYLES[status])}>{status}</span>;
}

// ── Quota + kill switch banner ───────────────────────────────────────────────────

function SendControlBar() {
  const q = useSendQuotaStatus();
  const { isSuperAdmin } = useIsSuperAdmin();
  const kill = useGlobalKillSwitch();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Card className="flex flex-1 items-center gap-3 p-4">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/20">
          <Gauge className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Daily send quota</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {q.todaySent.toLocaleString()} / {q.quotaLimit.toLocaleString()} · day {q.warmupDay}
            </span>
          </div>
          <Progress value={q.pctUsed} className="mt-1.5 h-1.5" />
        </div>
      </Card>

      {q.globalKill && (
        <Card className="flex items-center gap-2 border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <ShieldAlert className="h-5 w-5 flex-none" />
          <span>Global kill switch is ON — all bulk sends halted.</span>
        </Card>
      )}

      {isSuperAdmin && (
        <Button
          variant={q.globalKill ? "outline" : "destructive"}
          onClick={() => kill.mutate(!q.globalKill)}
          disabled={kill.isPending}
          className="sm:self-stretch"
        >
          {kill.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
          {q.globalKill ? "Re-enable sends" : "Emergency stop"}
        </Button>
      )}
    </div>
  );
}

// ── Create dialog ────────────────────────────────────────────────────────────────

function CreateCampaign({ onClose }: { onClose: () => void }) {
  const { data: segments } = useCrmSegments();
  const create = useCreateCampaign();
  const [name, setName]         = useState("");
  const [subject, setSubject]   = useState("");
  const [segmentId, setSegmentId] = useState<string>("");

  const selected = segments?.find((s) => s.id === segmentId);

  function save() {
    if (!name.trim() || !segmentId) return;
    create.mutate(
      { name: name.trim(), subject_line: subject.trim() || null, segment_id: segmentId },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New campaign</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. June frame sale" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Subject line</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Shown in the inbox" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Audience segment</label>
            <Select value={segmentId} onValueChange={setSegmentId}>
              <SelectTrigger><SelectValue placeholder="Select a segment" /></SelectTrigger>
              <SelectContent>
                {segments?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.member_count.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                ≈ {selected.member_count.toLocaleString()} contacts (cached count; live count shown before send)
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!name.trim() || !segmentId || create.isPending}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Campaign row ─────────────────────────────────────────────────────────────────

function CampaignRow({ campaign, onDelete }: { campaign: CrmCampaign; onDelete: (c: CrmCampaign) => void }) {
  const status    = useCampaignSendStatus(campaign.id);
  const schedule  = useScheduleCampaign();
  const trigger   = useTriggerCampaignSend();
  const pause     = usePauseCampaign();
  const resume    = useResumeCampaign();
  const testSend  = useTestSendCampaign();

  const [showTestEmail, setShowTestEmail] = useState(false);
  const [showSendSchedule, setShowSendSchedule] = useState(false);

  const isRunning = campaign.status === "running";
  const isDraft   = campaign.status === "draft";
  const isPaused  = campaign.status === "paused";
  const busy = schedule.isPending || trigger.isPending || pause.isPending || resume.isPending || testSend.isPending;

  const handleTestEmailSubmit = (testEmail: string, options: SendScheduleOptions) => {
    testSend.mutate({
      campaignId: campaign.id,
      testEmail,
      sendNow: options.sendNow,
      scheduledAt: options.scheduledAt,
    });
    setShowTestEmail(false);
  };

  const handleSendScheduleSubmit = (options: SendScheduleOptions) => {
    trigger.mutate({
      campaignId: campaign.id,
      sendNow: options.sendNow,
      scheduledAt: options.scheduledAt,
    });
    setShowSendSchedule(false);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{campaign.name}</h3>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {campaign.subject_line || "No subject"} · {campaign.segment_name || "no segment"}
            </p>
          </div>

          <div className="flex flex-none gap-2">
            {isDraft && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTestEmail(true)}
                  disabled={busy}
                  title="Send a test copy before sending to all recipients"
                >
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> Test
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowSendSchedule(true)}
                  disabled={busy}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Send
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(campaign)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </>
            )}
            {isRunning && (
              <Button variant="outline" size="sm" onClick={() => pause.mutate(campaign.id)} disabled={busy}>
                <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
              </Button>
            )}
            {isPaused && (
              <Button size="sm" onClick={() => { resume.mutate(campaign.id); trigger.mutate({ campaignId: campaign.id, sendNow: true }); }} disabled={busy}>
                <Play className="mr-1.5 h-3.5 w-3.5" /> Resume
              </Button>
            )}
          </div>
        </div>

        {/* Live progress while running/paused */}
        {(isRunning || isPaused || campaign.status === "completed") && status.totalRecipients > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{status.sentCount.toLocaleString()} / {status.totalRecipients.toLocaleString()} sent</span>
              <span>{status.percentDone}%</span>
            </div>
            <Progress value={status.percentDone} className="mt-1 h-1.5" />
            {status.errorMessage && (
              <p className="mt-1 text-xs text-destructive">{status.errorMessage}</p>
            )}
          </div>
        )}
      </Card>

      {/* Test Email Dialog */}
      <TestEmailDialog
        campaignId={campaign.id}
        campaignName={campaign.name}
        isOpen={showTestEmail}
        onClose={() => setShowTestEmail(false)}
        onSubmit={handleTestEmailSubmit}
        isPending={testSend.isPending}
      />

      {/* Send Schedule Dialog */}
      <SendScheduleDialog
        title="When to send campaign?"
        description={`Send "${campaign.name}" to ${campaign.segment_name || "segment"} now or schedule for later`}
        isOpen={showSendSchedule}
        onClose={() => setShowSendSchedule(false)}
        onSubmit={handleSendScheduleSubmit}
        isPending={trigger.isPending}
      />
    </>
  );
}

// ── Re-engagement triggers ───────────────────────────────────────────────────────

function TriggersSection() {
  const { data: triggers, isLoading } = useReengagementTriggers();
  if (isLoading) return <Skeleton className="h-40" />;
  if (!triggers?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <h2 className="font-semibold">Re-engagement triggers</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {triggers.map((t) => <TriggerCard key={t.id} trigger={t} />)}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────────

const CrmCampaigns = () => {
  const { data: campaigns, isLoading } = useCrmCampaigns();
  const del = useDeleteCampaign();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CrmCampaign | null>(null);

  return (
    <RoleGuard allowedRoles={["super_admin", "admin", "branch_manager"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">CRM Campaigns</h1>
              <p className="text-muted-foreground">Create, schedule, and send email campaigns to your segments.</p>
            </div>
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </div>

          <CrmTabs />

          <CrmAccessGate>
            <div className="space-y-6">
              <SendControlBar />

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.map((c) => <CampaignRow key={c.id} campaign={c} onDelete={setDeleting} />)}
                </div>
              ) : (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                  <Megaphone className="mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="font-medium">No campaigns yet</p>
                  <p className="mb-4 text-sm text-muted-foreground">Build a segment first, then create a campaign to reach it.</p>
                  <Button onClick={() => setCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Campaign
                  </Button>
                </Card>
              )}

              <TriggersSection />
            </div>
          </CrmAccessGate>
        </div>

        {creating && <CreateCampaign onClose={() => setCreating(false)} />}

        <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                Only draft campaigns can be deleted. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { if (deleting) del.mutate(deleting.id, { onSuccess: () => setDeleting(null) }); }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </RoleGuard>
  );
};

export default CrmCampaigns;
