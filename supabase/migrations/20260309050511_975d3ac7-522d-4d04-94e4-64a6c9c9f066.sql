CREATE OR REPLACE FUNCTION public.get_product_image_stats()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM products WHERE is_active = true),
    'with_primary', (SELECT count(*) FROM products WHERE is_active = true AND image_url IS NOT NULL AND image_url <> ''),
    'complete', (SELECT count(*) FROM products WHERE is_active = true AND image_url IS NOT NULL AND image_url <> '' AND coalesce(array_length(additional_images, 1), 0) >= 5)
  );
$$;