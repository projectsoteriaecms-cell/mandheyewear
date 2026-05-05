
-- 1) Restrict cost_price column access (hide from anon and authenticated customers)
REVOKE SELECT (cost_price) ON public.products FROM anon, authenticated;
GRANT SELECT (cost_price) ON public.products TO service_role;

-- 2) Logistics partners — restrict to staff only
DROP POLICY IF EXISTS "Anyone can view active logistics partners" ON public.logistics_partners;
CREATE POLICY "Staff can view active logistics partners"
ON public.logistics_partners
FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    has_role(auth.uid(), 'branch_staff'::app_role)
    OR has_role(auth.uid(), 'branch_manager'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

-- 3) Storage product-images — require admin role
DROP POLICY IF EXISTS "Admin users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete product images" ON storage.objects;

CREATE POLICY "Admin users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'branch_manager'::app_role)
  )
);

CREATE POLICY "Admin users can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-images' AND (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'branch_manager'::app_role)
  )
);

CREATE POLICY "Admin users can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images' AND (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'branch_manager'::app_role)
  )
);

-- 4) user_roles — only super_admin can manage (prevents admin->super_admin escalation)
DROP POLICY IF EXISTS "Admins and super admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- 5) cart_abandonment_events — owner read access
CREATE POLICY "Users can view own abandonment events"
ON public.cart_abandonment_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6) browse_nudge_log — owner read access
CREATE POLICY "Users can view own browse nudge log"
ON public.browse_nudge_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 7) Remove products from realtime publication to avoid leaking internal columns
ALTER PUBLICATION supabase_realtime DROP TABLE public.products;
