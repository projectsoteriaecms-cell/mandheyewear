import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  TestTube2,
  CheckCircle2,
  XCircle,
  Users,
  SplitSquareHorizontal,
  FlaskConical,
  Layers,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RoleGuard } from '@/modules/auth/components/RoleGuard';
import {
  useGetCampaign,
  useUpdateCampaign,
  useCrmSegments,
  useTestSendCampaign,
  useTriggerCampaignSend,
  EmailBlockEditor,
  EmailPreviewFrame,
  TokenPicker,
  type EmailBlock,
  blocksToHtml,
} from '@/modules/crm';
import { CampaignActionDialog } from '@/modules/crm';
import type { CrmCampaign } from '@/modules/crm';
import { toast } from 'sonner';

// ── Checklist ─────────────────────────────────────────────────────────────────

function useSendChecklist(
  name: string,
  subject: string,
  segmentId: string,
  blocks: EmailBlock[],
  abEnabled: boolean,
  subjectB: string,
) {
  return [
    { label: 'Campaign name',   passed: name.trim().length > 0,            hint: 'Give your campaign a name' },
    { label: 'Subject line',    passed: subject.trim().length > 0,          hint: 'Subject line is required' },
    { label: 'Recipients',      passed: !!segmentId,                        hint: 'Select a recipient segment' },
    { label: 'Email content',   passed: blocks.length > 0,                  hint: 'Add at least one content block' },
    ...(abEnabled
      ? [{ label: 'A/B subject variant', passed: subjectB.trim().length > 0, hint: 'Enter subject line B for A/B test' }]
      : []),
  ];
}

// ── Review tab ────────────────────────────────────────────────────────────────

