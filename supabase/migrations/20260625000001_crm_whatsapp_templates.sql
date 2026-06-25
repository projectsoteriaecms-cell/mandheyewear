-- ---------------------------------------------------------------------------
-- CRM WhatsApp templates table
-- Stores pre-configured, Twilio-approved message templates for WhatsApp
-- campaigns. Using templates is 50% cheaper than plain text messages.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crm_whatsapp_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,                   -- "Welcome", "Promotion"
  description       TEXT,                            -- What this template is for
  twilio_content_sid TEXT NOT NULL,                 -- Twilio template ID
  body_preview      TEXT NOT NULL,                  -- "Hi {{name}}, welcome!"
  variables         TEXT[] DEFAULT ARRAY[]::TEXT[], -- ["name", "discount"]
  cost_per_message  DECIMAL(6,4) DEFAULT 0.0039,   -- Twilio pricing
  active            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_whatsapp_templates_active_idx
  ON public.crm_whatsapp_templates (active)
  WHERE active = true;

COMMENT ON TABLE public.crm_whatsapp_templates IS
  'Pre-approved WhatsApp message templates from Twilio. Templates cost 50% less than plain text messages and have better compliance/delivery rates.';
COMMENT ON COLUMN public.crm_whatsapp_templates.variables IS
  'Array of variable names that can be personalized: ["name", "discount", "date", etc]';

-- Add foreign key to campaigns table
ALTER TABLE public.crm_campaigns
  ADD COLUMN IF NOT EXISTS whatsapp_template_id UUID REFERENCES public.crm_whatsapp_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS crm_campaigns_whatsapp_template_id_idx
  ON public.crm_campaigns (whatsapp_template_id)
  WHERE whatsapp_enabled = true;
