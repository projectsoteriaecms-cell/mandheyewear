-- Add zoho_item_id to products for mapping
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS zoho_item_id text UNIQUE;

-- Create sync log table for audit trail
CREATE TABLE IF NOT EXISTS public.zoho_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL,
  direction text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  records_processed integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_details jsonb,
  metadata jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  performed_by uuid
);

ALTER TABLE public.zoho_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view sync logs"
  ON public.zoho_sync_log FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Only super_admin can insert sync logs"
  ON public.zoho_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_products_zoho_item_id ON public.products(zoho_item_id) WHERE zoho_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_zoho_sync_log_type_status ON public.zoho_sync_log(sync_type, status);