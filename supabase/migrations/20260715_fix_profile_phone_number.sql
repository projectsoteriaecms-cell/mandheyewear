-- Fix: Update handle_new_user trigger to include phone_number
-- Previously it was only extracting full_name, now it also gets phone_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, phone_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  RETURN NEW;
END;
$$;
