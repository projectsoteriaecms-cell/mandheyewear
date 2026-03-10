-- Update products RLS: include admin
DROP POLICY IF EXISTS "Super admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update zoho_sync_log INSERT: include admin
DROP POLICY IF EXISTS "Only super_admin can insert sync logs" ON public.zoho_sync_log;
CREATE POLICY "Admins can insert sync logs" ON public.zoho_sync_log
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update categories RLS: include admin
DROP POLICY IF EXISTS "Super admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update user_roles RLS: include admin
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins and super admins can manage roles" ON public.user_roles
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update user_invitations
DROP POLICY IF EXISTS "Super admins can create invitations" ON public.user_invitations;
CREATE POLICY "Admins can create invitations" ON public.user_invitations
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Super admins can update invitations" ON public.user_invitations;
CREATE POLICY "Admins can update invitations" ON public.user_invitations
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Super admins can delete invitations" ON public.user_invitations;
CREATE POLICY "Admins can delete invitations" ON public.user_invitations
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Managers can view invitations" ON public.user_invitations;
CREATE POLICY "Managers can view invitations" ON public.user_invitations
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role));

-- Update create_staff_notification to include admin role
CREATE OR REPLACE FUNCTION public.create_staff_notification(p_title text, p_message text, p_type notification_type DEFAULT 'info'::notification_type, p_link text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link, metadata)
  SELECT ur.user_id, p_title, p_message, p_type, p_link, p_metadata
  FROM user_roles ur
  WHERE ur.role IN ('branch_staff', 'branch_manager', 'admin', 'super_admin');
END;
$function$;