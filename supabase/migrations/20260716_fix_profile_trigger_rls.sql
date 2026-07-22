-- Fix: Update handle_new_user trigger with better error handling and RLS bypass
-- The previous trigger was blocked by RLS policies

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the trigger function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_phone_number TEXT;
BEGIN
  -- Extract data from user metadata
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_phone_number := NEW.raw_user_meta_data->>'phone_number';

  -- Insert profile - use SECURITY DEFINER to bypass RLS
  BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, phone_number)
    VALUES (NEW.id, NEW.email, v_full_name, v_phone_number)
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to insert profile for user %: %', NEW.id, SQLERRM;
  END;

  -- Insert user role
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to insert user role for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
