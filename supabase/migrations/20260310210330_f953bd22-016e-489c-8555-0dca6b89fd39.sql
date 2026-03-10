CREATE OR REPLACE FUNCTION public.get_product_category_counts()
RETURNS TABLE(category text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 'all'::text, COUNT(*) FROM products WHERE is_active = true
  UNION ALL
  SELECT 'eyeglasses'::text, COUNT(*) FROM products WHERE is_active = true AND item_type = 'frames' AND is_prescription_compatible IS NOT false
  UNION ALL
  SELECT 'sunglasses'::text, COUNT(*) FROM products WHERE is_active = true AND item_type = 'frames' AND is_prescription_compatible = false
  UNION ALL
  SELECT item_type::text, COUNT(*) FROM products WHERE is_active = true AND item_type != 'frames' GROUP BY item_type
$$;