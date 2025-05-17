-- Create trigger function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure the auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Insert test user if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'ahmed.m.sharara@gmail.com'
    ) THEN
        INSERT INTO auth.users (
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            'ahmed.m.sharara@gmail.com',
            crypt('123456', gen_salt('bf')),
            now(),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            false,
            'authenticated'
        );
    END IF;
END $$;

-- Ensure profile exists for the test user
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    is_admin,
    onboarding_completed,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Ahmed',
    'Sharara',
    true,
    true,
    now(),
    now()
FROM auth.users u
WHERE u.email = 'ahmed.m.sharara@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
    first_name = 'Ahmed',
    last_name = 'Sharara',
    is_admin = true,
    onboarding_completed = true,
    updated_at = now();