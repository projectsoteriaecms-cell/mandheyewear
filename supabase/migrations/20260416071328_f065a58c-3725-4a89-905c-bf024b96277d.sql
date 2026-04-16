
-- Cart abandonment tracking table
CREATE TABLE public.cart_abandonment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cart_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_value numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'NGN',
  abandoned_at timestamptz NOT NULL DEFAULT now(),
  step_1_sent_at timestamptz,
  step_2_sent_at timestamptz,
  step_3_sent_at timestamptz,
  discount_code text,
  recovered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cart_abandonment_events ENABLE ROW LEVEL SECURITY;

-- Staff can view for analytics
CREATE POLICY "Staff can view abandonment events"
ON public.cart_abandonment_events
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'branch_staff'::app_role)
  OR has_role(auth.uid(), 'branch_manager'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Browse nudge log for rate limiting
CREATE TABLE public.browse_nudge_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id),
  sent_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.browse_nudge_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view nudge logs"
ON public.browse_nudge_log
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'branch_staff'::app_role)
  OR has_role(auth.uid(), 'branch_manager'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Trigger: mark abandonment as recovered when order is placed
CREATE OR REPLACE FUNCTION public.mark_abandonment_recovered()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cart_abandonment_events
  SET recovered_at = now()
  WHERE user_id = NEW.user_id
    AND recovered_at IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_mark_abandonment_recovered
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.mark_abandonment_recovered();

-- Index for efficient cron queries
CREATE INDEX idx_cart_abandonment_user ON public.cart_abandonment_events(user_id, recovered_at);
CREATE INDEX idx_cart_abandonment_steps ON public.cart_abandonment_events(recovered_at, step_1_sent_at, step_2_sent_at, step_3_sent_at);
CREATE INDEX idx_browse_nudge_user ON public.browse_nudge_log(user_id, sent_at);
