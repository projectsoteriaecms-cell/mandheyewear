-- Fix fan-out in crm_get_unsent_whatsapp_batch (follow-up to 20260724100000).
--
-- The previous revision joined crm_contacts directly on phone. That join is not
-- 1:1 -- the same number can appear both as a phone-only contact and on an
-- email contact (profiles.phone_number / vto phone) -- so a single recipient
-- came back multiple times, once per matching contact row, with DIFFERENT
-- whatsapp_opted_in values. Observed live: 08143304129 returned twice, true and
-- false. That burns batch slots and risks recording a "no opt-in" skip for
-- someone who IS opted in, depending on row order.
--
-- Now: collapse the opt-in lookup to one row per phone, and group the batch by
-- phone. bool_or is the right reducer -- consent is attached to the NUMBER, so
-- if any contact record for it carries a WhatsApp opt-in, the number is opted
-- in. Phones are returned in their ORIGINAL form so the ledger NOT-IN resume
-- filter keeps matching.

DROP FUNCTION IF EXISTS public.crm_get_unsent_whatsapp_batch(uuid, jsonb, integer);

CREATE FUNCTION public.crm_get_unsent_whatsapp_batch(
  p_campaign_id uuid,
  p_rules_json  jsonb,
  p_batch_size  integer DEFAULT 50
)
RETURNS TABLE(
  phone                    text,
  full_name                text,
  is_newsletter_subscriber boolean,
  whatsapp_opted_in        boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    r.phone,
    (array_agg(r.full_name) FILTER (WHERE r.full_name IS NOT NULL))[1] AS full_name,
    bool_or(r.is_newsletter_subscriber)              AS is_newsletter_subscriber,
    bool_or(COALESCE(c.whatsapp_opted_in, false))    AS whatsapp_opted_in
  FROM public.crm_eval_segment_rules(p_rules_json) AS r
  LEFT JOIN (
    SELECT cc.phone AS phone, bool_or(cc.whatsapp_opted_in) AS whatsapp_opted_in
    FROM   public.crm_contacts cc
    WHERE  cc.phone IS NOT NULL AND btrim(cc.phone) <> ''
    GROUP  BY cc.phone
  ) c ON c.phone = r.phone
  WHERE r.phone IS NOT NULL
  AND   btrim(r.phone) <> ''
  AND   r.phone NOT IN (
    SELECT contact_phone
    FROM   public.crm_campaign_whatsapp_ledger
    WHERE  campaign_id = p_campaign_id
  )
  GROUP BY r.phone
  LIMIT p_batch_size;
$function$;
