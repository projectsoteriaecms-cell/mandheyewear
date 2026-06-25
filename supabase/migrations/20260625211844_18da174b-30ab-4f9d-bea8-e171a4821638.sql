
-- 1) Lock down public.products column-level reads for anon/authenticated
REVOKE ALL ON public.products FROM anon, authenticated, PUBLIC;

GRANT SELECT (
  id, sku, brand_line, name, description, price, currency, category_id,
  image_url, additional_images, is_prescription_compatible, gender, style,
  material, color, frame_width, bridge_size, temple_length, is_active,
  created_at, updated_at, item_type, brand, price_tier, unit,
  description_raw, record_type, description_html, primary_image_locked, tagline
) ON public.products TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- 2) Replace direct user_roles subquery on user_prescriptions with has_role()
DROP POLICY IF EXISTS "Admins can read all prescriptions" ON public.user_prescriptions;

CREATE POLICY "Admins can read all prescriptions"
ON public.user_prescriptions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'branch_manager'::app_role)
);
