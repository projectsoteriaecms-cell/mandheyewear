import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Type,
  MousePointerClick,
  Minus,
  Layout,
  Sparkles,
  Variable,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { EmailBlock } from '@/modules/crm';

// ── Personalization tokens ────────────────────────────────────────────────────

export const TOKENS = [
  { token: '{{first_name}}',    label: 'First Name',      example: 'Amaka' },
  { token: '{{last_name}}',     label: 'Last Name',       example: 'Okonkwo' },
  { token: '{{full_name}}',     label: 'Full Name',       example: 'Amaka Okonkwo' },
  { token: '{{email}}',         label: 'Email Address',   example: 'amaka@example.com' },
  { token: '{{store_name}}',    label: 'Store Name',      example: 'M&H Eyewear' },
  { token: '{{unsubscribe_link}}', label: 'Unsubscribe Link', example: 'https://...' },
];

interface TokenPickerProps {
  onInsert: (token: string) => void;
}

export function TokenPicker({ onInsert }: TokenPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
          <Variable className="h-3.5 w-3.5" />
          Insert Token
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
          Personalisation tokens — auto-replaced when sending
        </p>
        <div className="space-y-0.5">
          {TOKENS.map((t) => (
            <button
              key={t.token}
              onClick={() => onInsert(t.token)}
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-muted transition-colors"
            >
              <div>
                <p className="text-xs font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground font-mono">{t.token}</p>
              </div>
              <span className="text-xs text-muted-foreground">{t.example}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Block type definitions ────────────────────────────────────────────────────

const BLOCK_TYPES = [
  { type: 'hero',     label: 'Hero Header',   icon: Sparkles,           desc: 'Full-width title + subtitle' },
  { type: 'text',     label: 'Text Block',    icon: Type,               desc: 'Paragraph of body copy' },
  { type: 'button',   label: 'CTA Button',    icon: MousePointerClick,  desc: 'Call-to-action button with link' },
  { type: 'columns2', label: 'Two Columns',   icon: Layout,             desc: 'Two-column text layout' },
  { type: 'divider',  label: 'Divider',       icon: Minus,              desc: 'Visual horizontal rule' },
] as const;

const DEFAULT_DATA: Record<string, Record<string, string>> = {
  hero:     { title: 'Welcome to M&H Eyewear', subtitle: 'Discover our latest collection', bg_color: '#1a1a2e' },
  text:     { content: 'Write your message here. You can personalise it with tokens like {{first_name}}.' },
  button:   { text: 'Shop Now', url: 'https://mandheyewear.com/shop', align: 'center', bg_color: '#2563eb' },
  columns2: { left: 'Column one text here.', right: 'Column two text here.' },
  divider:  { color: '#e5e7eb' },
};

// ── Individual block editors ──────────────────────────────────────────────────

function HeroEditor({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Headline</label>
        <Input
          value={data.title ?? ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Your catchy headline"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Subtitle</label>
        <Input
          value={data.subtitle ?? ''}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="Supporting tagline"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Background Colour</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.bg_color ?? '#1a1a2e'}
            onChange={(e) => onChange({ ...data, bg_color: e.target.value })}
            className="h-8 w-10 rounded cursor-pointer border"
          />
          <Input
            value={data.bg_color ?? '#1a1a2e'}
            onChange={(e) => onChange({ ...data, bg_color: e.target.value })}
            className="font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
}

function TextEditor({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const handleInsertToken = (token: string) => {
    onChange({ ...data, content: (data.content ?? '') + token });
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">Content</label>
        <TokenPicker onInsert={handleInsertToken} />
      </div>
      <Textarea
        value={data.content ?? ''}
        onChange={(e) => onChange({ ...data, content: e.target.value })}
        placeholder="Write your email content... Use {{first_name}} for personalisation."
        rows={5}
        className="text-sm resize-y"
      />
      <p className="text-xs text-muted-foreground">
        Use blank lines between paragraphs. HTML tags like &lt;b&gt;, &lt;a href=""&gt; are supported.
      </p>
    </div>
  );
}

function ButtonEditor({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Button Text</label>
          <Input
            value={data.text ?? ''}
            onChange={(e) => onChange({ ...data, text: e.target.value })}
            placeholder="Shop Now"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Alignment</label>
          <Select value={data.align ?? 'center'} onValueChange={(v) => onChange({ ...data, align: v })}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Destination URL</label>
        <Input
          value={data.url ?? ''}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://mandheyewear.com/shop"
          type="url"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Button Colour</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.bg_color ?? '#2563eb'}
            onChange={(e) => onChange({ ...data, bg_color: e.target.value })}
            className="h-8 w-10 rounded cursor-pointer border"
          />
          <Input
            value={data.bg_color ?? '#2563eb'}
            onChange={(e) => onChange({ ...data, bg_color: e.target.value })}
            className="font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
}

function Columns2Editor({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Left Column</label>
        <Textarea
          value={data.left ?? ''}
          onChange={(e) => onChange({ ...data, left: e.target.value })}
          rows={4}
          className="text-sm"
          placeholder="Left column text..."
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Right Column</label>
        <Textarea
          value={data.right ?? ''}
          onChange={(e) => onChange({ ...data, right: e.target.value })}
          rows={4}
          className="text-sm"
          placeholder="Right column text..."
        />
      </div>
    </div>
  );
}

// ── Block card ────────────────────────────────────────────────────────────────

interface BlockCardProps {
  block: EmailBlock;
  index: number;
  total: number;
  onChange: (data: Record<string, string>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

const BLOCK_LABEL: Record<string, string> = {
  hero: 'Hero Header', text: 'Text Block', button: 'CTA Button',
  columns2: 'Two Columns', divider: 'Divider',
};

function BlockCard({ block, index, total, onChange, onMoveUp, onMoveDown, onDelete }: BlockCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Block header */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-muted/40 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-xs font-mono text-muted-foreground w-5">{index + 1}</span>
        <span className="text-sm font-medium flex-1">{BLOCK_LABEL[block.type] ?? block.type}</span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onMoveUp} disabled={index === 0}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onMoveDown} disabled={index === total - 1}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Block editor */}
      {expanded && block.type !== 'divider' && (
        <div className="p-3">
          {block.type === 'hero'     && <HeroEditor    data={block.data} onChange={onChange} />}
          {block.type === 'text'     && <TextEditor     data={block.data} onChange={onChange} />}
          {block.type === 'button'   && <ButtonEditor   data={block.data} onChange={onChange} />}
          {block.type === 'columns2' && <Columns2Editor data={block.data} onChange={onChange} />}
        </div>
      )}
      {expanded && block.type === 'divider' && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Colour</label>
            <input
              type="color"
              value={block.data.color ?? '#e5e7eb'}
              onChange={(e) => onChange({ ...block.data, color: e.target.value })}
              className="h-6 w-8 rounded cursor-pointer border"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add block picker ──────────────────────────────────────────────────────────

function AddBlockPicker({ onAdd }: { onAdd: (type: EmailBlock['type']) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dashed" size="sm" className="w-full border-dashed border-2 text-muted-foreground hover:text-foreground h-10">
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="center">
        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Choose a block type</p>
        <div className="space-y-1">
          {BLOCK_TYPES.map(({ type, label, icon: Icon, desc }) => (
            <button
              key={type}
              onClick={() => { onAdd(type as EmailBlock['type']); setOpen(false); }}
              className="flex w-full items-start gap-3 rounded-md px-2 py-2 hover:bg-muted transition-colors text-left"
            >
              <div className="mt-0.5 rounded bg-primary/10 p-1.5">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Main EmailBlockEditor ─────────────────────────────────────────────────────

interface EmailBlockEditorProps {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
}

export function EmailBlockEditor({ blocks, onChange }: EmailBlockEditorProps) {
  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: crypto.randomUUID(),
      type,
      data: { ...(DEFAULT_DATA[type] ?? {}) },
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, data: Record<string, string>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, data } : b)));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const next = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    onChange(next);
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-2">
      {blocks.length === 0 && (
        <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No content yet</p>
          <p className="text-xs mt-1">Add blocks below to build your email</p>
        </div>
      )}
      {blocks.map((block, i) => (
        <BlockCard
          key={block.id}
          block={block}
          index={i}
          total={blocks.length}
          onChange={(data) => updateBlock(block.id, data)}
          onMoveUp={() => moveBlock(i, 'up')}
          onMoveDown={() => moveBlock(i, 'down')}
          onDelete={() => deleteBlock(block.id)}
        />
      ))}
      <AddBlockPicker onAdd={addBlock} />
    </div>
  );
}
