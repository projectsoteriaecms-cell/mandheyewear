-- Add logistics columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS logistics_partner text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS logistics_notes text,
  ADD COLUMN IF NOT EXISTS estimated_delivery_date date,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Create logistics_partners table
CREATE TABLE IF NOT EXISTS public.logistics_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_email text,
  contact_phone text,
  coverage_zones text[] DEFAULT '{}'::text[],
  api_endpoint text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logistics_partners ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can view active partners
CREATE POLICY "Anyone can view active logistics partners"
  ON public.logistics_partners FOR SELECT
  USING (is_active = true);

-- RLS: admins can manage
CREATE POLICY "Admins can manage logistics partners"
  ON public.logistics_partners FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Seed placeholder partners
INSERT INTO public.logistics_partners (name, contact_email, contact_phone, coverage_zones) VALUES
  ('Lagos Local Dispatch', 'dispatch@soteriaeyeclinic.com', '+234 800 000 0001', ARRAY['lagos_mainland', 'lagos_island']),
  ('Interstate Courier', 'interstate@soteriaeyeclinic.com', '+234 800 000 0002', ARRAY['southwest', 'southeast', 'southsouth', 'northcentral', 'northeast', 'northwest']),
  ('International Shipping Partner', 'international@soteriaeyeclinic.com', '+234 800 000 0003', ARRAY['west_africa', 'africa_other', 'international']);