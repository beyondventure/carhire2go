-- Fix: move role assignment into the handle_new_user trigger so it runs as
-- SECURITY DEFINER and is atomic with the auth.users INSERT. Previously, the
-- client-side INSERT into user_roles was blocked by RLS (no INSERT policy for
-- regular users), leaving zombie auth users and causing "User already registered"
-- on any subsequent signup attempt with the same email.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  -- Read role from signup metadata; default to 'consumer'.
  -- Reject 'admin' — that role must be granted manually by an existing admin.
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'consumer');
  IF v_role NOT IN ('consumer', 'provider', 'driver') THEN
    v_role := 'consumer';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role::app_role);

  RETURN NEW;
END;
$$;
