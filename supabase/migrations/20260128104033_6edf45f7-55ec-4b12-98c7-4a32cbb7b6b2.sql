-- The previous migration should have dropped and recreated the policy
-- But the linter still shows it - let's ensure the old permissive policy is removed
-- and only the authenticated one remains

-- First drop any existing insert policies on personalization_analytics
DROP POLICY IF EXISTS "System can insert analytics" ON public.personalization_analytics;
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON public.personalization_analytics;

-- Create the proper authenticated-only insert policy
CREATE POLICY "Authenticated users can insert analytics"
ON public.personalization_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);