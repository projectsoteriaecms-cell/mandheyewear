-- ============================================================
-- 1. PRODUCTS: hide sensitive economic columns from anon
-- ============================================================
REVOKE SELECT (cost_price, reorder_level, reorder_quantity, supplier_id, lead_time_days, zoho_item_id, external_id)
  ON public.products FROM anon, PUBLIC;

-- ============================================================
-- 2. PRODUCT_REVIEWS: stop leaking user_id to anonymous visitors
-- ============================================================

-- Drop the public-read policy; reads for unauth visitors go through the RPC below.
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.product_reviews;

-- Re-add a policy that allows owners (so they can still see their own
-- pending/approved reviews via the table directly).
CREATE POLICY "Users can view own reviews"
ON public.product_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- SECURITY DEFINER RPC returning approved reviews enriched with the author's
-- display name + avatar, but never the raw user_id. Callable by anon and
-- authenticated.
CREATE OR REPLACE FUNCTION public.get_product_reviews(p_product_id uuid)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  rating integer,
  title text,
  body text,
  is_verified_purchase boolean,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  reviewer_name text,
  reviewer_avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.product_id,
    r.rating,
    r.title,
    r.body,
    r.is_verified_purchase,
    r.status,
    r.created_at,
    r.updated_at,
    COALESCE(p.full_name, 'Verified Customer') AS reviewer_name,
    p.avatar_url AS reviewer_avatar_url
  FROM public.product_reviews r
  LEFT JOIN public.profiles p ON p.user_id = r.user_id
  WHERE r.product_id = p_product_id
    AND r.status = 'approved'
  ORDER BY r.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_product_reviews(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product_reviews(uuid) TO anon, authenticated;