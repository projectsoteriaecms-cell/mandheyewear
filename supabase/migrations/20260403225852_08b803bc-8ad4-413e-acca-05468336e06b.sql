
-- Product requests table
CREATE TABLE public.product_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own requests"
ON public.product_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests"
ON public.product_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all requests"
ON public.product_requests FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'branch_staff'::app_role) OR
  has_role(auth.uid(), 'branch_manager'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Staff can update requests"
ON public.product_requests FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'branch_staff'::app_role) OR
  has_role(auth.uid(), 'branch_manager'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE TRIGGER update_product_requests_updated_at
BEFORE UPDATE ON public.product_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Check product availability across branches
CREATE OR REPLACE FUNCTION public.check_product_availability(p_product_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'mh_stock', COALESCE((
      SELECT SUM(i.quantity_on_hand)
      FROM inventory i
      JOIN branches b ON b.id = i.branch_id
      WHERE i.product_id = p_product_id
        AND b.is_mh_location = true
    ), 0),
    'other_stock', COALESCE((
      SELECT SUM(i.quantity_on_hand)
      FROM inventory i
      JOIN branches b ON b.id = i.branch_id
      WHERE i.product_id = p_product_id
        AND (b.is_mh_location IS NOT true)
    ), 0),
    'status', CASE
      WHEN COALESCE((
        SELECT SUM(i.quantity_on_hand)
        FROM inventory i
        JOIN branches b ON b.id = i.branch_id
        WHERE i.product_id = p_product_id
          AND b.is_mh_location = true
      ), 0) > 0 THEN 'in_stock'
      WHEN COALESCE((
        SELECT SUM(i.quantity_on_hand)
        FROM inventory i
        WHERE i.product_id = p_product_id
      ), 0) > 0 THEN 'available_sourcing'
      ELSE 'out_of_stock'
    END
  );
$$;

-- Update category counts to include all M&H item types
CREATE OR REPLACE FUNCTION public.get_product_category_counts()
RETURNS TABLE(category text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'all'::text, COUNT(*) FROM products WHERE is_active = true AND brand_line = 'm_and_h_fashion'
  UNION ALL
  SELECT 'eyeglasses'::text, COUNT(*) FROM products WHERE is_active = true AND brand_line = 'm_and_h_fashion' AND item_type = 'frames' AND is_prescription_compatible IS NOT false
  UNION ALL
  SELECT 'sunglasses'::text, COUNT(*) FROM products WHERE is_active = true AND brand_line = 'm_and_h_fashion' AND item_type = 'frames' AND is_prescription_compatible = false
  UNION ALL
  SELECT 'lenses'::text, COUNT(*) FROM products WHERE is_active = true AND brand_line = 'm_and_h_fashion' AND item_type = 'lenses'
  UNION ALL
  SELECT 'contact_lenses'::text, COUNT(*) FROM products WHERE is_active = true AND brand_line = 'm_and_h_fashion' AND item_type = 'contact_lenses'
  UNION ALL
  SELECT 'accessories'::text, COUNT(*) FROM products WHERE is_active = true AND brand_line = 'm_and_h_fashion' AND item_type IN ('accessories', 'solutions', 'cleanser', 'other', 'medications')
$$;
