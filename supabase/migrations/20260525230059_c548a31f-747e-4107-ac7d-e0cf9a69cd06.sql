
-- 1. Restrict cost_price and internal supply chain fields on products from anon role (column-level)
REVOKE SELECT (cost_price, reorder_level, reorder_quantity, lead_time_days, supplier_id, zoho_item_id, external_id) ON public.products FROM anon;
REVOKE SELECT (cost_price, reorder_level, reorder_quantity, lead_time_days, supplier_id, zoho_item_id, external_id) ON public.products FROM authenticated;

-- Re-grant to authenticated only for non-sensitive internal use through admin policies (admins use service role or rely on policy; keep authenticated able to read non-sensitive fields only)
-- Note: admin operations should use service role or appropriate function. Re-grant all non-sensitive columns implicitly remains via prior table grant.

-- 2. Block self-assignment of roles: add explicit RESTRICTIVE policies on user_roles
CREATE POLICY "Only super_admins can insert roles"
ON public.user_roles AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admins can update roles"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only super_admins can delete roles"
ON public.user_roles AS RESTRICTIVE
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 3. Tighten email_unsubscribe_tokens policies to authenticated role (service_role check stays)
DROP POLICY IF EXISTS "Service role can read tokens" ON public.email_unsubscribe_tokens;
DROP POLICY IF EXISTS "Service role can insert tokens" ON public.email_unsubscribe_tokens;
DROP POLICY IF EXISTS "Service role can mark tokens as used" ON public.email_unsubscribe_tokens;

CREATE POLICY "Service role can read tokens"
ON public.email_unsubscribe_tokens FOR SELECT TO authenticated
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert tokens"
ON public.email_unsubscribe_tokens FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can mark tokens as used"
ON public.email_unsubscribe_tokens FOR UPDATE TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 4. Tighten vto_email_leads admin view policy to authenticated
DROP POLICY IF EXISTS "Admins can view VTO leads" ON public.vto_email_leads;
CREATE POLICY "Admins can view VTO leads"
ON public.vto_email_leads FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role));

DROP POLICY IF EXISTS "Super admins can delete VTO leads" ON public.vto_email_leads;
CREATE POLICY "Super admins can delete VTO leads"
ON public.vto_email_leads FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Super admins can update VTO leads" ON public.vto_email_leads;
CREATE POLICY "Super admins can update VTO leads"
ON public.vto_email_leads FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
