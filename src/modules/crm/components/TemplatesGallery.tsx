import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight } from 'lucide-react';
import { useCreateCampaign, useUpdateCampaign, useCrmSegments, blocksToHtml } from '@/modules/crm';
import type { EmailBlock } from '@/modules/crm';

interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'promotion' | 'retention' | 'newsletter' | 'engagement';
  suggestedSubject: string;
  blocks: EmailBlock[];
}

const CATEGORY_COLORS: Record<StarterTemplate['category'], string> = {
  promotion:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  retention:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  newsletter:  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  engagement:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'frame-promotion',
    name: 'Frame Promotion',
    description: 'Announce a sale or discount on your eyewear collection with a bold hero and clear call-to-action.',
    category: 'promotion',
    suggestedSubject: '🕶️ Exclusive offer on premium frames — limited time!',
    blocks: [
      {
        id: 'h1',
        type: 'hero',
        data: {
          title: 'Exclusive Frame Sale',
          subtitle: 'Up to 30% off premium designer eyewear — this week only',
          bg_color: '#0F1B2E',
        },
      },
      {
        id: 't1',
        type: 'text',
        data: {
          content:
            'Hi {{first_name}},\n\nWe are excited to bring you an exclusive offer on our latest collection of designer frames. Whether you\'re looking for everyday classics or bold statement pieces, we have something for every style.\n\nThis offer is available for a limited time only.',
        },
      },
      {
        id: 'b1',
        type: 'button',
        data: {
          text: 'Shop the Sale',
          url: 'https://mandheyewear.com/shop',
          bg_color: '#D4AF37',
          align: 'center',
        },
      },
      {
        id: 'd1',
        type: 'divider',
        data: { color: '#e5e7eb' },
      },
      {
        id: 't2',
        type: 'text',
        data: {
          content:
            'Questions? Reply to this email or visit us in-store. Our team is here to help you find the perfect pair.\n\n— The {{store_name}} Team',
        },
      },
    ],
  },
  {
    id: 'eye-check-reminder',
    name: 'Eye Check Reminder',
    description: 'Remind customers who haven\'t had an eye test recently to book their annual check-up.',
    category: 'retention',
    suggestedSubject: '👁️ Time for your annual eye check, {{first_name}}?',
    blocks: [
      {
        id: 'h1',
        type: 'hero',
        data: {
          title: 'Your Vision Matters',
          subtitle: 'Annual eye checks keep your prescription current and your eyes healthy',
          bg_color: '#1e3a5f',
        },
      },
      {
        id: 't1',
        type: 'text',
        data: {
          content:
            'Hi {{first_name}},\n\nExperts recommend an eye test at least once a year — even if your vision feels fine. Many conditions are easier to treat when caught early.\n\nAt {{store_name}} we offer comprehensive eye examinations with our experienced optometrists, using the latest diagnostic equipment.',
        },
      },
      {
        id: 'c1',
        type: 'columns2',
        data: {
          left: '✅ Comprehensive eye health check\n✅ Updated prescription if needed\n✅ Glaucoma screening',
          right: '✅ Macular degeneration screening\n✅ Digital eye strain assessment\n✅ Children\'s vision testing',
        },
      },
      {
        id: 'b1',
        type: 'button',
        data: {
          text: 'Book Your Eye Test',
          url: 'https://mandheyewear.com/book',
          bg_color: '#2563eb',
          align: 'center',
        },
      },
    ],
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals Newsletter',
    description: 'Announce fresh stock and highlight what\'s new in your collection with a two-column showcase.',
    category: 'newsletter',
    suggestedSubject: '✨ New arrivals at {{store_name}} — see what\'s just landed',
    blocks: [
      {
        id: 'h1',
        type: 'hero',
        data: {
          title: 'New Arrivals',
          subtitle: 'Fresh styles just landed in store and online',
          bg_color: '#111827',
        },
      },
      {
        id: 't1',
        type: 'text',
        data: {
          content:
            'Hi {{first_name}},\n\nWe\'ve just received an exciting new collection of frames and sunglasses. Here\'s a quick look at what\'s new:',
        },
      },
      {
        id: 'c1',
        type: 'columns2',
        data: {
          left: '**Designer Frames**\n\nThe latest from top brands — sleek silhouettes and lightweight materials for all-day comfort.',
          right: '**Sunglasses Collection**\n\nPolarised lenses with UV400 protection. From aviators to wraparounds — a style for every face.',
        },
      },
      {
        id: 'b1',
        type: 'button',
        data: {
          text: 'Explore New Arrivals',
          url: 'https://mandheyewear.com/new',
          bg_color: '#D4AF37',
          align: 'center',
        },
      },
      {
        id: 't2',
        type: 'text',
        data: {
          content:
            'New stock sells fast! Visit us in-store or online to be among the first to pick your favourites.\n\n— The {{store_name}} Team',
        },
      },
    ],
  },
  {
    id: 'vip-appreciation',
    name: 'VIP Member Appreciation',
    description: 'Thank your loyal customers with a personal message and an exclusive members-only reward.',
    category: 'engagement',
    suggestedSubject: '🌟 A special thank you, {{first_name}} — you\'re a VIP',
    blocks: [
      {
        id: 'h1',
        type: 'hero',
        data: {
          title: 'Thank You, {{first_name}}',
          subtitle: 'Your loyalty means everything to us',
          bg_color: '#3b1f6b',
        },
      },
      {
        id: 't1',
        type: 'text',
        data: {
          content:
            'Hi {{first_name}},\n\nWe just wanted to take a moment to say thank you. Your continued trust and loyalty inspire us to keep delivering the best in eye care and eyewear.\n\nAs a valued customer, we have a little something to show our appreciation:',
        },
      },
      {
        id: 'b1',
        type: 'button',
        data: {
          text: 'Claim Your VIP Reward',
          url: 'https://mandheyewear.com/vip',
          bg_color: '#D4AF37',
          align: 'center',
        },
      },
      {
        id: 'd1',
        type: 'divider',
        data: { color: '#e5e7eb' },
      },
      {
        id: 't2',
        type: 'text',
        data: {
          content:
            'Thank you again for being part of the {{store_name}} family. We look forward to serving you for many more years to come.\n\nWith gratitude,\nThe {{store_name}} Team',
        },
      },
    ],
  },
  {
    id: 'win-back',
    name: 'Win-Back Campaign',
    description: 'Re-engage customers who haven\'t visited in a while with a warm message and a compelling reason to return.',
    category: 'retention',
    suggestedSubject: '💛 We miss you, {{first_name}} — here\'s something special',
    blocks: [
      {
        id: 'h1',
        type: 'hero',
        data: {
          title: 'We Miss You, {{first_name}}',
          subtitle: 'It\'s been a while — come back and see what\'s new',
          bg_color: '#1a1a2e',
        },
      },
      {
        id: 't1',
        type: 'text',
        data: {
          content:
            'Hi {{first_name}},\n\nWe noticed it\'s been some time since your last visit and we\'d love to welcome you back.\n\nA lot has changed at {{store_name}} — new collections, new services, and the same great team committed to your eye health and style.',
        },
      },
      {
        id: 'c1',
        type: 'columns2',
        data: {
          left: '🆕 **New collection**\nFresh frames from the world\'s top designers, just arrived.',
          right: '🎁 **Welcome-back offer**\nA special discount, just for you — because you matter.',
        },
      },
      {
        id: 'b1',
        type: 'button',
        data: {
          text: 'Return to {{store_name}}',
          url: 'https://mandheyewear.com',
          bg_color: '#D4AF37',
          align: 'center',
        },
      },
    ],
  },
  {
    id: 'seasonal-sale',
    name: 'Seasonal Sale',
    description: 'Drive urgency with a time-limited seasonal promotion. Works for Christmas, New Year, Easter and more.',
    category: 'promotion',
    suggestedSubject: '⏳ Last chance — seasonal sale ends soon!',
    blocks: [
      {
        id: 'h1',
        type: 'hero',
        data: {
          title: 'Seasonal Sale',
          subtitle: 'Limited time — don\'t miss out',
          bg_color: '#7f1d1d',
        },
      },
      {
        id: 't1',
        type: 'text',
        data: {
          content:
            'Hi {{first_name}},\n\nOur seasonal sale is on now and it won\'t last long! This is the perfect time to update your look or treat someone special.\n\nEnjoy great savings across our full range of frames, sunglasses and contact lenses.',
        },
      },
      {
        id: 'c1',
        type: 'columns2',
        data: {
          left: '🕶️ **Designer Frames**\nUp to 25% off selected brands',
          right: '🌞 **Sunglasses**\nBuy 1 get 1 at 50% off',
        },
      },
      {
        id: 'b1',
        type: 'button',
        data: {
          text: 'Shop Sale Now',
          url: 'https://mandheyewear.com/sale',
          bg_color: '#dc2626',
          align: 'center',
        },
      },
      {
        id: 't2',
        type: 'text',
        data: {
          content: 'Sale ends soon — don\'t miss your chance to save.\n\n— The {{store_name}} Team',
        },
      },
    ],
  },
];

