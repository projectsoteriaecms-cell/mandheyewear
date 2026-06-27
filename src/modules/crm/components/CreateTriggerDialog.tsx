import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TriggerType } from '../hooks/useReengagementTriggers';

const TRIGGER_TYPES: { value: TriggerType; label: string; hint: string }[] = [
  {
    value: 'inactive_days',
    label: 'Inactive customers',
    hint: 'Customers who haven\'t visited or purchased in X days',
  },
  {
    value: 'no_purchase_days',
    label: 'No purchase',
    hint: 'Contacts who have never made a purchase after X days',
  },
  {
    value: 'vto_no_convert_days',
    label: 'VTO non-converter',
    hint: 'Contacts who had a VTO but didn\'t convert after X days',
  },
  {
    value: 'newsletter_no_engage_days',
    label: 'Newsletter non-engager',
    hint: 'Subscribers who haven\'t opened an email in X days',
  },
];

interface CreateTriggerDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTriggerDialog({ open, onClose }: CreateTriggerDialogProps) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('inactive_days');
  const [thresholdDays, setThresholdDays] = useState('30');
  const [templateSubject, setTemplateSubject] = useState('');

  const selectedType = TRIGGER_TYPES.find((t) => t.value === triggerType);

  const create = useMutation({
    mutationFn: async () => {
      const days = parseInt(thresholdDays, 10);
      if (!days || days < 1 || days > 365) throw new Error('Threshold must be between 1 and 365 days');
      const { error } = await supabase
        .from('crm_reengagement_triggers')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          trigger_type: triggerType,
          threshold_days: days,
          template_subject: templateSubject.trim() || null,
          is_active: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Trigger created. Enable it from the toggle when ready.');
      qc.invalidateQueries({ queryKey: ['crm_reengagement_triggers'] });
      handleClose();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to create trigger'),
  });

  function reset() {
    setName('');
    setDescription('');
    setTriggerType('inactive_days');
    setThresholdDays('30');
    setTemplateSubject('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  const canSubmit = name.trim() && thresholdDays && !create.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" /> New Trigger
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Triggers automatically create and send campaigns when a contact meets your criteria.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Trigger Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 90-day win-back"
              disabled={create.isPending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Trigger Type <span className="text-destructive">*</span>
            </label>
            <Select
              value={triggerType}
              onValueChange={(v) => setTriggerType(v as TriggerType)}
              disabled={create.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="mt-1 text-xs text-muted-foreground">{selectedType.hint}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Threshold Days <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="365"
                value={thresholdDays}
                onChange={(e) => setThresholdDays(e.target.value)}
                className="w-28"
                disabled={create.isPending}
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Contacts matching the criteria after this many days are included in the campaign.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email Subject</label>
            <Input
              value={templateSubject}
              onChange={(e) => setTemplateSubject(e.target.value)}
              placeholder="e.g. We miss you at M&H Eyewear!"
              disabled={create.isPending}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — describe what this trigger does…"
              rows={2}
              disabled={create.isPending}
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
            Triggers are created <strong>inactive</strong>. Use the toggle on the trigger card to enable it when you're ready.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button onClick={() => create.mutate()} disabled={!canSubmit}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Trigger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
