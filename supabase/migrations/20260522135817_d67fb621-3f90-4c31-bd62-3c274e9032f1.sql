ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS primary_image_locked boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_primary_image_locked
ON public.products (primary_image_locked)
WHERE primary_image_locked = true;