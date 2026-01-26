-- Update existing test accounts to their correct roles
UPDATE public.user_roles 
SET role = 'branch_staff'
WHERE user_id = (
  SELECT user_id FROM public.profiles 
  WHERE email = 'staff@soteriaeyeclinic.com'
);

UPDATE public.user_roles 
SET role = 'branch_manager'
WHERE user_id = (
  SELECT user_id FROM public.profiles 
  WHERE email = 'manager@soteriaeyeclinic.com'
);

-- Update the handle_new_user function to auto-assign roles based on email patterns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  assigned_role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Determine role based on email pattern
  assigned_role := CASE
    WHEN NEW.email LIKE 'admin@%' THEN 'super_admin'::app_role
    WHEN NEW.email LIKE 'manager@%' THEN 'branch_manager'::app_role
    WHEN NEW.email LIKE 'staff@%' THEN 'branch_staff'::app_role
    ELSE 'customer'::app_role
  END;
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;