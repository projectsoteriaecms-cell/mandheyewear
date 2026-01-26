-- Create branch_assignments table for staff/manager branch scoping
CREATE TABLE public.branch_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID,
  UNIQUE(user_id, branch_id)
);

-- Enable RLS
ALTER TABLE public.branch_assignments ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "Super admins full access on branch_assignments"
ON public.branch_assignments
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- Branch managers can view their branch assignments
CREATE POLICY "Branch managers can view branch assignments"
ON public.branch_assignments
FOR SELECT
USING (
  public.has_role(auth.uid(), 'branch_manager') 
  AND branch_id IN (
    SELECT ba.branch_id FROM public.branch_assignments ba WHERE ba.user_id = auth.uid()
  )
);

-- Users can view their own assignments
CREATE POLICY "Users can view own assignments"
ON public.branch_assignments
FOR SELECT
USING (user_id = auth.uid());

-- Add index for performance
CREATE INDEX idx_branch_assignments_user ON public.branch_assignments(user_id);
CREATE INDEX idx_branch_assignments_branch ON public.branch_assignments(branch_id);