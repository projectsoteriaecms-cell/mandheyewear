
-- Product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.product_reviews
FOR SELECT
USING (status = 'approved');

-- Staff can view all reviews
CREATE POLICY "Staff can view all reviews"
ON public.product_reviews
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'branch_staff'::app_role) OR
  has_role(auth.uid(), 'branch_manager'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Users can create own reviews
CREATE POLICY "Users can create own reviews"
ON public.product_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews"
ON public.product_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete own reviews
CREATE POLICY "Users can delete own reviews"
ON public.product_reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Staff can moderate reviews
CREATE POLICY "Staff can moderate reviews"
ON public.product_reviews
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'branch_manager'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Index for fast product lookups
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);

-- Timestamp trigger
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-check verified purchase
CREATE OR REPLACE FUNCTION public.check_verified_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_verified_purchase := EXISTS (
    SELECT 1
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.product_id = NEW.product_id
      AND o.user_id = NEW.user_id
      AND o.order_status = 'delivered'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_verified_purchase
BEFORE INSERT ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.check_verified_purchase();
