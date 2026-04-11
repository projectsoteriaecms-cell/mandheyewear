
-- 1. Create shipping_zones table
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  base_fee NUMERIC NOT NULL DEFAULT 0,
  free_shipping_threshold NUMERIC,
  min_delivery_days INTEGER NOT NULL DEFAULT 1,
  max_delivery_days INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shipping zones"
ON public.shipping_zones FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage shipping zones"
ON public.shipping_zones FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Seed shipping zone data
INSERT INTO public.shipping_zones (zone_key, label, description, base_fee, free_shipping_threshold, min_delivery_days, max_delivery_days) VALUES
('lagos_island', 'Lagos Island', 'Victoria Island, Lekki, Ikoyi, Ajah', 2000, 50000, 1, 2),
('lagos_mainland', 'Lagos Mainland', 'Ikeja, Surulere, Yaba, Mushin, Agege', 2500, 50000, 1, 2),
('southwest', 'South West', 'Ogun, Oyo, Osun, Ondo, Ekiti', 4500, NULL, 2, 4),
('southeast', 'South East', 'Enugu, Imo, Anambra, Abia, Ebonyi', 5500, NULL, 3, 5),
('southsouth', 'South South', 'Rivers, Delta, Edo, Bayelsa, Cross River, Akwa Ibom', 5000, NULL, 3, 5),
('northcentral', 'North Central', 'FCT Abuja, Kwara, Plateau, Nasarawa, Benue, Niger, Kogi', 5500, NULL, 3, 5),
('northeast', 'North East', 'Borno, Adamawa, Yobe, Bauchi, Gombe, Taraba', 6500, NULL, 4, 7),
('northwest', 'North West', 'Kano, Kaduna, Katsina, Sokoto, Zamfara, Kebbi, Jigawa', 6000, NULL, 4, 7),
('west_africa', 'West Africa', 'Ghana, Cameroon, Togo, Benin, Senegal, Ivory Coast', 15000, NULL, 7, 14),
('africa_other', 'Rest of Africa', 'Kenya, South Africa, Tanzania, Egypt', 25000, NULL, 10, 21),
('international', 'International / Diaspora', 'USA, UK, Canada, Germany, Australia', 35000, NULL, 14, 30);

-- 3. Add shipping columns to orders table
ALTER TABLE public.orders
ADD COLUMN shipping_zone TEXT,
ADD COLUMN shipping_fee NUMERIC DEFAULT 0;

-- 4. Extend order_status enum with new values
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'packed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'shipped_local';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'shipped_interstate';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'shipped_international';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'in_transit_hub';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'customs_clearance';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'in_transit_country';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
