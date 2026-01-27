-- Create import_history table to track ECMS imports
CREATE TABLE public.import_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_type TEXT NOT NULL DEFAULT 'ecms',
  file_name TEXT,
  total_records INTEGER NOT NULL DEFAULT 0,
  new_products INTEGER NOT NULL DEFAULT 0,
  updated_products INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  duration_seconds NUMERIC,
  performed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_details JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Staff can view import history
CREATE POLICY "Staff can view import history"
ON public.import_history
FOR SELECT
USING (
  has_role(auth.uid(), 'branch_staff'::app_role) OR 
  has_role(auth.uid(), 'branch_manager'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Managers can insert import history
CREATE POLICY "Managers can insert import history"
ON public.import_history
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'branch_manager'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);