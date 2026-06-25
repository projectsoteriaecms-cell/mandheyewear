import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle2, XCircle, Users, Mail, FileText, Send, TestTube2, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useUpdateCampaign, useCrmSegments } from '@/modules/crm';
import type { CrmCampaign } from '@/modules/crm';

const TEMPLATE_OPTIONS = [
  { value: 'welcome',     label: 'Welcome Email',       desc: 'New customer onboarding' },
  { value: 'promotion',   label: 'Promotional',         desc: 'Sale, discount, or offer' },
  { value: 'appointment', label: 'Appointment',         desc: 'Booking confirmation or reminder' },
  { value: 'campaign',    label: 'General Campaign',    desc: 'Custom marketing message' },
];

interface CampaignEditDialogProps {
  campaign: CrmCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSendClick?: () => void;
  onTestClick?: () => void;
}

interface ChecklistItem {
  label: string;
  passed: boolean;
  hint: string;
}

export function CampaignEditDialog({
  campaign,
  isOpen,
  onClose,
  onSendClick,
  onTestClick,
}: CampaignEditDialogProps) {
  const { data: segments } = useCrmSegments();
  const update = useUpdateCampaign();

  const [name, setName]             = useState('');
  const [subject, setSubject]       = useState('');
  const [previewText, setPreviewText] = useState('');
  const [segmentId, setSegmentId]   = useState('');
  const [templateId, setTemplateId] = useState('');
  const [isDirty, setIsDirty]       = useState(false);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name ?? '');
      setSubject(campaign.subject_line ?? '');
      setPreviewText(campaign.preview_text ?? '');
      setSegmentId(campaign.segment_id ?? '');
      setTemplateId(campaign.template_id ?? '');
      setIsDirty(false);
    }
  }, [campaign]);

  if (!campaign) return null;

  const selectedSegment = segments?.find((s) => s.id === segmentId);

  const checklist: ChecklistItem[] = [
    { label: 'Campaign name',   passed: name.trim().length > 0,    hint: 'Give your campaign a descriptive name' },
    { label: 'Subject line',    passed: subject.trim().length > 0,  hint: 'Subject line is what recipients see first' },
    { label: 'Recipients',      passed: !!segmentId,                hint: 'Choose which segment receives this campaign' },
    { label: 'Email template',  passed: !!templateId,               hint: 'Select a template to use for the email body' },
  ];

  const readyToSend = checklist.every((c) => c.passed);

  function markDirty() {
    if (!isDirty) setIsDirty(true);
  }

  function handleSave(andThen?: () => void) {
    update.mutate(
      {
        id: campaign!.id,
        name: name.trim(),
        subject_line: subject.trim() || null,
        preview_text: previewText.trim() || null,
        segment_id: segmentId || undefined,
        template_id: templateId || null,
      },
      {
        onSuccess: () => {
          setIsDirty(false);
          andThen?.();
        },
      },
    );
  }

  function handleSendClick() {
    handleSave(onSendClick);
  }

  function handleTestClick() {
    handleSave(onTestClick);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                Edit Campaign
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Only draft campaigns can be edited. Changes save to draft.
              </p>
            </div>
            {isDirty && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
                Unsaved changes
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Section 1: Campaign Setup */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email Setup
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Campaign Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); markDirty(); }}
                  placeholder="e.g. June Summer Frame Sale"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Subject Line <span className="text-destructive">*</span>
                </label>
                <Input
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); markDirty(); }}
                  placeholder="e.g. ✨ 20% off all frames this weekend only"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {subject.length}/90 · {subject.length > 60 ? '⚠️ May be clipped on mobile' : subject.length > 0 ? '✓ Good length' : 'Shown as the email title in the inbox'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Preview Text
                </label>
                <Input
                  value={previewText}
                  onChange={(e) => { setPreviewText(e.target.value); markDirty(); }}
                  placeholder="e.g. Shop the latest designer frames and save big..."
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Shown after the subject line in most email clients — use it to boost open rates
                </p>
              </div>
            </div>
          </section>

          <div className="border-t" />

          {/* Section 2: Recipients */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Recipients
            </h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Segment <span className="text-destructive">*</span>
              </label>
              <Select
                value={segmentId}
                onValueChange={(v) => { setSegmentId(v); markDirty(); }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Choose a segment…" />
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
              {selectedSegment && (
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    <strong>{selectedSegment.member_count.toLocaleString()}</strong> contacts will receive this campaign
                  </span>
                  {selectedSegment.description && (
                    <span className="text-muted-foreground">· {selectedSegment.description}</span>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="border-t" />

          {/* Section 3: Template */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Email Template
            </h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Template Type
              </label>
              <Select
                value={templateId}
                onValueChange={(v) => { setTemplateId(v); markDirty(); }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Choose a template…" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <span className="font-medium">{t.label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{t.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templateId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Template: <span className="font-mono">{templateId}</span> · You can test this in the Templates tab
                </p>
              )}
            </div>
          </section>

          <div className="border-t" />

          {/* Section 4: Send Readiness Checklist */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Send Readiness</h3>
            <div className="rounded-lg border bg-muted/30 divide-y">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    item.passed ? 'opacity-100' : 'opacity-80',
                  )}
                >
                  {item.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', item.passed ? 'text-foreground' : 'text-muted-foreground')}>
                      {item.label}
                    </p>
                    {!item.passed && (
                      <p className="text-xs text-muted-foreground">{item.hint}</p>
                    )}
                  </div>
                  {item.passed && (
                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                      Done
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {readyToSend ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Campaign is ready to send!
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Complete all required fields above to enable sending.
              </p>
            )}
          </section>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 bg-muted/20">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="mr-auto"
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={!isDirty || update.isPending}
            >
              {update.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Save Draft
            </Button>

            {onTestClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestClick}
                disabled={!subject.trim() || update.isPending}
              >
                <TestTube2 className="mr-1.5 h-3.5 w-3.5" />
                Test Email
              </Button>
            )}

            {onSendClick && (
              <Button
                size="sm"
                onClick={handleSendClick}
                disabled={!readyToSend || update.isPending}
                title={!readyToSend ? 'Complete all required fields first' : undefined}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Send Campaign
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
