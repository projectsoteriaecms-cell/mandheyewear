-- ---------------------------------------------------------------------------
-- CRM campaign archiving
-- Adds an is_archived flag so campaigns can be hidden from the main views
-- without being permanently deleted. Defaults to false; existing rows stay
-- visible. Safe, non-destructive, reversible (DROP COLUMN to undo).
-- ---------------------------------------------------------------------------

ALTER TABLE public.crm_campaigns
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Partial index: the common case is "show me everything not archived",
-- so index the small archived set for the Archived view.
CREATE INDEX IF NOT EXISTS crm_campaigns_is_archived_idx
  ON public.crm_campaigns (is_archived)
  WHERE is_archived = true;

COMMENT ON COLUMN public.crm_campaigns.is_archived IS
  'When true, the campaign is hidden from Drafts/Active/Completed views and only appears under the Archived tab. Reversible via unarchive.';
