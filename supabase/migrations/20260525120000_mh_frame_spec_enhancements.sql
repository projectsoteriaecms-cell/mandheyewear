-- M&H Frame Description Framework — schema enhancements
-- Adds tagline to products and full spec columns to frame_attributes
-- Apply via: Supabase Dashboard → SQL Editor → Run

-- ── products: add tagline column ──────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tagline text;

COMMENT ON COLUMN public.products.tagline IS
  'M&H Framework Layer 1 — 8-word personality headline (e.g. "Office-ready metal. Serious without trying.")';

-- ── frame_attributes: add spec columns ────────────────────────────────────
ALTER TABLE public.frame_attributes
  ADD COLUMN IF NOT EXISTS lens_height      integer,            -- mm (estimated from shape + lens_width)
  ADD COLUMN IF NOT EXISTS total_width      integer,            -- mm (calculated: 2×lens_width + bridge + 4)
  ADD COLUMN IF NOT EXISTS pd_range_min     integer,            -- mm  e.g. 56
  ADD COLUMN IF NOT EXISTS pd_range_max     integer,            -- mm  e.g. 72
  ADD COLUMN IF NOT EXISTS rx_sph_min       numeric(5,2),       -- e.g. -8.00
  ADD COLUMN IF NOT EXISTS rx_sph_max       numeric(5,2),       -- e.g. +6.00
  ADD COLUMN IF NOT EXISTS progressive_compatible boolean,      -- true if frame supports progressive lenses
  ADD COLUMN IF NOT EXISTS size_label       text,               -- Narrow / Small / Medium / Large / Extra Large
  ADD COLUMN IF NOT EXISTS best_for_faces   text,               -- e.g. "Oval, Round, Heart"
  ADD COLUMN IF NOT EXISTS best_for_occasions text;             -- e.g. "Work / Casual / All-day wear"

COMMENT ON COLUMN public.frame_attributes.lens_height           IS 'Lens height in mm — estimated from shape + lens_width';
COMMENT ON COLUMN public.frame_attributes.total_width           IS 'Total frame width in mm — calc: 2×lens_width + bridge + 4';
COMMENT ON COLUMN public.frame_attributes.pd_range_min          IS 'Minimum pupillary distance supported (mm)';
COMMENT ON COLUMN public.frame_attributes.pd_range_max          IS 'Maximum pupillary distance supported (mm)';
COMMENT ON COLUMN public.frame_attributes.rx_sph_min            IS 'Minimum sphere power (e.g. -8.00)';
COMMENT ON COLUMN public.frame_attributes.rx_sph_max            IS 'Maximum sphere power (e.g. +6.00)';
COMMENT ON COLUMN public.frame_attributes.progressive_compatible IS 'Whether this frame can be fitted with progressive lenses';
COMMENT ON COLUMN public.frame_attributes.size_label            IS 'M&H size label: Narrow / Small / Medium / Large / Extra Large';
COMMENT ON COLUMN public.frame_attributes.best_for_faces        IS 'Recommended face shapes (comma-separated)';
COMMENT ON COLUMN public.frame_attributes.best_for_occasions    IS 'Best use occasions (e.g. Work / Casual / Night out)';

-- ── index for fast size/shape filtering on the storefront ─────────────────
CREATE INDEX IF NOT EXISTS idx_frame_attributes_size_label
  ON public.frame_attributes (size_label);

CREATE INDEX IF NOT EXISTS idx_frame_attributes_frame_shape
  ON public.frame_attributes (frame_shape);
