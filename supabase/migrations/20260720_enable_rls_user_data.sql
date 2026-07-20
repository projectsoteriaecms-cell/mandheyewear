-- SECURITY: RLS was disabled on the user-data tables, so any signed-in
-- customer could read every other customer's profile, orders, prescriptions
-- and the full user_roles table (revealing which account is super_admin).
-- Enable RLS and scope each table to "your own rows, or staff".
BEGIN;

-- Staff check. SECURITY DEFINER so policies on user_roles don't recurse.
CREATE OR REPLACE FUNCTION public.is_staff(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND role IN ('branch_staff','branch_manager','admin','super_admin')
  )
$$;

-- Drop any pre-existing (inert) policies on the tables we are securing.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN (
      'profiles','user_roles','orders','order_items','appointments','cart_items',
      'wishlist','prescriptions','user_prescriptions','user_measurements',
      'notifications','user_activity','vto_email_leads','newsletter_subscribers')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prescriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_measurements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vto_email_leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Own-row tables: read/write your own, staff may read all.
CREATE POLICY own_select ON public.profiles           FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_insert ON public.profiles           FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY own_update ON public.profiles           FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY own_select ON public.user_roles         FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY admin_write ON public.user_roles        FOR ALL USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE POLICY own_select ON public.orders             FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_insert ON public.orders             FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY staff_update ON public.orders           FOR UPDATE USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY own_select ON public.order_items        FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY own_insert ON public.order_items        FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));
CREATE POLICY staff_update ON public.order_items      FOR UPDATE USING (public.is_staff(auth.uid()));

CREATE POLICY own_select ON public.appointments       FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_insert ON public.appointments       FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY own_update ON public.appointments       FOR UPDATE USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY own_all ON public.cart_items            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY own_all ON public.wishlist              FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY own_all ON public.user_measurements     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY own_select ON public.prescriptions      FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_insert ON public.prescriptions      FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY own_select ON public.user_prescriptions FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_insert ON public.user_prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY own_update ON public.user_prescriptions FOR UPDATE USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY own_select ON public.notifications      FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY own_update ON public.notifications      FOR UPDATE USING (auth.uid() = user_id);

-- Telemetry: anyone may write, only the owner or staff may read.
CREATE POLICY anyone_insert ON public.user_activity   FOR INSERT WITH CHECK (true);
CREATE POLICY own_select ON public.user_activity      FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Lead capture: anyone may submit, only staff may read the list.
CREATE POLICY anyone_insert ON public.vto_email_leads FOR INSERT WITH CHECK (true);
CREATE POLICY staff_select ON public.vto_email_leads  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY anyone_insert ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY staff_select ON public.newsletter_subscribers  FOR SELECT USING (public.is_staff(auth.uid()));

COMMIT;
NOTIFY pgrst, 'reload schema';
