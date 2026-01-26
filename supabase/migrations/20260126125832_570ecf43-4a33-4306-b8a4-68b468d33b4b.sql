-- Create invitations table for user invitations
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  invited_by UUID NOT NULL,
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, invitation_token)
);

-- Create index for token lookups
CREATE INDEX idx_user_invitations_token ON public.user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Only super_admins and branch_managers can view invitations
CREATE POLICY "Managers can view invitations"
ON public.user_invitations
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'branch_manager')
);

-- Only super_admins can create invitations
CREATE POLICY "Super admins can create invitations"
ON public.user_invitations
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Only super_admins can update invitations
CREATE POLICY "Super admins can update invitations"
ON public.user_invitations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Only super_admins can delete invitations
CREATE POLICY "Super admins can delete invitations"
ON public.user_invitations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Update handle_new_user to check for pending invitations and assign the invited role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  assigned_role app_role;
  invitation_record RECORD;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Check for pending invitation first
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF invitation_record IS NOT NULL THEN
    -- Use the invited role
    assigned_role := invitation_record.role;
    
    -- Mark invitation as accepted
    UPDATE public.user_invitations
    SET accepted_at = now()
    WHERE id = invitation_record.id;
  ELSE
    -- Determine role based on email pattern (fallback)
    assigned_role := CASE
      WHEN NEW.email LIKE 'admin@%' THEN 'super_admin'::app_role
      WHEN NEW.email LIKE 'manager@%' THEN 'branch_manager'::app_role
      WHEN NEW.email LIKE 'staff@%' THEN 'branch_staff'::app_role
      ELSE 'customer'::app_role
    END;
  END IF;
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;