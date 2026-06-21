-- =============================================================================
-- Admin CRM: contact stats for the Customers tab stat cards.
-- One round-trip instead of 6 client-side count queries. SECURITY DEFINER so it
-- can read the crm_contacts view consistently; manager/staff gated.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.crm_contact_stats()
RETURNS TABLE(
  total_contacts     BIGINT,
  vto_leads          BIGINT,
  subscribers        BIGINT,
  registered         BIGINT,
  paying_customers   BIGINT,
  suppressed         BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: CRM access requires staff role'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)                                          AS total_contacts,
    COUNT(*) FILTER (WHERE is_vto_lead)               AS vto_leads,
    COUNT(*) FILTER (WHERE is_newsletter_subscriber)  AS subscribers,
    COUNT(*) FILTER (WHERE is_registered)             AS registered,
    COUNT(*) FILTER (WHERE lifetime_value > 0)        AS paying_customers,
    COUNT(*) FILTER (WHERE is_suppressed)             AS suppressed
  FROM public.crm_contacts;
END;
$$;

GRANT EXECUTE ON FUNCTION public.crm_contact_stats() TO authenticated;
