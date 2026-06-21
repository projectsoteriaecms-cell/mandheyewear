-- ============================================================================
-- CRM T7 (schema half): Extend vto_email_leads for dual-contact capture
--   + full consent provenance
-- ----------------------------------------------------------------------------
-- Why: the result-gate funnel can capture email OR WhatsApp phone. The old
-- schema required email NOT NULL, making phone-only leads impossible.
-- Consent provenance (timestamp, source, text version, IP, channel) is
-- required for Meta WhatsApp Business and GDPR compliance.
-- ============================================================================

-- 1. Make email nullable (existing rows are all email-based, so no data loss).
ALTER TABLE public.vto_email_leads
  ALTER COLUMN email DROP NOT NULL;

-- 2. Add phone for WhatsApp/SMS dual-contact.
ALTER TABLE public.vto_email_leads
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 3. Enforce at least one contact method.
ALTER TABLE public.vto_email_leads
  ADD CONSTRAINT vto_email_or_phone
  CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- 4. Partial unique indexes: one row per email, one per phone (where present).
--    Using partial indexes so NULL values don't trigger uniqueness violations.
CREATE UNIQUE INDEX IF NOT EXISTS vto_email_leads_email_unique
  ON public.vto_email_leads (lower(trim(email)))
  WHERE email IS NOT NULL AND trim(email) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS vto_email_leads_phone_unique
  ON public.vto_email_leads (phone)
  WHERE phone IS NOT NULL AND trim(phone) <> '';

-- 5. Consent provenance columns (full audit trail for compliance).
ALTER TABLE public.vto_email_leads
  ADD COLUMN IF NOT EXISTS consent_timestamp     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_source        TEXT,        -- e.g. 'vto_result_gate'
  ADD COLUMN IF NOT EXISTS consent_text_version  TEXT,        -- e.g. 'v1.0' — bump when wording changes
  ADD COLUMN IF NOT EXISTS consent_ip            TEXT,        -- client IP at consent time
  ADD COLUMN IF NOT EXISTS consent_channel       TEXT;        -- 'email' | 'whatsapp'

-- 6. Backfill consent_channel for existing email rows.
UPDATE public.vto_email_leads
SET consent_channel = 'email'
WHERE email IS NOT NULL AND consent_channel IS NULL;

-- 7. Supporting indexes for CRM queries.
CREATE INDEX IF NOT EXISTS vto_email_leads_user_id_idx
  ON public.vto_email_leads (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS vto_email_leads_created_at_idx
  ON public.vto_email_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS vto_email_leads_marketing_consent_idx
  ON public.vto_email_leads (marketing_consent)
  WHERE marketing_consent = true;

COMMENT ON COLUMN public.vto_email_leads.phone IS
  'WhatsApp/SMS number. Either email or phone must be present (see check constraint).';
COMMENT ON COLUMN public.vto_email_leads.consent_text_version IS
  'Bump this value whenever the displayed consent language changes.';
