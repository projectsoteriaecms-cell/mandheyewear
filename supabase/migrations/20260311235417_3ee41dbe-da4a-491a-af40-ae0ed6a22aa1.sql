CREATE OR REPLACE FUNCTION public.get_product_image_category_stats()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  FROM (
    SELECT 
      item_type::text,
      count(*)::int AS total,
      count(*) FILTER (WHERE image_url IS NOT NULL AND image_url <> '')::int AS with_primary,
      count(*) FILTER (WHERE image_url IS NOT NULL AND image_url <> '' 
        AND coalesce(array_length(additional_images, 1), 0) >= 5)::int AS complete
    FROM products
    WHERE is_active = true
    GROUP BY item_type
    ORDER BY count(*) DESC
  ) t;
$$;