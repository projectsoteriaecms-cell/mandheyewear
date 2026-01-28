-- Fix infinite recursion in branch_assignments RLS by avoiding self-referential subqueries

-- 1) Helper: return branch_ids assigned to a given user (runs as definer, bypassing RLS)
CREATE OR REPLACE FUNCTION public.branch_ids_for_user(_user_id uuid)
RETURNS TABLE(branch_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ba.branch_id
  FROM public.branch_assignments ba
  WHERE ba.user_id = _user_id;
$$;

-- 2) Replace the recursive policy
DROP POLICY IF EXISTS "Branch managers can view branch assignments" ON public.branch_assignments;

CREATE POLICY "Branch managers can view branch assignments"
ON public.branch_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'branch_manager'::public.app_role)
  AND branch_id IN (
    SELECT branch_id FROM public.branch_ids_for_user(auth.uid())
  )
);
