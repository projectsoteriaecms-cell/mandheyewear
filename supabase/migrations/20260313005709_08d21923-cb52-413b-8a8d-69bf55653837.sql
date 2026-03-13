
-- Create zoho_warehouse_mapping table
CREATE TABLE public.zoho_warehouse_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zoho_location_id text NOT NULL UNIQUE,
  zoho_location_name text,
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.zoho_warehouse_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage warehouse mapping"
  ON public.zoho_warehouse_mapping FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Staff can view warehouse mapping"
  ON public.zoho_warehouse_mapping FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff'::app_role)
    OR public.has_role(auth.uid(), 'branch_manager'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Add zoho_sync to transaction_type enum
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'zoho_sync';
