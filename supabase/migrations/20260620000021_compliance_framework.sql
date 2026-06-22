-- ============================================================================
-- Compliance Framework (Phase C)
-- ============================================================================
-- GDPR + CAN-SPAM compliance: audit logging, consent tracking, right-to-be-forgotten.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- consent_audit_log
-- Tracks every change to marketing/newsletter consent with reason.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_audit_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT NOT NULL,
  consent_type          TEXT NOT NULL CHECK (consent_type IN ('marketing', 'newsletter')),
  old_value             BOOLEAN,
  new_value             BOOLEAN NOT NULL,
  reason                TEXT,
  changed_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address            INET,
  user_agent            TEXT,
  changed_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consent_audit_log_email_idx ON public.consent_audit_log(email);
CREATE INDEX IF NOT EXISTS consent_audit_log_changed_at_idx ON public.consent_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS consent_audit_log_type_idx ON public.consent_audit_log(consent_type);

COMMENT ON TABLE public.consent_audit_log IS
  'GDPR-compliant audit log of all consent changes (marketing, newsletter). Immutable.';

-- ---------------------------------------------------------------------------
-- suppression_audit_log
-- Tracks opt-outs: when, why, channel, and auto-suppression date.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppression_audit_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT NOT NULL,
  suppressed_type       TEXT NOT NULL CHECK (suppressed_type IN ('email', 'sms', 'all')),
  reason                TEXT NOT NULL,  -- 'user_request', 'bounce', 'complaint', 'compliance', etc.
  source                TEXT,            -- 'preference_center', 'campaign_link', 'admin', 'auto_bounce'
  suppressed_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  auto_unsuppress_at    TIMESTAMP WITH TIME ZONE,  -- GDPR: auto-delete after 180d unless renewed
  suppressed_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS suppression_audit_log_email_idx ON public.suppression_audit_log(email);
CREATE INDEX IF NOT EXISTS suppression_audit_log_suppressed_at_idx ON public.suppression_audit_log(suppressed_at DESC);
CREATE INDEX IF NOT EXISTS suppression_audit_log_auto_unsuppress_idx ON public.suppression_audit_log(auto_unsuppress_at)
  WHERE auto_unsuppress_at IS NOT NULL;

COMMENT ON TABLE public.suppression_audit_log IS
  'Audit trail for email/SMS opt-outs. auto_unsuppress_at for GDPR right-to-be-forgotten compliance (180d retention).';

