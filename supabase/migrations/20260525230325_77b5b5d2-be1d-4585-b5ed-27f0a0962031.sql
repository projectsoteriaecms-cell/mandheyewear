
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tagline text;

ALTER TABLE public.frame_attributes
  ADD COLUMN IF NOT EXISTS lens_height            integer,
  ADD COLUMN IF NOT EXISTS total_width            integer,
  ADD COLUMN IF NOT EXISTS pd_range_min           integer,
  ADD COLUMN IF NOT EXISTS pd_range_max           integer,
  ADD COLUMN IF NOT EXISTS rx_sph_min             numeric(5,2),
  ADD COLUMN IF NOT EXISTS rx_sph_max             numeric(5,2),
  ADD COLUMN IF NOT EXISTS progressive_compatible boolean,
  ADD COLUMN IF NOT EXISTS size_label             text,
  ADD COLUMN IF NOT EXISTS best_for_faces         text,
  ADD COLUMN IF NOT EXISTS best_for_occasions     text;
