import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTriggerCampaignSend } from '../hooks/useCampaignSend';
import { useTestSendCampaign } from '../hooks/useCrmCampaigns';
import type { CrmCampaign } from '../hooks/useCrmCampaigns';

type ActionType = 'send' | 'test' | null;

interface CampaignActionDialogProps {
  campaign: CrmCampaign | null;
  action: ActionType;
  onClose: () => void;
}

export function CampaignActionDialog({ campaign, action, onClose }: CampaignActionDialogProps) {
  const trigger = useTriggerCampaignSend();
  const testSend = useTestSendCampaign();

  const [testEmail, setTestEmail] = useState('');
  const [mode, setMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Reset form whenever the dialog opens for a new action/campaign
  useEffect(() => {
    if (action) {
      setTestEmail('');
      setMode('now');
      setScheduledDate('');
      setScheduledTime('');
    }
  }, [action, campaign?.id]);

  if (!campaign || !action) return null;

  const busy = trigger.isPending || testSend.isPending;
  const isTest = action === 'test';

  const today = new Date().toISOString().split('T')[0];
  const minTime = new Date(new Date().getTime() + 15 * 60000).toTimeString().slice(0, 5);

  const buildScheduledAt = () => {
    if (mode !== 'scheduled') return undefined;
    return new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
  };

  const validate = () => {
    if (isTest) {
      if (!testEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
        alert('Please enter a valid email address');
        return false;
      }
    }
    if (mode === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      alert('Please select both a date and a time');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isTest) {
      testSend.mutate(
        {
          campaignId: campaign.id,
          testEmail: testEmail.trim(),
          sendNow: mode === 'now',
          scheduledAt: buildScheduledAt(),
        },
        { onSuccess: onClose },
      );
    } else {
      trigger.mutate(
        {
          campaignId: campaign.id,
          sendNow: mode === 'now',
          scheduledAt: buildScheduledAt(),
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Dialog open={!!action} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isTest ? 'Send Test Email' : 'Send Campaign'}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isTest
              ? `Test "${campaign.name}" before sending to your segment`
              : `Send "${campaign.name}" to ${campaign.segment_name || 'segment'}`}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isTest ? (
            <div>
              <label className="block text-sm font-medium mb-1">Test email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={busy}
              />
            </div>
          ) : (
            <Card className="p-3 bg-muted">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Segment:</span>
                  <span className="font-medium">{campaign.segment_name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="font-medium">{campaign.subject_line || 'No subject'}</span>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-3 pt-4 border-t">
            <label className="block text-sm font-medium">When to send?</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="action-now"
                  value="now"
                  checked={mode === 'now'}
                  onChange={() => setMode('now')}
                  disabled={busy}
                  className="mr-2"
                />
                <label htmlFor="action-now" className="cursor-pointer">Send immediately</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="action-scheduled"
                  value="scheduled"
                  checked={mode === 'scheduled'}
                  onChange={() => setMode('scheduled')}
                  disabled={busy}
                  className="mr-2"
                />
                <label htmlFor="action-scheduled" className="cursor-pointer">Schedule for later</label>
              </div>
            </div>

            {mode === 'scheduled' && (
              <div className="space-y-2 p-3 bg-muted rounded-lg mt-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Date</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={today}
                    disabled={busy}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Time</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={scheduledDate === today ? minTime : undefined}
                    disabled={busy}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={busy || (isTest && !testEmail.trim())}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'now'
              ? isTest ? 'Send test now' : 'Send campaign now'
              : isTest ? 'Schedule test' : 'Schedule campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