function ReviewTab({
  checklist,
  segment,
  onTest,
  onSend,
  isBusy,
}: {
  checklist: ReturnType<typeof useSendChecklist>;
  segment: { name: string; member_count: number } | undefined;
  onTest: () => void;
  onSend: () => void;
  isBusy: boolean;
}) {
  const allPassed = checklist.every((c) => c.passed);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold mb-3">Send Readiness</p>
        <div className="rounded-lg border divide-y">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3">
              {item.passed
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                : <XCircle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', !item.passed && 'text-muted-foreground')}>
                  {item.label}
                </p>
                {!item.passed && <p className="text-xs text-muted-foreground">{item.hint}</p>}
              </div>
              {item.passed && (
                <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20">
                  Done
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {segment && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Ready to reach</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {segment.member_count.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">contacts in "{segment.name}"</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={onTest}
          disabled={isBusy || !checklist[1]?.passed}
          className="w-full justify-start"
        >
          <TestTube2 className="mr-2 h-4 w-4" />
          Send Test Email
        </Button>
        <Button
          onClick={onSend}
          disabled={!allPassed || isBusy}
          className="w-full justify-start"
          size="lg"
        >
          <Send className="mr-2 h-4 w-4" />
          Send / Schedule Campaign
        </Button>
        {!allPassed && (
          <p className="text-xs text-muted-foreground text-center">
            Complete all required fields to enable sending
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main CampaignBuilder ──────────────────────────────────────────────────────

export default function CampaignBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading, error } = useGetCampaign(id ?? null);
  const { data: segments } = useCrmSegments();
  const update = useUpdateCampaign();

  // Local state mirrors the campaign
  const [name, setName]             = useState('');
  const [subject, setSubject]       = useState('');
  const [subjectB, setSubjectB]     = useState('');
  const [abEnabled, setAbEnabled]   = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [segmentId, setSegmentId]   = useState('');
  const [templateId, setTemplateId] = useState('');
  const [blocks, setBlocks]         = useState<EmailBlock[]>([]);
  const [isDirty, setIsDirty]       = useState(false);
  const [actionType, setActionType] = useState<'send' | 'test' | null>(null);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);

  // Populate from fetched campaign
  useEffect(() => {
    if (campaign) {
      setName(campaign.name ?? '');
      setSubject(campaign.subject_line ?? '');
      setSubjectB(campaign.subject_line_b ?? '');
      setAbEnabled(campaign.ab_enabled ?? false);
      setPreviewText(campaign.preview_text ?? '');
      setSegmentId(campaign.segment_id ?? '');
      setTemplateId(campaign.template_id ?? '');
      setBlocks(campaign.body_blocks ?? []);
      setIsDirty(false);
    }
  }, [campaign]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const selectedSegment = segments?.find((s) => s.id === segmentId);

  const checklist = useSendChecklist(name, subject, segmentId, blocks, abEnabled, subjectB);
  const allPassed = checklist.every((c) => c.passed);

  function buildPayload() {
    const html = blocksToHtml(blocks, { subject, previewText });
    return {
      id: campaign!.id,
      name: name.trim(),
      subject_line: subject.trim() || null,
      subject_line_b: abEnabled ? (subjectB.trim() || null) : null,
      ab_enabled: abEnabled,
      preview_text: previewText.trim() || null,
      template_id: templateId || null,
      segment_id: segmentId || campaign!.segment_id!,
      body_blocks: blocks,
      body_html: html,
    };
  }

  function handleSave(andThen?: () => void) {
    update.mutate(buildPayload(), {
      onSuccess: () => {
        setIsDirty(false);
        andThen?.();
      },
    });
  }

  function handleBack() {
    if (isDirty) { setShowLeaveAlert(true); return; }
    navigate('/admin/crm/campaigns');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Button variant="outline" onClick={() => navigate('/admin/crm/campaigns')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Button>
      </div>
    );
  }

  if (campaign.status !== 'draft') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Only draft campaigns can be edited.</p>
        <Button variant="outline" onClick={() => navigate('/admin/crm/campaigns')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin', 'branch_manager']}>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={handleBack} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Campaigns
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex-1 min-w-0">
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); markDirty(); }}
              className="h-8 text-base font-semibold border-transparent bg-transparent px-2 hover:bg-muted focus:bg-background focus:border-input max-w-sm"
              placeholder="Campaign name..."
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className="capitalize">{campaign.status}</Badge>
            {isDirty && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-xs">
                Unsaved
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave()}
              disabled={!isDirty || update.isPending}
            >
              {update.isPending
                ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                : <Save className="mr-1.5 h-3.5 w-3.5" />
              }
              Save
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(() => setActionType('send'))}
              disabled={!allPassed || update.isPending}
              title={!allPassed ? 'Complete all required fields first' : undefined}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </header>

        {/* Split pane body */}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* Left panel — settings */}
            <Panel defaultSize={38} minSize={30} maxSize={50}>
              <div className="h-full overflow-y-auto">
                <Tabs defaultValue="setup" className="h-full flex flex-col">
                  <TabsList className="w-full rounded-none border-b bg-background justify-start px-4 h-auto py-0 flex-shrink-0">
                    {[
                      { value: 'setup',      label: 'Setup',      icon: FlaskConical },
                      { value: 'recipients', label: 'Recipients', icon: Users },
                      { value: 'content',    label: 'Content',    icon: Layers },
                      { value: 'review',     label: 'Review',     icon: CheckCircle2 },
                    ].map(({ value, label, icon: Icon }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-1.5 py-3 text-xs"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Setup tab */}
                  <TabsContent value="setup" className="flex-1 overflow-y-auto p-4 space-y-5 mt-0">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Subject Line <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            value={subject}
                            onChange={(e) => { setSubject(e.target.value); markDirty(); }}
                            placeholder="e.g. ✨ 20% off all frames this weekend"
                            className="pr-14"
                          />
                          <span className={cn(
                            'absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums',
                            subject.length > 60 ? 'text-amber-500' : 'text-muted-foreground',
                          )}>
                            {subject.length}/90
                          </span>
                        </div>
                        {subject.length > 60 && (
                          <p className="text-xs text-amber-600 mt-1">May be clipped on mobile — aim for under 60 chars</p>
                        )}
                        <div className="mt-1.5">
                          <TokenPicker onInsert={(t) => { setSubject((s) => s + t); markDirty(); }} />
                        </div>
                      </div>

                      {/* A/B Testing */}
                      <div className="rounded-lg border p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <SplitSquareHorizontal className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">A/B Subject Test</p>
                              <p className="text-xs text-muted-foreground">Split 50/50 · pick winner after 4hrs</p>
                            </div>
                          </div>
                          <Switch
                            checked={abEnabled}
                            onCheckedChange={(v) => { setAbEnabled(v); markDirty(); }}
                          />
                        </div>
                        {abEnabled && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                              Subject B <span className="text-destructive">*</span>
                            </label>
                            <Input
                              value={subjectB}
                              onChange={(e) => { setSubjectB(e.target.value); markDirty(); }}
                              placeholder="e.g. 🕶️ New arrivals — shop before they sell out"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Half your list gets A, half gets B
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Preview Text
                        </label>
                        <Input
                          value={previewText}
                          onChange={(e) => { setPreviewText(e.target.value); markDirty(); }}
                          placeholder="e.g. Shop the sale — limited time offer..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Shown after the subject line in most email clients. Boost open rates with a compelling hook.
                        </p>
                        <div className="mt-1.5">
                          <TokenPicker onInsert={(t) => { setPreviewText((s) => s + t); markDirty(); }} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Template Style
                        </label>
                        <Select
                          value={templateId}
                          onValueChange={(v) => { setTemplateId(v); markDirty(); }}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Choose a template…" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: 'welcome',     label: 'Welcome Email' },
                              { value: 'promotion',   label: 'Promotional' },
                              { value: 'appointment', label: 'Appointment' },
                              { value: 'campaign',    label: 'General Campaign' },
                            ].map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Recipients tab */}
                  <TabsContent value="recipients" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Recipient Segment <span className="text-destructive">*</span>
                      </label>
                      <Select value={segmentId} onValueChange={(v) => { setSegmentId(v); markDirty(); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose who receives this…" />
                        </SelectTrigger>
                        <SelectContent>
                          {(segments ?? []).map((seg) => (
                            <SelectItem key={seg.id} value={seg.id}>
                              <span className="font-medium">{seg.name}</span>
                              {seg.member_count > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  · {seg.member_count.toLocaleString()} contacts
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedSegment && (
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Estimated Reach</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                          {selectedSegment.member_count.toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          contacts in "{selectedSegment.name}"
                        </p>
                        {selectedSegment.description && (
                          <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 border-t border-blue-100 dark:border-blue-700 pt-2">
                            {selectedSegment.description}
                          </p>
                        )}
                      </div>
                    )}

                    {abEnabled && selectedSegment && (
                      <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <SplitSquareHorizontal className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium">A/B Split</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="rounded bg-muted p-3">
                            <p className="text-xs text-muted-foreground">Subject A</p>
                            <p className="text-lg font-bold mt-1">
                              {Math.floor(selectedSegment.member_count / 2).toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded bg-muted p-3">
                            <p className="text-xs text-muted-foreground">Subject B</p>
                            <p className="text-lg font-bold mt-1">
                              {Math.ceil(selectedSegment.member_count / 2).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Winner is picked automatically after 4 hours based on open rate</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Content tab */}
                  <TabsContent value="content" className="flex-1 overflow-y-auto p-4 mt-0">
                    <EmailBlockEditor
                      blocks={blocks}
                      onChange={(b) => { setBlocks(b); markDirty(); }}
                    />
                  </TabsContent>

                  {/* Review tab */}
                  <TabsContent value="review" className="flex-1 overflow-y-auto p-4 mt-0">
                    <ReviewTab
                      checklist={checklist}
                      segment={selectedSegment}
                      onTest={() => handleSave(() => setActionType('test'))}
                      onSend={() => handleSave(() => setActionType('send'))}
                      isBusy={update.isPending}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </Panel>

            {/* Resize handle */}
            <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/30 transition-colors cursor-col-resize flex items-center justify-center">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </PanelResizeHandle>

            {/* Right panel — live preview */}
            <Panel defaultSize={62} minSize={40}>
              <div className="h-full flex flex-col overflow-hidden">
                <EmailPreviewFrame
                  blocks={blocks}
                  subject={subject}
                  previewText={previewText}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {/* Send / Test dialog */}
      <CampaignActionDialog
        campaign={campaign}
        action={actionType}
        onClose={() => setActionType(null)}
      />

      {/* Leave without saving alert */}
      <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. They will be lost if you leave now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/admin/crm/campaigns')}>
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoleGuard>
  );
}
