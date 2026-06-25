-- Campaign Builder columns
ALTER TABLE public.crm_campaigns
  ADD COLUMN IF NOT EXISTS body_blocks  JSONB    NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS body_html    TEXT,
  ADD COLUMN IF NOT EXISTS subject_line_b TEXT,
  ADD COLUMN IF NOT EXISTS ab_enabled   BOOLEAN  NOT NULL DEFAULT false;
