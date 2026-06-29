import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Loader2 } from 'lucide-react';
import {
  useWhatsAppChannel,
  useUpdateWhatsAppChannel,
  useTriggerWhatsAppSend,
  useWhatsAppTemplates,
  type CrmCampaign,
} from '@/modules/crm';

interface CampaignWhatsAppSectionProps {
  campaign: CrmCampaign;
}

export function CampaignWhatsAppSection({ campaign }: CampaignWhatsAppSectionProps) {
  const channel = useWhatsAppChannel(campaign.id);
  const updateChannel = useUpdateWhatsAppChannel();
  const triggerSend = useTriggerWhatsAppSend();
  const templates = useWhatsAppTemplates();

  const isDraft = campaign.status === 'draft';
  const isBusy = updateChannel.isPending || triggerSend.isPending;

  const handleToggle = async (enabled: boolean) => {
    updateChannel.mutate({ campaignId: campaign.id, enabled });
  };

  const handleSend = async () => {
    triggerSend.mutate(campaign.id);
  };

  return (
    <Card className="p-4 bg-muted/50">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">WhatsApp Channel</h3>
          {!isDraft && channel.data?.enabled && (
            <Badge variant="default" className="ml-auto">
              Enabled
            </Badge>
          )}
        </div>

        {channel.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Enable Toggle */}
            {isDraft && (
              <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Enable WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Send via WhatsApp alongside Email</p>
                </div>
                <Button
                  size="sm"
                  variant={channel.data?.enabled ? 'default' : 'outline'}
                  onClick={() => handleToggle(!channel.data?.enabled)}
                  disabled={isBusy}
                >
                  {channel.data?.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            )}

            {/* Template Info */}
            {channel.data?.enabled && (
              <>
                <div className="p-3 bg-background border rounded-lg space-y-2">
                  <p className="text-sm font-medium">Template Selected</p>
                  {templates.isLoading ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    <>
                      {channel.data?.contentSid ? (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-mono text-xs">{channel.data.contentSid}</span>
                          <span className="ml-2">
                            (${channel.data.cost_per_message?.toFixed(4) ?? '0.0039'} per message)
                          </span>
                        </p>
                      ) : (
                        <>
                          {templates.data && templates.data.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Select a template:</p>
                              <select
                                value=""
                                onChange={(e) => {
                                  const selectedTemplate = templates.data?.find(t => t.id === e.target.value);
                                  if (selectedTemplate) {
                                    updateChannel.mutate({
                                      campaignId: campaign.id,
                                      contentSid: selectedTemplate.twilio_content_sid,
                                    });
                                  }
                                }}
                                className="w-full rounded border px-2 py-1 text-sm"
                              >
                                <option value="">Choose a template...</option>
                                {templates.data
                                  ?.filter(t => t.approval_state === 'approved')
                                  .map(t => (
                                    <option key={t.id} value={t.id}>
                                      {t.name} (${t.cost_per_message.toFixed(4)})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No approved templates available. Create one in WhatsApp Templates.</p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Send Status */}
                {campaign.status !== 'draft' && (
                  <div className="p-3 bg-background border rounded-lg space-y-2">
                    <p className="text-sm font-medium">Send Status</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="text-lg font-bold">{channel.data?.sentCount ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-lg font-bold text-destructive">{channel.data?.failedCount ?? 0}</p>
                      </div>
                      {channel.data?.completedAt && (
                        <div className="ml-auto">
                          <Badge variant="default">Completed</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Send Button */}
                {isDraft && (
                  <Button
                    onClick={handleSend}
                    disabled={isBusy || !channel.data?.contentSid}
                    className="w-full"
                  >
                    {triggerSend.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send via WhatsApp
                  </Button>
                )}
              </>
            )}

            {/* Cost Info */}
            {channel.data?.enabled && (
              <p className="text-xs text-muted-foreground text-center">
                💰 Using templates saves ~50% vs plain text messaging
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
