
CREATE TABLE public.promo_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_line1 TEXT NOT NULL DEFAULT 'New Season',
  title_line2 TEXT NOT NULL DEFAULT 'Collection',
  date_label TEXT NOT NULL DEFAULT 'April 2026 Drop',
  description TEXT NOT NULL DEFAULT 'Every frame you love — now with a fresh new twist. Explore our latest arrivals before they are gone.',
  discount_prefix TEXT NOT NULL DEFAULT 'Up to',
  discount_value TEXT NOT NULL DEFAULT '20% OFF',
  disclaimer TEXT NOT NULL DEFAULT 'T&Cs apply • Limited time offer',
  featured_product_ids UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo banners"
ON public.promo_banners
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage promo banners"
ON public.promo_banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_promo_banners_updated_at
BEFORE UPDATE ON public.promo_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with current hardcoded values
INSERT INTO public.promo_banners (title_line1, title_line2, date_label, description, discount_prefix, discount_value, disclaimer, is_active)
VALUES ('New Season', 'Collection', 'April 2026 Drop', 'Every frame you love — now with a fresh new twist. Explore our latest arrivals before they are gone.', 'Up to', '20% OFF', 'T&Cs apply • Limited time offer', true);
