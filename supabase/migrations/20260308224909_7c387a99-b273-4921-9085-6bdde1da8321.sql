
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON public.personalization_analytics;

-- Replace with a restricted policy allowing only staff/managers/admins to insert
CREATE POLICY "Staff can insert analytics"
ON public.personalization_analytics
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'branch_staff'::app_role)
  OR has_role(auth.uid(), 'branch_manager'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
