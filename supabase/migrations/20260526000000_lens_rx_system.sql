-- ─────────────────────────────────────────────────────────────────────────────
-- Lens & Prescription System
-- Creates user_prescriptions table and extends cart_items / order_items
-- with full lens configuration columns.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. user_prescriptions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_prescriptions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Who issued it and when
  issued_date      date,
  expiry_date      date,          -- typically issued_date + 2 years
  prescriber_name  text,
  clinic_name      text,

  -- Per-eye data: { sph, cyl, axis, add, prism_h, prism_v, base_h, base_v }
  -- All values are numeric strings so we preserve sign ("−2.25" vs "2.25")
  right_eye        jsonb,
  left_eye         jsonb,

  -- Pupillary distance
  pd_distance      numeric(5,2),  -- far PD (single value or dominant eye)
  pd_near          numeric(5,2),  -- near PD (optional)
  pd_right         numeric(5,2),  -- monocular right (optional)
  pd_left          numeric(5,2),  -- monocular left (optional)

  -- Provenance
  source           text NOT NULL DEFAULT 'manual'
                   CHECK (source IN ('manual', 'uploaded', 'clinic_issued')),
  document_url     text,          -- Storage URL of uploaded prescription image

  -- Status
  is_active        boolean NOT NULL DEFAULT true,
  notes            text,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Trigger: keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_user_prescriptions_updated_at'
  ) THEN
    CREATE TRIGGER set_user_prescriptions_updated_at
      BEFORE UPDATE ON public.user_prescriptions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- RLS
ALTER TABLE public.user_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own prescriptions"
  ON public.user_prescriptions
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all prescriptions"
  ON public.user_prescriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'branch_manager')
    )
  );

-- ── 2. Extend cart_items ──────────────────────────────────────────────────────
-- prescription_data already exists; add the remaining lens config columns
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS lens_type       text,
  ADD COLUMN IF NOT EXISTS lens_index      text,
  ADD COLUMN IF NOT EXISTS lens_coatings   text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prescription_id uuid    REFERENCES public.user_prescriptions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requires_fitting boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fitting_booked  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lens_price      numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frame_only      boolean NOT NULL DEFAULT false;

-- ── 3. Extend order_items ─────────────────────────────────────────────────────
-- snapshot the lens config at purchase time (prescription_data already exists)
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS lens_type       text,
  ADD COLUMN IF NOT EXISTS lens_index      text,
  ADD COLUMN IF NOT EXISTS lens_coatings   text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prescription_id uuid,   -- soft ref only (no cascade on orders)
  ADD COLUMN IF NOT EXISTS requires_fitting boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fitting_booked  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lens_price      numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frame_only      boolean NOT NULL DEFAULT false;

-- ── 4. Grants ─────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_prescriptions TO authenticated;
GRANT SELECT ON public.user_prescriptions TO anon;
