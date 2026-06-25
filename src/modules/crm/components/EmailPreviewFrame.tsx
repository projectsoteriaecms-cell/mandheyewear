import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { EmailBlock } from '@/modules/crm';
import { TOKENS } from './EmailBlockEditor';

// ── Resolve personalisation tokens with sample values ────────────────────────

function resolveTokens(text: string): string {
  const samples: Record<string, string> = {
    '{{first_name}}':     'Amaka',
    '{{last_name}}':      'Okonkwo',
    '{{full_name}}':      'Amaka Okonkwo',
    '{{email}}':          'amaka@example.com',
    '{{store_name}}':     'M&H Eyewear',
    '{{unsubscribe_link}}': '#',
  };
  return Object.entries(samples).reduce(
    (str, [token, val]) => str.replaceAll(token, val),
    text,
  );
}

// ── Block → HTML ──────────────────────────────────────────────────────────────

function textToHtml(text: string): string {
  return resolveTokens(text)
    .split('\n\n')
    .map((para) => `<p style="margin:0 0 14px 0;line-height:1.6;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function blockToHtml(block: EmailBlock): string {
  const { type, data } = block;

  switch (type) {
    case 'hero': {
      const bg = data.bg_color ?? '#1a1a2e';
      return `
        <tr>
          <td style="background:${bg};padding:48px 40px;text-align:center;">
            <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#ffffff;font-family:Georgia,serif;">
              ${resolveTokens(data.title ?? '')}
            </h1>
            <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.8);font-family:sans-serif;">
              ${resolveTokens(data.subtitle ?? '')}
            </p>
          </td>
        </tr>`;
    }
    case 'text': {
      return `
        <tr>
          <td style="padding:28px 40px;font-family:sans-serif;font-size:15px;color:#374151;">
            ${textToHtml(data.content ?? '')}
          </td>
        </tr>`;
    }
    case 'button': {
      const align = data.align ?? 'center';
      const bg = data.bg_color ?? '#2563eb';
      return `
        <tr>
          <td style="padding:12px 40px 28px;text-align:${align};">
            <a href="${data.url ?? '#'}"
               style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;
                      padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;
                      font-family:sans-serif;">
              ${resolveTokens(data.text ?? 'Click Here')}
            </a>
          </td>
        </tr>`;
    }
    case 'columns2': {
      return `
        <tr>
          <td style="padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48%" style="font-family:sans-serif;font-size:15px;color:#374151;vertical-align:top;padding-right:12px;">
                  ${textToHtml(data.left ?? '')}
                </td>
                <td width="4%"></td>
                <td width="48%" style="font-family:sans-serif;font-size:15px;color:#374151;vertical-align:top;padding-left:12px;">
                  ${textToHtml(data.right ?? '')}
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }
    case 'divider': {
      const color = data.color ?? '#e5e7eb';
      return `
        <tr>
          <td style="padding:8px 40px;">
            <hr style="border:none;border-top:1px solid ${color};margin:0;" />
          </td>
        </tr>`;
    }
    default:
      return '';
  }
}

export function blocksToHtml(
  blocks: EmailBlock[],
  meta: { fromName?: string; subject?: string; previewText?: string } = {},
): string {
  const bodyRows = blocks.map(blockToHtml).join('\n');
  const previewText = meta.previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${resolveTokens(meta.previewText)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${meta.subject ?? 'Email Preview'}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:sans-serif;">
${previewText}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;
                    box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:600px;width:100%;">
        ${bodyRows || '<tr><td style="padding:40px;text-align:center;color:#9ca3af;font-size:14px;">No blocks yet — add some content</td></tr>'}
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#6b7280;font-family:sans-serif;">
              ${meta.fromName ?? 'M&H Eyewear'} ·
              <a href="#" style="color:#6b7280;">Unsubscribe</a> ·
              <a href="#" style="color:#6b7280;">View in browser</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ── Preview panel component ───────────────────────────────────────────────────

interface EmailPreviewFrameProps {
  blocks: EmailBlock[];
  subject: string;
  previewText: string;
  fromName?: string;
}

export function EmailPreviewFrame({ blocks, subject, previewText, fromName }: EmailPreviewFrameProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  const html = blocksToHtml(blocks, { fromName, subject, previewText });

  return (
    <div className="flex flex-col h-full">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">
            <span className="text-muted-foreground">From:</span>{' '}
            {fromName ?? 'M&H Eyewear'}
          </p>
          {subject && (
            <p className="text-xs truncate mt-0.5">
              <span className="text-muted-foreground">Subject:</span>{' '}
              <span className="font-medium">{resolveTokens(subject)}</span>
            </p>
          )}
          {previewText && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {resolveTokens(previewText)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <Button
            size="sm"
            variant={viewport === 'desktop' ? 'default' : 'ghost'}
            className="h-7 w-7 p-0"
            onClick={() => setViewport('desktop')}
            title="Desktop preview"
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={viewport === 'mobile' ? 'default' : 'ghost'}
            className="h-7 w-7 p-0"
            onClick={() => setViewport('mobile')}
            title="Mobile preview"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-auto bg-muted/20 flex justify-center p-4">
        <div
          className={cn(
            'transition-all duration-300',
            viewport === 'desktop' ? 'w-full max-w-2xl' : 'w-[390px]',
          )}
        >
          {/* Device frame for mobile */}
          {viewport === 'mobile' && (
            <div className="mx-auto rounded-[2rem] border-[6px] border-foreground/20 overflow-hidden shadow-xl">
              <iframe
                srcDoc={html}
                title="Email preview"
                className="w-full"
                style={{ height: '720px', border: 'none', display: 'block' }}
                sandbox="allow-same-origin"
              />
            </div>
          )}
          {viewport === 'desktop' && (
            <div className="rounded-lg border overflow-hidden shadow-sm">
              <iframe
                srcDoc={html}
                title="Email preview"
                className="w-full"
                style={{ height: '700px', border: 'none', display: 'block' }}
                sandbox="allow-same-origin"
              />
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground mt-2">
            Live preview with sample data · Tokens will be replaced per recipient when sending
          </p>
        </div>
      </div>
    </div>
  );
}
