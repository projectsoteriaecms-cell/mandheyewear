-- 1. Fix mutable search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Defense-in-depth: explicitly revoke SELECT on newsletter_subscribers from
-- anon and authenticated. RLS already restricts to admins, but the scanner
-- wants an explicit table-level revoke so anon/non-admins cannot read emails
-- under any circumstance. Admins read via the service_role or via RPCs/edge
-- functions. INSERT remains open so the public can still subscribe.
REVOKE SELECT, UPDATE, DELETE ON public.newsletter_subscribers FROM anon, authenticated, PUBLIC;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;