-- Phase 1: Create new enums
CREATE TYPE public.price_tier AS ENUM ('budget', 'standard', 'premium', 'luxury');
CREATE TYPE public.record_type AS ENUM ('inventory_item', 'service');

-- Expand item_type enum with new values
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'cleanser';
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'packaging';

-- Phase 1: Add new columns to products table
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS price_tier public.price_tier,
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'Item',
  ADD COLUMN IF NOT EXISTS description_raw TEXT,
  ADD COLUMN IF NOT EXISTS record_type public.record_type DEFAULT 'inventory_item';

-- Create index on external_id for faster lookups during import
CREATE INDEX IF NOT EXISTS idx_products_external_id ON public.products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);

-- Phase 1.3: Create price tier calculation function
CREATE OR REPLACE FUNCTION public.calculate_price_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price >= 200000 THEN
    NEW.price_tier := 'luxury'::public.price_tier;
  ELSIF NEW.price >= 150000 THEN
    NEW.price_tier := 'premium'::public.price_tier;
  ELSIF NEW.price >= 100000 THEN
    NEW.price_tier := 'standard'::public.price_tier;
  ELSE
    NEW.price_tier := 'budget'::public.price_tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic price tier calculation
DROP TRIGGER IF EXISTS set_price_tier ON public.products;
CREATE TRIGGER set_price_tier
  BEFORE INSERT OR UPDATE OF price ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_price_tier();

-- Update existing products to set their price tier
UPDATE public.products SET price_tier = 
  CASE 
    WHEN price >= 200000 THEN 'luxury'::public.price_tier
    WHEN price >= 150000 THEN 'premium'::public.price_tier
    WHEN price >= 100000 THEN 'standard'::public.price_tier
    ELSE 'budget'::public.price_tier
  END;

-- Phase 2: Create frame_attributes table
CREATE TABLE IF NOT EXISTS public.frame_attributes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  model_code TEXT,
  frame_shape TEXT,
  lens_width INTEGER,
  bridge_size INTEGER,
  temple_length INTEGER,
  frame_material TEXT,
  front_color TEXT,
  temple_color TEXT,
  has_clip_on BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on frame_attributes
ALTER TABLE public.frame_attributes ENABLE ROW LEVEL SECURITY;

-- RLS policies for frame_attributes
CREATE POLICY "Anyone can view frame attributes"
  ON public.frame_attributes FOR SELECT
  USING (true);

CREATE POLICY "Managers can manage frame attributes"
  ON public.frame_attributes FOR ALL
  USING (
    has_role(auth.uid(), 'branch_manager'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Phase 3: Create lens_attributes table
CREATE TABLE IF NOT EXISTS public.lens_attributes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  sph DECIMAL(5,2),
  cyl DECIMAL(5,2),
  axis INTEGER,
  lens_type TEXT,
  lens_material TEXT,
  coating TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lens_attributes
ALTER TABLE public.lens_attributes ENABLE ROW LEVEL SECURITY;

-- RLS policies for lens_attributes
CREATE POLICY "Anyone can view lens attributes"
  ON public.lens_attributes FOR SELECT
  USING (true);

CREATE POLICY "Managers can manage lens attributes"
  ON public.lens_attributes FOR ALL
  USING (
    has_role(auth.uid(), 'branch_manager'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Axis validation trigger for lens_attributes
CREATE OR REPLACE FUNCTION public.validate_lens_axis()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.axis IS NOT NULL AND (NEW.axis < 0 OR NEW.axis > 180) THEN
    RAISE EXCEPTION 'Axis must be between 0 and 180 degrees';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_lens_axis_trigger
  BEFORE INSERT OR UPDATE ON public.lens_attributes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lens_axis();

-- Phase 4: Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service_type TEXT,
  price DECIMAL(12,2),
  currency TEXT DEFAULT 'NGN',
  description TEXT,
  duration_minutes INTEGER,
  requires_appointment BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Managers can manage services"
  ON public.services FOR ALL
  USING (
    has_role(auth.uid(), 'branch_manager'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Add updated_at trigger for services
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 5: Enhance categories table
ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;