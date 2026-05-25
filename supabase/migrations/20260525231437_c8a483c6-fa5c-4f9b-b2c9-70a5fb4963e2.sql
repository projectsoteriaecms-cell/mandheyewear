REVOKE SELECT ON public.products FROM anon, authenticated, PUBLIC;
GRANT SELECT (
  id, sku, brand_line, name, description, price, currency, category_id,
  image_url, additional_images, is_prescription_compatible, gender, style,
  material, color, frame_width, bridge_size, temple_length, is_active,
  created_at, updated_at, item_type, brand, price_tier, unit,
  description_raw, record_type, description_html, primary_image_locked, tagline
) ON public.products TO anon, authenticated;