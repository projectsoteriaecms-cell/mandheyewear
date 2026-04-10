
CREATE TABLE public.slideshow_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  discount_percent integer,
  discount_label text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.slideshow_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active slideshow items"
  ON public.slideshow_items
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage slideshow items"
  ON public.slideshow_items
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX idx_slideshow_items_display_order ON public.slideshow_items (display_order);
CREATE INDEX idx_slideshow_items_product_id ON public.slideshow_items (product_id);
