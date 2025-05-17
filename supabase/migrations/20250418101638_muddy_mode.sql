/*
  # Initial Biowell Schema

  1. New Tables
    - `profiles`: User profiles with admin flag and onboarding status
    - `health_metrics`: Daily health metrics from wearables
    - `quiz_responses`: Onboarding quiz responses
    - `wearable_connections`: OAuth connections to wearable devices
    - `supplements`: Supplement catalog
    - `user_supplements`: User's subscribed supplements
    - `chat_history`: AI coach chat history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add admin policies for supplement management
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Health metrics table (from wearables)
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  deep_sleep NUMERIC,
  rem_sleep NUMERIC,
  steps INTEGER,
  calories INTEGER,
  heart_rate INTEGER,
  bmi NUMERIC,
  weight NUMERIC,
  cgm NUMERIC,
  health_score INTEGER,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Quiz responses
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  health_goals TEXT[],
  sleep_hours NUMERIC,
  exercise_frequency TEXT,
  diet_preference TEXT,
  stress_level TEXT,
  existing_conditions TEXT[],
  medications TEXT[],
  supplements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Wearable connections
CREATE TABLE IF NOT EXISTS wearable_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, provider)
);

-- Supplements catalog
CREATE TABLE IF NOT EXISTS supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT[],
  dosage TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- User subscribed supplements
CREATE TABLE IF NOT EXISTS user_supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
  subscription_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, supplement_id)
);

-- Chat history
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Health metrics policies
CREATE POLICY "Users can view their own health metrics"
  ON health_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health metrics"
  ON health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Quiz responses policies
CREATE POLICY "Users can view their own quiz responses"
  ON quiz_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz responses"
  ON quiz_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Wearable connections policies
CREATE POLICY "Users can view their own wearable connections"
  ON wearable_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wearable connections"
  ON wearable_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wearable connections"
  ON wearable_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wearable connections"
  ON wearable_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Supplements policies
CREATE POLICY "Anyone can view active supplements"
  ON supplements FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can insert supplements"
  ON supplements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can update supplements"
  ON supplements FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- User supplements policies
CREATE POLICY "Users can view their own supplement subscriptions"
  ON user_supplements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplement subscriptions"
  ON user_supplements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement subscriptions"
  ON user_supplements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement subscriptions"
  ON user_supplements FOR DELETE
  USING (auth.uid() = user_id);

-- Chat history policies
CREATE POLICY "Users can view their own chat history"
  ON chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);