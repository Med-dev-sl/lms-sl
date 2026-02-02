-- Create a function to handle school registration after user signup
-- This runs as SECURITY DEFINER to bypass RLS and create the school + assign role
CREATE OR REPLACE FUNCTION public.register_school_with_admin(
    _school_name TEXT,
    _school_email TEXT,
    _school_slug TEXT,
    _user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _school_id UUID;
BEGIN
    -- Create the school
    INSERT INTO public.schools (name, email, slug)
    VALUES (_school_name, _school_email, _school_slug)
    RETURNING id INTO _school_id;
    
    -- Update the user's profile with the school_id
    UPDATE public.profiles
    SET school_id = _school_id
    WHERE id = _user_id;
    
    -- Assign the school_admin role to the user
    INSERT INTO public.user_roles (user_id, role, school_id)
    VALUES (_user_id, 'school_admin', _school_id);
    
    RETURN _school_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.register_school_with_admin TO authenticated;