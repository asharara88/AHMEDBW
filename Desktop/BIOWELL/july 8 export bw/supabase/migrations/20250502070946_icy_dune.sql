/*
  # Add Demo User and Update Auth Handling

  1. Changes
    - Add demo user with specified credentials
    - Update profiles table with demo user data
    - Set admin privileges for demo user

  2. Security
    - Password is hashed by Supabase auth system
    - User will have normal authenticated access
*/

-- First, ensure the auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Insert the demo user into auth.users if not exists
INSERT INTO auth.users (
  id,
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
)
SELECT 
  gen_random_uuid(),
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
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'ahmed.m.sharara@gmail.com'
);

-- Update the profiles table with the demo user
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