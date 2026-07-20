-- SECURITY: close the remaining RLS gap. Internal business data (suppliers,
-- purchase orders, stock movements, email logs) was readable by any signed-in
-- customer. Enable RLS on every remaining table and scope by audience.
-- Edge functions use the service role, which bypasses RLS, so they are unaffected.
BEGIN;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname='public'
    AND tablename IN ('ar_frame_3d_models','ar_frame_variants','ar_live_frames','ar_snap_lens_cache','branches','categories','frame_attributes','inventory','lens_attributes','product_reviews','promo_banners','services','shipping_zones','slideshow_items','style_polls','ar_frame_fits','ar_frame_preferences','ar_user_settings','ar_measurements','ar_photo_tryons','ar_sessions','browse_nudge_log','cart_abandonment_events','poll_responses','product_requests','ar_analytics','personalization_analytics','branch_assignments','crm_whatsapp_templates','email_send_log','email_send_state','email_unsubscribe_tokens','image_generation_errors','image_generation_logs','import_history','inventory_transactions','logistics_partners','purchase_order_items','purchase_orders','stock_adjustments','stock_transfer_items','stock_transfers','suppliers','suppressed_emails','user_invitations','zoho_sync_log','zoho_warehouse_mapping','products')
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename); END LOOP;
END $$;

ALTER TABLE public.ar_frame_3d_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_frame_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_live_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_snap_lens_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frame_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lens_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_frame_fits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_frame_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_photo_tryons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browse_nudge_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_abandonment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalization_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_generation_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoho_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoho_warehouse_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public catalog: world-readable, staff-writable.
CREATE POLICY public_read ON public.ar_frame_3d_models FOR SELECT USING (true);
CREATE POLICY staff_write ON public.ar_frame_3d_models FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.ar_frame_variants FOR SELECT USING (true);
CREATE POLICY staff_write ON public.ar_frame_variants FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.ar_live_frames FOR SELECT USING (true);
CREATE POLICY staff_write ON public.ar_live_frames FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.ar_snap_lens_cache FOR SELECT USING (true);
CREATE POLICY staff_write ON public.ar_snap_lens_cache FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.branches FOR SELECT USING (true);
CREATE POLICY staff_write ON public.branches FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.categories FOR SELECT USING (true);
CREATE POLICY staff_write ON public.categories FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.frame_attributes FOR SELECT USING (true);
CREATE POLICY staff_write ON public.frame_attributes FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.inventory FOR SELECT USING (true);
CREATE POLICY staff_write ON public.inventory FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.lens_attributes FOR SELECT USING (true);
CREATE POLICY staff_write ON public.lens_attributes FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY staff_write ON public.product_reviews FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.promo_banners FOR SELECT USING (true);
CREATE POLICY staff_write ON public.promo_banners FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.services FOR SELECT USING (true);
CREATE POLICY staff_write ON public.services FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY staff_write ON public.shipping_zones FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.slideshow_items FOR SELECT USING (true);
CREATE POLICY staff_write ON public.slideshow_items FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY public_read ON public.style_polls FOR SELECT USING (true);
CREATE POLICY staff_write ON public.style_polls FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY reviewer_insert ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- products: only active items are public; wholesale columns stay column-restricted.
CREATE POLICY public_read ON public.products FOR SELECT USING (is_active);
CREATE POLICY staff_write ON public.products FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- User-owned try-on/session data: guests may write, only the owner or staff may read.
CREATE POLICY anyone_insert ON public.ar_frame_fits FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.ar_frame_fits FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.ar_frame_fits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.ar_frame_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.ar_frame_preferences FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.ar_frame_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.ar_user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.ar_user_settings FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.ar_user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.ar_measurements FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.ar_measurements FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.ar_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.ar_photo_tryons FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.ar_photo_tryons FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.ar_photo_tryons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.ar_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.ar_sessions FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.ar_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.browse_nudge_log FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.browse_nudge_log FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.browse_nudge_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.cart_abandonment_events FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.cart_abandonment_events FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.cart_abandonment_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.poll_responses FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.poll_responses FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.poll_responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY anyone_insert ON public.product_requests FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.product_requests FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.product_requests FOR UPDATE USING (auth.uid() = user_id);

-- Aggregate analytics (no owner column): write-only for visitors, staff may read.
CREATE POLICY anyone_insert ON public.ar_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY staff_select ON public.ar_analytics FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY anyone_insert ON public.personalization_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY staff_select ON public.personalization_analytics FOR SELECT USING (public.is_staff(auth.uid()));

-- Internal operations: staff only. Customers get nothing.
CREATE POLICY staff_only ON public.branch_assignments FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.crm_whatsapp_templates FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.email_send_log FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.email_send_state FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.email_unsubscribe_tokens FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.image_generation_errors FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.image_generation_logs FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.import_history FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.inventory_transactions FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.logistics_partners FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.purchase_order_items FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.purchase_orders FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.stock_adjustments FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.stock_transfer_items FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.stock_transfers FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.suppliers FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.suppressed_emails FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.user_invitations FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.zoho_sync_log FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_only ON public.zoho_warehouse_mapping FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

COMMIT;
NOTIFY pgrst, 'reload schema';
