-- =============================================================================
-- WhatsApp Batch — Newsletter Opt-in Gating
--
-- Update crm_get_unsent_whatsapp_batch to return is_newsletter_subscriber
-- so the send-campaign-whatsapp EF can gate sends to opted-in contacts only.
--
-- NOTE: The function was dropped in migration 20260629000002a_drop_whatsapp_batch.sql
-- This migration recreates it with the new signature.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.crm_get_unsent_whatsapp_batch(
  p_campaign_id UUID,
  p_rules_json  JSONB,
  p_batch_size  INT DEFAULT 50
)
RETURNS TABLE(phone TEXT, full_name TEXT, is_newsletter_subscriber BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT r.phone, r.full_name, r.is_newsletter_subscriber
  FROM   public.crm_eval_segment_rules(p_rules_json) AS r
  WHERE  r.phone IS NOT NULL
  AND    btrim(r.phone) <> ''
  AND    r.phone NOT IN (
    SELECT contact_phone
    FROM   public.crm_campaign_whatsapp_ledger
    WHERE  campaign_id = p_campaign_id
  )
  LIMIT  p_batch_size;
$$;

COMMENT ON FUNCTION public.crm_get_unsent_whatsapp_batch(UUID, JSONB, INT) IS
  'T20 resumable WhatsApp batch load with newsletter flag. Segment members with a phone, minus the WhatsApp ledger — safe across crash/resume. EF filters to newsletter subscribers only.';

GRANT EXECUTE ON FUNCTION public.crm_get_unsent_whatsapp_batch(UUID, JSONB, INT) TO authenticated;
