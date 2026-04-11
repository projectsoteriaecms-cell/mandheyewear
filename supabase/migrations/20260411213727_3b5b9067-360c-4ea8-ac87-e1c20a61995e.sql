
-- Create user_activity table for behavioral tracking
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  category text,
  search_query text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast user-specific queries
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id, created_at DESC);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type, created_at DESC);
CREATE INDEX idx_user_activity_product ON public.user_activity(product_id) WHERE product_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Users can insert their own activity
CREATE POLICY "Users can insert own activity"
ON public.user_activity
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
ON public.user_activity
FOR SELECT
USING (auth.uid() = user_id);

-- Staff/admins can view all activity for analytics
CREATE POLICY "Staff can view all activity"
ON public.user_activity
FOR SELECT
USING (
  has_role(auth.uid(), 'branch_staff'::app_role) OR
  has_role(auth.uid(), 'branch_manager'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Update handle_new_user to auto-subscribe to newsletter
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role app_role;
  invitation_record RECORD;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Auto-subscribe to newsletter (ignore if already exists)
  INSERT INTO public.newsletter_subscribers (email)
  VALUES (NEW.email)
  ON CONFLICT (email) DO NOTHING;
  
  -- Check for pending invitation first
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF invitation_record IS NOT NULL THEN
    assigned_role := invitation_record.role;
    UPDATE public.user_invitations
    SET accepted_at = now()
    WHERE id = invitation_record.id;
  ELSE
    assigned_role := 'customer'::app_role;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;
