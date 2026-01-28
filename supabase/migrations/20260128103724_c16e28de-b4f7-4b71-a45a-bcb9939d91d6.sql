-- 1. Fix permissive analytics INSERT policy
DROP POLICY IF EXISTS "System can insert analytics" ON public.personalization_analytics;

CREATE POLICY "Authenticated users can insert analytics"
ON public.personalization_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Remove public inventory access (keep staff-only access)
DROP POLICY IF EXISTS "Anyone can view inventory levels" ON public.inventory;