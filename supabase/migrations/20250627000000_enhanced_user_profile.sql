/*ning
  # Enhanced User Profile Schema

  1. New Tables
    - Updates profiles table with comprehensive user data fields
    - Ensures compatibility with enhanced onboarding flow

  2. Changes
    - Add comprehensive health and lifestyle fields to profiles table
    - Add JSON columns for complex data structures
    - Add indexes for performance

  3. Security
    - Maintains existing RLS policies
*/

-- Add new columns to profiles table for enhanced onboarding
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS height JSONB,
ADD COLUMN IF NOT EXISTS weight JSONB,
ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active')),
ADD COLUMN IF NOT EXISTS primary_health_goals TEXT[],
ADD COLUMN IF NOT EXISTS secondary_health_goals TEXT[],
ADD COLUMN IF NOT EXISTS health_concerns TEXT[],
ADD COLUMN IF NOT EXISTS fitness_goals TEXT[],
ADD COLUMN IF NOT EXISTS sleep_hours DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS bed_time TIME,
ADD COLUMN IF NOT EXISTS wake_time TIME,
ADD COLUMN IF NOT EXISTS sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
ADD COLUMN IF NOT EXISTS exercise_frequency TEXT CHECK (exercise_frequency IN ('never', 'rarely', '1-2-times', '3-4-times', '5-6-times', 'daily')),
ADD COLUMN IF NOT EXISTS exercise_types TEXT[],
ADD COLUMN IF NOT EXISTS diet_preference TEXT CHECK (diet_preference IN ('omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'mediterranean', 'other')),
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[],
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS stress_triggers TEXT[],
ADD COLUMN IF NOT EXISTS mental_health_goals TEXT[],
ADD COLUMN IF NOT EXISTS meditation_experience TEXT CHECK (meditation_experience IN ('none', 'beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS current_supplements TEXT[],
ADD COLUMN IF NOT EXISTS medication_list TEXT[],
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
ADD COLUMN IF NOT EXISTS doctor_consultation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS communication_preferences JSONB,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add corresponding fields to quiz_responses table for backward compatibility
ALTER TABLE quiz_responses
ADD COLUMN IF NOT EXISTS secondary_health_goals TEXT[],
ADD COLUMN IF NOT EXISTS health_concerns TEXT[],
ADD COLUMN IF NOT EXISTS fitness_goals TEXT[],
ADD COLUMN IF NOT EXISTS bed_time TIME,
ADD COLUMN IF NOT EXISTS wake_time TIME,
ADD COLUMN IF NOT EXISTS sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
ADD COLUMN IF NOT EXISTS exercise_types TEXT[],
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[],
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS stress_triggers TEXT[],
ADD COLUMN IF NOT EXISTS mental_health_goals TEXT[],
ADD COLUMN IF NOT EXISTS meditation_experience TEXT CHECK (meditation_experience IN ('none', 'beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS current_supplements TEXT[],
ADD COLUMN IF NOT EXISTS medication_list TEXT[],
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
ADD COLUMN IF NOT EXISTS doctor_consultation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS height JSONB,
ADD COLUMN IF NOT EXISTS weight JSONB,
ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_health_goals ON profiles USING GIN(primary_health_goals);
CREATE INDEX IF NOT EXISTS idx_profiles_fitness_goals ON profiles USING GIN(fitness_goals);
CREATE INDEX IF NOT EXISTS idx_profiles_diet_preference ON profiles(diet_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_activity_level ON profiles(activity_level);

-- Add comments for documentation
COMMENT ON COLUMN profiles.height IS 'User height stored as JSON with value and unit fields';
COMMENT ON COLUMN profiles.weight IS 'User weight stored as JSON with value and unit fields';
COMMENT ON COLUMN profiles.communication_preferences IS 'User communication preferences stored as JSON';
COMMENT ON COLUMN profiles.privacy_settings IS 'User privacy settings stored as JSON';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when user completed onboarding process';