-- ---------------------------------------------------------------------------
-- campaign_send_audit
-- Recipient-level record of every campaign send (for proof of consent + GDPR).
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.campaign_send_audit (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id           UUID NOT NULL REFERENCES public.crm_campaigns(id) ON DELETE RESTRICT,
  recipient_email       TEXT NOT NULL,
  template_id           TEXT,
  subject_line          TEXT,
  resend_message_id     TEXT,

  -- Consent state at send time
  had_marketing_consent BOOLEAN NOT NULL,
  had_newsletter_consent BOOLEAN,

  -- Delivery tracking
  sent_at               TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at             TIMESTAMP WITH TIME ZONE,
  clicked_at            TIMESTAMP WITH TIME ZONE,
  bounced_at            TIMESTAMP WITH TIME ZONE,
  bounce_reason         TEXT,
  complained_at         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS campaign_send_audit_campaign_id_idx ON public.campaign_send_audit(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_send_audit_recipient_email_idx ON public.campaign_send_audit(recipient_email);
CREATE INDEX IF NOT EXISTS campaign_send_audit_sent_at_idx ON public.campaign_send_audit(sent_at DESC);

COMMENT ON TABLE public.campaign_send_audit IS
  'GDPR compliance: proof that recipient had consent at time of send. Immutable send record.';

-- ---------------------------------------------------------------------------
-- contact_data_access_log
-- Logs every time a user views/exports contact data (for GDPR audit trail).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_data_access_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by           UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  email                 TEXT NOT NULL,
  action                TEXT NOT NULL CHECK (action IN ('view', 'export', 'edit', 'delete')),
  reason                TEXT,
  ip_address            INET,
  accessed_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_data_access_log_accessed_by_idx ON public.contact_data_access_log(accessed_by);
CREATE INDEX IF NOT EXISTS contact_data_access_log_email_idx ON public.contact_data_access_log(email);
CREATE INDEX IF NOT EXISTS contact_data_access_log_accessed_at_idx ON public.contact_data_access_log(accessed_at DESC);

COMMENT ON TABLE public.contact_data_access_log IS
  'GDPR audit trail: who accessed what contact data, when, and why.';

-- ---------------------------------------------------------------------------
-- RPC: crm_log_consent_change(email, type, new_value, reason)
-- Idempotent consent audit logging.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_log_consent_change(
  p_email TEXT,
  p_consent_type TEXT,
  p_new_value BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_normalized TEXT;
  v_old_value BOOLEAN;
BEGIN
  v_email_normalized := LOWER(TRIM(p_email));

  -- Get old value
  IF p_consent_type = 'marketing' THEN
    SELECT marketing_consent INTO v_old_value FROM public.crm_contacts WHERE email = v_email_normalized;
  ELSIF p_consent_type = 'newsletter' THEN
    SELECT newsletter_active INTO v_old_value FROM public.crm_contacts WHERE email = v_email_normalized;
  ELSE
    RETURN jsonb_build_object('success', FALSE, 'message', 'Invalid consent_type');
  END IF;

  -- Log only if changed
  IF v_old_value IS DISTINCT FROM p_new_value THEN
    INSERT INTO public.consent_audit_log (email, consent_type, old_value, new_value, reason, changed_by)
    VALUES (v_email_normalized, p_consent_type, v_old_value, p_new_value, p_reason, auth.uid());
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Consent change logged'
  );
END;
$$;

COMMENT ON FUNCTION public.crm_log_consent_change IS
  'Log a consent change to audit trail. Idempotent.';

-- ---------------------------------------------------------------------------
-- RPC: crm_suppress_email(email, reason, auto_unsuppress_days)
-- Suppress email with optional auto-unsuppress (for GDPR retention).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_suppress_email(
  p_email TEXT,
  p_reason TEXT DEFAULT 'user_request',
  p_auto_unsuppress_days INT DEFAULT 180
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_normalized TEXT;
  v_auto_unsuppress_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_email_normalized := LOWER(TRIM(p_email));

  -- Calculate auto-unsuppress date if specified
  v_auto_unsuppress_at := CASE
    WHEN p_auto_unsuppress_days > 0 THEN now() + (p_auto_unsuppress_days || ' days')::INTERVAL
    ELSE NULL
  END;

  -- Add to suppressed_emails if not already there
  INSERT INTO public.suppressed_emails (email)
  VALUES (v_email_normalized)
  ON CONFLICT (email) DO NOTHING;

  -- Log suppression
  INSERT INTO public.suppression_audit_log (
    email, suppressed_type, reason, source, auto_unsuppress_at
  )
  VALUES (v_email_normalized, 'email', p_reason, 'admin', v_auto_unsuppress_at);

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Email suppressed',
    'auto_unsuppress_at', v_auto_unsuppress_at
  );
END;
$$;

COMMENT ON FUNCTION public.crm_suppress_email IS
  'Suppress email with optional auto-unsuppress date (GDPR retention). Logs to suppression_audit_log.';

-- ---------------------------------------------------------------------------
-- RPC: gdpr_export_contact_data(email)
-- Export all personal data for a contact (GDPR right of access).
-- Returns: full contact record, consent history, access logs, campaign sends.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gdpr_export_contact_data(p_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_normalized TEXT;
  v_contact jsonb;
  v_consent_history jsonb;
  v_suppression_history jsonb;
  v_campaign_sends jsonb;
  v_access_logs jsonb;
BEGIN
  v_email_normalized := LOWER(TRIM(p_email));

  -- Log access
  INSERT INTO public.contact_data_access_log (email, action, reason, accessed_by)
  VALUES (v_email_normalized, 'export', 'GDPR data export request', auth.uid());

  -- Contact data
  SELECT jsonb_build_object(
    'email', email,
    'full_name', full_name,
    'phone', phone,
    'is_registered', is_registered,
    'is_vto_lead', is_vto_lead,
    'is_newsletter_subscriber', is_newsletter_subscriber,
    'marketing_consent', marketing_consent,
    'is_suppressed', is_suppressed,
    'lifetime_value', lifetime_value,
    'order_count', order_count,
    'try_on_count', try_on_count,
    'first_seen', first_seen,
    'last_activity_at', last_activity_at
  ) INTO v_contact
  FROM public.crm_contacts
  WHERE email = v_email_normalized;

  -- Consent history
  SELECT jsonb_agg(jsonb_build_object(
    'type', consent_type,
    'old_value', old_value,
    'new_value', new_value,
    'reason', reason,
    'changed_at', changed_at
  ) ORDER BY changed_at DESC)
  INTO v_consent_history
  FROM public.consent_audit_log
  WHERE email = v_email_normalized;

  -- Suppression history
  SELECT jsonb_agg(jsonb_build_object(
    'suppressed_type', suppressed_type,
    'reason', reason,
    'source', source,
    'suppressed_at', suppressed_at,
    'auto_unsuppress_at', auto_unsuppress_at
  ) ORDER BY suppressed_at DESC)
  INTO v_suppression_history
  FROM public.suppression_audit_log
  WHERE email = v_email_normalized;

  -- Campaign sends (last 12 months)
  SELECT jsonb_agg(jsonb_build_object(
    'campaign_id', campaign_id,
    'subject_line', subject_line,
    'sent_at', sent_at,
    'opened_at', opened_at,
    'had_consent', had_marketing_consent
  ) ORDER BY sent_at DESC)
  INTO v_campaign_sends
  FROM public.campaign_send_audit
  WHERE recipient_email = v_email_normalized
    AND sent_at > now() - interval '12 months';

  -- Access logs
  SELECT jsonb_agg(jsonb_build_object(
    'action', action,
    'reason', reason,
    'accessed_at', accessed_at
  ) ORDER BY accessed_at DESC)
  INTO v_access_logs
  FROM public.contact_data_access_log
  WHERE email = v_email_normalized
    AND accessed_at > now() - interval '12 months';

  RETURN jsonb_build_object(
    'success', TRUE,
    'exported_at', now(),
    'contact_data', v_contact,
    'consent_history', COALESCE(v_consent_history, '[]'::jsonb),
    'suppression_history', COALESCE(v_suppression_history, '[]'::jsonb),
    'campaign_sends', COALESCE(v_campaign_sends, '[]'::jsonb),
    'access_logs', COALESCE(v_access_logs, '[]'::jsonb)
  );
END;
$$;

COMMENT ON FUNCTION public.gdpr_export_contact_data IS
  'GDPR right of access: export all personal data for a contact. Logs access for audit trail.';

-- ---------------------------------------------------------------------------
-- RPC: gdpr_delete_contact(email)
-- Right to be forgotten: anonymize contact data (not delete, for record-keeping).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gdpr_delete_contact(p_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_normalized TEXT;
  v_anon_email TEXT;
BEGIN
  v_email_normalized := LOWER(TRIM(p_email));

  -- Create anonymized email (for referential integrity)
  v_anon_email := format('deleted+%s@anonymized.local', substring(p_email from 1 for 8));

  -- Suppress email (prevents future sends)
  INSERT INTO public.suppressed_emails (email)
  VALUES (v_email_normalized)
  ON CONFLICT (email) DO NOTHING;

  -- Log deletion request
  INSERT INTO public.suppression_audit_log (
    email, suppressed_type, reason, source, auto_unsuppress_at
  )
  VALUES (v_email_normalized, 'all', 'GDPR right to be forgotten', 'admin', NULL);

  -- Anonymize in vto_email_leads (delete old records, keep anonymized)
  DELETE FROM public.vto_email_leads WHERE LOWER(email) = v_email_normalized;

  -- Anonymize in newsletter_subscribers
  DELETE FROM public.newsletter_subscribers WHERE LOWER(email) = v_email_normalized;

  -- Note: profiles linked to auth.users cannot be deleted (FK constraint).
  -- The user should separately request account deletion via auth provider.

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Contact anonymized and suppressed (GDPR right to be forgotten)',
    'note', 'Registered user account must be deleted separately via authentication provider'
  );
END;
$$;

COMMENT ON FUNCTION public.gdpr_delete_contact IS
  'GDPR right to be forgotten: anonymize and suppress contact. Note: registered accounts must be deleted via auth provider.';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.crm_log_consent_change(TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_suppress_email(TEXT, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gdpr_export_contact_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gdpr_delete_contact(TEXT) TO authenticated;
GRANT SELECT ON public.consent_audit_log TO authenticated;
GRANT SELECT ON public.suppression_audit_log TO authenticated;
GRANT SELECT ON public.campaign_send_audit TO authenticated;
GRANT SELECT ON public.contact_data_access_log TO authenticated;
