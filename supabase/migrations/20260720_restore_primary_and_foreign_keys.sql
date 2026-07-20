-- Restore primary keys, unique constraints, and foreign keys that were
-- defined in migrations but never applied to the live database.
-- Without FKs, PostgREST cannot resolve embedded selects (e.g.
-- appointments -> branches), so those queries failed with HTTP 400.

BEGIN;

-- Clean up user_roles rows that ON DELETE CASCADE would already have removed
-- if the foreign key had been present: duplicates and rows for deleted users.
DELETE FROM public.user_roles a USING public.user_roles b
  WHERE a.ctid > b.ctid AND a.user_id = b.user_id AND a.role = b.role;
DELETE FROM public.user_roles r
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = r.user_id);

-- Primary keys
ALTER TABLE public.appointments ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);
ALTER TABLE public.branch_assignments ADD CONSTRAINT branch_assignments_pkey PRIMARY KEY (id);
ALTER TABLE public.branches ADD CONSTRAINT branches_pkey PRIMARY KEY (id);
ALTER TABLE public.browse_nudge_log ADD CONSTRAINT browse_nudge_log_pkey PRIMARY KEY (id);
ALTER TABLE public.cart_abandonment_events ADD CONSTRAINT cart_abandonment_events_pkey PRIMARY KEY (id);
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
ALTER TABLE public.categories ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE public.email_send_log ADD CONSTRAINT email_send_log_pkey PRIMARY KEY (id);
ALTER TABLE public.email_send_state ADD CONSTRAINT email_send_state_pkey PRIMARY KEY (id);
ALTER TABLE public.email_unsubscribe_tokens ADD CONSTRAINT email_unsubscribe_tokens_pkey PRIMARY KEY (id);
ALTER TABLE public.frame_attributes ADD CONSTRAINT frame_attributes_pkey PRIMARY KEY (id);
ALTER TABLE public.import_history ADD CONSTRAINT import_history_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.lens_attributes ADD CONSTRAINT lens_attributes_pkey PRIMARY KEY (id);
ALTER TABLE public.logistics_partners ADD CONSTRAINT logistics_partners_pkey PRIMARY KEY (id);
ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.order_items ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
ALTER TABLE public.orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE public.personalization_analytics ADD CONSTRAINT personalization_analytics_pkey PRIMARY KEY (id);
ALTER TABLE public.poll_responses ADD CONSTRAINT poll_responses_pkey PRIMARY KEY (id);
ALTER TABLE public.prescriptions ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);
ALTER TABLE public.product_requests ADD CONSTRAINT product_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.product_reviews ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);
ALTER TABLE public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.promo_banners ADD CONSTRAINT promo_banners_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);
ALTER TABLE public.services ADD CONSTRAINT services_pkey PRIMARY KEY (id);
ALTER TABLE public.shipping_zones ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);
ALTER TABLE public.slideshow_items ADD CONSTRAINT slideshow_items_pkey PRIMARY KEY (id);
ALTER TABLE public.stock_adjustments ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);
ALTER TABLE public.stock_transfer_items ADD CONSTRAINT stock_transfer_items_pkey PRIMARY KEY (id);
ALTER TABLE public.stock_transfers ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);
ALTER TABLE public.style_polls ADD CONSTRAINT style_polls_pkey PRIMARY KEY (id);
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);
ALTER TABLE public.suppressed_emails ADD CONSTRAINT suppressed_emails_pkey PRIMARY KEY (id);
ALTER TABLE public.user_activity ADD CONSTRAINT user_activity_pkey PRIMARY KEY (id);
ALTER TABLE public.user_invitations ADD CONSTRAINT user_invitations_pkey PRIMARY KEY (id);
ALTER TABLE public.user_measurements ADD CONSTRAINT user_measurements_pkey PRIMARY KEY (id);
ALTER TABLE public.user_prescriptions ADD CONSTRAINT user_prescriptions_pkey PRIMARY KEY (id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
ALTER TABLE public.vto_email_leads ADD CONSTRAINT vto_email_leads_pkey PRIMARY KEY (id);
ALTER TABLE public.wishlist ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);
ALTER TABLE public.zoho_sync_log ADD CONSTRAINT zoho_sync_log_pkey PRIMARY KEY (id);
ALTER TABLE public.zoho_warehouse_mapping ADD CONSTRAINT zoho_warehouse_mapping_pkey PRIMARY KEY (id);

