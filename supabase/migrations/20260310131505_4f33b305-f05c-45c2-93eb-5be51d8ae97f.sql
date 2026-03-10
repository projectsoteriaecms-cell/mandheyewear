
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Default to 'customer' for public signups (can purchase immediately)
    assigned_role := 'customer'::app_role;
  END IF;
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$function$;
