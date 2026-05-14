// Brevo CRM sync — routes contacts to the correct per-brand list.
// M&H leads → BREVO_MH_LIST_ID, Soteria leads → BREVO_SOTERIA_LIST_ID.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/brevo';

const PayloadSchema = z.object({
  brand_line: z.enum(['m_and_h_fashion', 'soteria_medical']),
  email: z.string().email(),
  full_name: z.string().min(1).max(200).optional(),
  phone: z.string().max(40).optional(),
  source: z.string().max(60).optional(),
  consent_marketing: z.boolean().optional().default(false),
  attributes: z.record(z.unknown()).optional(),
  event: z
    .object({
      type: z.string().min(1).max(60),
      properties: z.record(z.unknown()).optional(),
    })
    .optional(),
});

function listIdForBrand(brand: 'm_and_h_fashion' | 'soteria_medical'): number | null {
  const raw =
    brand === 'm_and_h_fashion'
      ? Deno.env.get('BREVO_MH_LIST_ID')
      : Deno.env.get('BREVO_SOTERIA_LIST_ID');
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY is not configured');

    const parsed = PayloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const payload = parsed.data;

    const listId = listIdForBrand(payload.brand_line);
    if (!listId) {
      return new Response(
        JSON.stringify({
          error: `No Brevo list configured for brand ${payload.brand_line}. Set ${
            payload.brand_line === 'm_and_h_fashion'
              ? 'BREVO_MH_LIST_ID'
              : 'BREVO_SOTERIA_LIST_ID'
          }.`,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const gatewayHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': BREVO_API_KEY,
    };

    // Upsert contact into the brand's list.
    const [firstName, ...rest] = (payload.full_name ?? '').trim().split(/\s+/);
    const lastName = rest.join(' ');
    const contactBody = {
      email: payload.email,
      updateEnabled: true,
      listIds: [listId],
      attributes: {
        ...(firstName ? { FIRSTNAME: firstName } : {}),
        ...(lastName ? { LASTNAME: lastName } : {}),
        ...(payload.phone ? { SMS: payload.phone, WHATSAPP: payload.phone } : {}),
        BRAND_LINE: payload.brand_line,
        SOURCE: payload.source ?? 'unknown',
        CONSENT_MARKETING: payload.consent_marketing ?? false,
        ...(payload.attributes ?? {}),
      },
    };

    const contactRes = await fetch(`${GATEWAY_URL}/contacts`, {
      method: 'POST',
      headers: gatewayHeaders,
      body: JSON.stringify(contactBody),
    });
    const contactJson = await contactRes.json().catch(() => ({}));
    if (!contactRes.ok) {
      throw new Error(
        `Brevo contacts upsert failed [${contactRes.status}]: ${JSON.stringify(contactJson)}`,
      );
    }

    // Optional event log (e.g. appointment_logged, order_logged, whatsapp_followup_sent).
    let eventStatus: number | null = null;
    if (payload.event) {
      const eventRes = await fetch(`${GATEWAY_URL}/events`, {
        method: 'POST',
        headers: gatewayHeaders,
        body: JSON.stringify({
          event_name: payload.event.type,
          identifiers: { email_id: payload.email },
          contact_properties: {
            BRAND_LINE: payload.brand_line,
          },
          event_properties: payload.event.properties ?? {},
        }),
      });
      eventStatus = eventRes.status;
      // Brevo returns 204 on success; non-2xx is logged but not fatal.
      if (!eventRes.ok) {
        const errBody = await eventRes.text().catch(() => '');
        console.warn(`Brevo event log non-OK [${eventRes.status}]:`, errBody);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        brand_line: payload.brand_line,
        list_id: listId,
        contact: contactJson,
        event_status: eventStatus,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('brevo-sync error:', message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
