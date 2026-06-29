-- =============================================================================
-- WhatsApp Template Approval Flow
--
-- Templates now go through an approval workflow (pending → approved/rejected)
-- so managers can vet templates before they're used in campaigns.
-- Only approved templates are suggested in campaign editors.
-- =============================================================================

ALTER TABLE public.crm_whatsapp_templates
  ADD COLUMN IF NOT EXISTS approval_state    TEXT NOT NULL DEFAULT 'pending',
    -- pending | approved | rejected
  ADD COLUMN IF NOT EXISTS approval_notes    TEXT,
    -- Manager's notes on why approved/rejected
  ADD COLUMN IF NOT EXISTS approved_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    -- User who approved/rejected
  ADD COLUMN IF NOT EXISTS approved_at       TIMESTAMPTZ;
    -- When approval state last changed

COMMENT ON COLUMN public.crm_whatsapp_templates.approval_state IS
  'pending | approved | rejected. New templates default to pending; only approved templates are suggested in campaign editors.';
COMMENT ON COLUMN public.crm_whatsapp_templates.approval_notes IS
  'Manager notes explaining the approval decision (e.g. "Complies with Meta guidelines" or "Lacks unsubscribe link").';

-- Index for efficient filtering of approved templates
CREATE INDEX IF NOT EXISTS crm_whatsapp_templates_approved_idx
  ON public.crm_whatsapp_templates (approval_state, active)
  WHERE active = true;

-- ---------------------------------------------------------------------------
-- crm_approve_whatsapp_template — manager action to approve a template
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_approve_whatsapp_template(
  p_template_id UUID,
  p_notes       TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: template approval requires manager role'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.crm_whatsapp_templates
  SET    approval_state = 'approved',
         approval_notes  = p_notes,
         approved_by     = auth.uid(),
         approved_at     = now(),
         updated_at      = now()
  WHERE  id = p_template_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- crm_reject_whatsapp_template — manager action to reject a template
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_reject_whatsapp_template(
  p_template_id UUID,
  p_notes       TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: template rejection requires manager role'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.crm_whatsapp_templates
  SET    approval_state = 'rejected',
         approval_notes  = p_notes,
         approved_by     = auth.uid(),
         approved_at     = now(),
         updated_at      = now()
  WHERE  id = p_template_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.crm_approve_whatsapp_template(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_reject_whatsapp_template(UUID, TEXT) TO authenticated;
