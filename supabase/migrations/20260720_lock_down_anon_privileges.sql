-- SECURITY: the anon role held SELECT/INSERT/UPDATE on ~93 tables with RLS
-- disabled, so anyone holding the public key could read customer PII and
-- modify products, orders and user_roles. Reset anon to least privilege and
-- grant back only what the public storefront needs.
BEGIN;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;

-- Public catalog: readable without signing in.
GRANT SELECT ON
  public.categories, public.branches, public.services, public.inventory,
  public.frame_attributes, public.lens_attributes, public.promo_banners,
  public.slideshow_items, public.style_polls, public.product_reviews,
  public.shipping_zones, public.ar_frame_3d_models, public.ar_frame_variants,
  public.ar_live_frames, public.ar_snap_lens_cache,
  public.crm_email_preference_categories
TO anon;

-- products keeps column-level grants so wholesale/ERP fields stay hidden.
GRANT SELECT (
  additional_images, brand, brand_line, bridge_size, category_id, color,
  created_at, currency, description, description_html, description_raw,
  frame_width, gender, id, image_url, is_active, is_prescription_compatible,
  item_type, material, name, price, price_tier, primary_image_locked,
  record_type, sku, style, tagline, temple_length, unit, updated_at
) ON public.products TO anon;

-- Write paths a logged-out visitor legitimately uses (capture + telemetry).
GRANT INSERT ON
  public.newsletter_subscribers, public.vto_email_leads, public.poll_responses,
  public.product_requests, public.user_activity, public.ar_analytics,
  public.personalization_analytics, public.cart_abandonment_events,
  public.browse_nudge_log, public.ar_sessions,
  public.ar_photo_tryons, public.ar_measurements
TO anon;

COMMIT;
NOTIFY pgrst, 'reload schema';
