-- ============================================================================
-- RPC: crm_add_customer
-- ============================================================================
-- Creates or updates a customer entry by:
-- 1. Inserting/upserting into vto_email_leads (for tracking)
-- 2. Optionally inserting into newsletter_subscribers (if newsletter_opt_in=true)
--
-- Returns: { success: boolean, email: text, message: text }
-- ============================================================================

CREATE OR REPLACE FUNCTION public.crm_add_customer(
  p_email TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_marketing_consent BOOLEAN DEFAULT FALSE,
  p_newsletter_opt_in BOOLEAN DEFAULT FALSE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_normalized TEXT;
  v_result JSONB;
BEGIN
  -- Normalize email
  v_email_normalized := LOWER(TRIM(p_email));

  -- Validation
  IF v_email_normalized IS NULL OR v_email_normalized = '' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'message', 'Email is required'
    );
  END IF;

  IF NOT (v_email_normalized ~* '^[^@]+@[^@]+\.[^@]+$') THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'message', 'Invalid email format'
    );
  END IF;

  -- Insert/upsert into vto_email_leads
  INSERT INTO public.vto_email_leads (email, marketing_consent, source)
  VALUES (v_email_normalized, p_marketing_consent, 'crm_manual_add')
  ON CONFLICT (email) DO UPDATE
  SET marketing_consent = COALESCE(p_marketing_consent, excluded.marketing_consent)
  WHERE vto_email_leads.email = v_email_normalized;

  -- Optionally add to newsletter
  IF p_newsletter_opt_in THEN
    INSERT INTO public.newsletter_subscribers (email, is_active)
    VALUES (v_email_normalized, TRUE)
    ON CONFLICT (email) DO UPDATE
    SET is_active = TRUE
    WHERE newsletter_subscribers.email = v_email_normalized;
  END IF;

  v_result := jsonb_build_object(
    'success', TRUE,
    'email', v_email_normalized,
    'message', 'Customer added successfully'
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.crm_add_customer IS
  'Add a new customer to the CRM system. Inserts into vto_email_leads and optionally newsletter_subscribers. Idempotent.';

-- Grant to authenticated users (admins only via RLS on calling procedure)
GRANT EXECUTE ON FUNCTION public.crm_add_customer TO authenticated;