interface UseTemplateDialogProps {
  template: StarterTemplate;
  onClose: () => void;
}

function UseTemplateDialog({ template, onClose }: UseTemplateDialogProps) {
  const navigate = useNavigate();
  const { data: segments } = useCrmSegments();
  const create = useCreateCampaign();
  const update = useUpdateCampaign();

  const [name, setName] = useState(template.name);
  const [segmentId, setSegmentId] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !segmentId) return;
    setBusy(true);
    try {
      const campaign = await create.mutateAsync({
        name: name.trim(),
        subject_line: template.suggestedSubject,
        segment_id: segmentId,
      });
      const html = blocksToHtml(template.blocks as EmailBlock[], {
        subject: template.suggestedSubject,
      });
      await update.mutateAsync({
        id: campaign.id,
        body_blocks: template.blocks as EmailBlock[],
        body_html: html,
      });
      navigate(`/admin/crm/campaigns/${campaign.id}/edit`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Use "{template.name}" template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Campaign Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. June Frame Promotion"
              disabled={busy}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Recipients (Segment) <span className="text-destructive">*</span>
            </label>
            <Select value={segmentId} onValueChange={setSegmentId} disabled={busy}>
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
                {(segments ?? []).length === 0 && (
                  <SelectItem value="__none__" disabled>
                    No segments yet — create one in the Segments tab
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            The template content will be pre-loaded in the campaign builder so you can customise it before sending.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !segmentId || busy}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Draft <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TemplatesGallery() {
  const [selectedTemplate, setSelectedTemplate] = useState<StarterTemplate | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Start from a pre-built M&amp;H Eyewear template. Pick one below, choose your segment, and the campaign builder opens with all the blocks ready to customise.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STARTER_TEMPLATES.map((tpl) => (
          <Card
            key={tpl.id}
            className="flex flex-col p-5 transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight">{tpl.name}</h3>
              <Badge
                className={`whitespace-nowrap text-xs capitalize ${CATEGORY_COLORS[tpl.category]}`}
              >
                {tpl.category}
              </Badge>
            </div>
            <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
              {tpl.description}
            </p>
            <div className="mt-3 border-t pt-3">
              <p className="mb-3 text-xs text-muted-foreground">
                <span className="font-medium">Suggested subject:</span>{' '}
                {tpl.suggestedSubject}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {tpl.blocks.length} block{tpl.blocks.length !== 1 ? 's' : ''}
                </span>
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => setSelectedTemplate(tpl)}
                >
                  Use Template <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <UseTemplateDialog
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