-- Unique constraints
ALTER TABLE public.branch_assignments ADD CONSTRAINT branch_assignments_user_id_branch_id_key UNIQUE (user_id, branch_id);
ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
ALTER TABLE public.email_unsubscribe_tokens ADD CONSTRAINT email_unsubscribe_tokens_token_key UNIQUE (token);
ALTER TABLE public.email_unsubscribe_tokens ADD CONSTRAINT email_unsubscribe_tokens_email_key UNIQUE (email);
ALTER TABLE public.frame_attributes ADD CONSTRAINT frame_attributes_product_id_key UNIQUE (product_id);
ALTER TABLE public.inventory ADD CONSTRAINT inventory_product_id_branch_id_key UNIQUE (product_id, branch_id);
ALTER TABLE public.lens_attributes ADD CONSTRAINT lens_attributes_product_id_key UNIQUE (product_id);
ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
ALTER TABLE public.product_reviews ADD CONSTRAINT product_reviews_product_id_user_id_key UNIQUE (product_id, user_id);
ALTER TABLE public.products ADD CONSTRAINT products_sku_key UNIQUE (sku);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_order_number_key UNIQUE (order_number);
ALTER TABLE public.shipping_zones ADD CONSTRAINT shipping_zones_zone_key_key UNIQUE (zone_key);
ALTER TABLE public.stock_transfers ADD CONSTRAINT stock_transfers_transfer_number_key UNIQUE (transfer_number);
ALTER TABLE public.suppressed_emails ADD CONSTRAINT suppressed_emails_email_key UNIQUE (email);
ALTER TABLE public.user_invitations ADD CONSTRAINT user_invitations_email_invitation_token_key UNIQUE (email, invitation_token);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
ALTER TABLE public.wishlist ADD CONSTRAINT wishlist_user_id_product_id_key UNIQUE (user_id, product_id);
ALTER TABLE public.zoho_warehouse_mapping ADD CONSTRAINT zoho_warehouse_mapping_zoho_location_id_key UNIQUE (zoho_location_id);

-- Foreign keys
ALTER TABLE public.appointments ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.branch_assignments ADD CONSTRAINT branch_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.branch_assignments ADD CONSTRAINT branch_assignments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.browse_nudge_log ADD CONSTRAINT browse_nudge_log_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);
ALTER TABLE public.frame_attributes ADD CONSTRAINT frame_attributes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.inventory ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.inventory ADD CONSTRAINT inventory_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);
ALTER TABLE public.lens_attributes ADD CONSTRAINT lens_attributes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD CONSTRAINT orders_fulfillment_branch_id_fkey FOREIGN KEY (fulfillment_branch_id) REFERENCES public.branches(id);
ALTER TABLE public.poll_responses ADD CONSTRAINT poll_responses_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.style_polls(id) ON DELETE CASCADE;
ALTER TABLE public.prescriptions ADD CONSTRAINT prescriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.product_requests ADD CONSTRAINT product_requests_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.product_reviews ADD CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);
ALTER TABLE public.slideshow_items ADD CONSTRAINT slideshow_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.stock_adjustments ADD CONSTRAINT stock_adjustments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);
ALTER TABLE public.stock_adjustments ADD CONSTRAINT stock_adjustments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.stock_transfer_items ADD CONSTRAINT stock_transfer_items_stock_transfer_id_fkey FOREIGN KEY (stock_transfer_id) REFERENCES public.stock_transfers(id) ON DELETE CASCADE;
ALTER TABLE public.stock_transfer_items ADD CONSTRAINT stock_transfer_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE public.stock_transfers ADD CONSTRAINT stock_transfers_from_branch_id_fkey FOREIGN KEY (from_branch_id) REFERENCES public.branches(id);
ALTER TABLE public.stock_transfers ADD CONSTRAINT stock_transfers_to_branch_id_fkey FOREIGN KEY (to_branch_id) REFERENCES public.branches(id);
ALTER TABLE public.user_activity ADD CONSTRAINT user_activity_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.user_prescriptions ADD CONSTRAINT user_prescriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.vto_email_leads ADD CONSTRAINT vto_email_leads_frame_id_fkey FOREIGN KEY (frame_id) REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.wishlist ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.wishlist ADD CONSTRAINT wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.zoho_warehouse_mapping ADD CONSTRAINT zoho_warehouse_mapping_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);

COMMIT;

NOTIFY pgrst, 'reload schema';