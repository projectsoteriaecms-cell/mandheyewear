-- =============================================================================
-- WhatsApp Delivery Status Webhooks
--
-- Track message delivery status from Twilio webhooks.
-- Adds columns to crm_campaign_whatsapp_ledger to record:
--   - delivery_status: sent | delivered | read | failed
--   - delivered_at: timestamp when message was delivered
--   - read_at: timestamp when message was read
--   - error_code: Twilio error code if failed
--   - updated_at: when status last changed
-- =============================================================================

ALTER TABLE public.crm_campaign_whatsapp_ledger
  ADD COLUMN IF NOT EXISTS delivery_status  TEXT DEFAULT 'pending',
    -- pending | sent | delivered | read | failed
  ADD COLUMN IF NOT EXISTS delivered_at     TIMESTAMPTZ,
    -- When Twilio confirmed delivery
  ADD COLUMN IF NOT EXISTS read_at          TIMESTAMPTZ,
    -- When recipient read the message
  ADD COLUMN IF NOT EXISTS error_code       TEXT,
    -- Twilio error code if failed (e.g., "21606", "30001")
  ADD COLUMN IF NOT EXISTS error_message    TEXT,
    -- Twilio error message details
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT now();

COMMENT ON COLUMN public.crm_campaign_whatsapp_ledger.delivery_status IS
  'pending | sent | delivered | read | failed. Updated by webhook handler as Twilio reports status changes.';
COMMENT ON COLUMN public.crm_campaign_whatsapp_ledger.delivered_at IS
  'Timestamp when message delivery was confirmed by Twilio (MessageStatus.DeliveryStatus=delivered).';
COMMENT ON COLUMN public.crm_campaign_whatsapp_ledger.read_at IS
  'Timestamp when message was read by recipient (MessageStatus.DeliveryStatus=read).';
COMMENT ON COLUMN public.crm_campaign_whatsapp_ledger.error_code IS
  'Twilio error code if delivery failed (e.g., "21606" = message queue full).';
COMMENT ON COLUMN public.crm_campaign_whatsapp_ledger.updated_at IS
  'Last time this row was updated (webhook event received).';

-- Index for efficient queries on delivery status
CREATE INDEX IF NOT EXISTS crm_wa_ledger_delivery_status_idx
  ON public.crm_campaign_whatsapp_ledger (delivery_status, campaign_id)
  WHERE delivery_status != 'pending';

-- ---------------------------------------------------------------------------
-- crm_update_whatsapp_delivery_status — called by webhook handler
-- ---------------------------------------------------------------------------
-- Updates ledger row with new delivery status. Idempotent: runs safely even
-- if the same webhook event is received multiple times.
CREATE OR REPLACE FUNCTION public.crm_update_whatsapp_delivery_status(
  p_message_sid    TEXT,
  p_delivery_status TEXT,
  p_delivered_at   TIMESTAMPTZ DEFAULT NULL,
  p_read_at        TIMESTAMPTZ DEFAULT NULL,
  p_error_code     TEXT DEFAULT NULL,
  p_error_message  TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.crm_campaign_whatsapp_ledger
  SET    delivery_status = p_delivery_status,
         delivered_at    = COALESCE(p_delivered_at, delivered_at),
         read_at         = COALESCE(p_read_at, read_at),
         error_code      = p_error_code,
         error_message   = p_error_message,
         updated_at      = now()
  WHERE  twilio_message_sid = p_message_sid;
END;
$$;

COMMENT ON FUNCTION public.crm_update_whatsapp_delivery_status(TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT) IS
  'Update WhatsApp ledger with delivery status from Twilio webhooks. Idempotent: safe to call multiple times per event.';

-- ---------------------------------------------------------------------------
-- crm_get_whatsapp_delivery_stats — analytics helper
-- ---------------------------------------------------------------------------
-- Returns delivery rate metrics for a campaign.
CREATE OR REPLACE FUNCTION public.crm_get_whatsapp_delivery_stats(
  p_campaign_id UUID
)
RETURNS TABLE(
  total_sent       BIGINT,
  delivered_count  BIGINT,
  read_count       BIGINT,
  failed_count     BIGINT,
  pending_count    BIGINT,
  delivery_rate    NUMERIC,
  read_rate        NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  WITH stats AS (
    SELECT
      COUNT(*)                                      AS total,
      COUNT(*) FILTER (WHERE delivery_status = 'delivered') AS delivered,
      COUNT(*) FILTER (WHERE delivery_status = 'read')      AS read,
      COUNT(*) FILTER (WHERE delivery_status = 'failed')    AS failed,
      COUNT(*) FILTER (WHERE delivery_status = 'pending')   AS pending
    FROM public.crm_campaign_whatsapp_ledger
    WHERE campaign_id = p_campaign_id
      AND status = 'sent'  -- only count actually sent messages
  )
  SELECT
    total,
    delivered,
    read,
    failed,
    pending,
    CASE WHEN total > 0 THEN ROUND(100.0 * delivered / total, 2) ELSE 0 END,
    CASE WHEN delivered > 0 THEN ROUND(100.0 * read / delivered, 2) ELSE 0 END
  FROM stats;
$$;

COMMENT ON FUNCTION public.crm_get_whatsapp_delivery_stats(UUID) IS
  'Delivery rate analytics for a WhatsApp campaign. Counts delivered/read/failed messages from the ledger.';

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.crm_update_whatsapp_delivery_status(TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_get_whatsapp_delivery_stats(UUID) TO authenticated;
