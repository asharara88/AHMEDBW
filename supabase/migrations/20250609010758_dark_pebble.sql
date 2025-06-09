/*
  # Audio Cache System

  1. New Tables
    - `audio_cache`: Stores cached audio data for text-to-speech responses
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `cache_key` (text)
      - `audio_data` (bytea)
      - `content_type` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
  
  2. Security
    - Enable RLS on `audio_cache` table
    - Add policies for authenticated users to manage their own audio cache
  
  3. Maintenance
    - Add function and trigger for automatic cleanup of expired cache entries
*/

-- Create audio_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS audio_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key text NOT NULL,
  audio_data bytea NOT NULL,
  content_type text NOT NULL DEFAULT 'audio/mpeg',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create unique index on user_id and cache_key if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'audio_cache_user_id_cache_key_idx'
  ) THEN
    CREATE UNIQUE INDEX audio_cache_user_id_cache_key_idx ON audio_cache (user_id, cache_key);
  END IF;
END $$;

-- Create index on expires_at for cleanup operations if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'audio_cache_expires_at_idx'
  ) THEN
    CREATE INDEX audio_cache_expires_at_idx ON audio_cache (expires_at);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'Users can read their own audio cache'
  ) THEN
    CREATE POLICY "Users can read their own audio cache"
      ON audio_cache
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'Users can insert their own audio cache'
  ) THEN
    CREATE POLICY "Users can insert their own audio cache"
      ON audio_cache
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'Users can update their own audio cache'
  ) THEN
    CREATE POLICY "Users can update their own audio cache"
      ON audio_cache
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'Users can delete their own audio cache'
  ) THEN
    CREATE POLICY "Users can delete their own audio cache"
      ON audio_cache
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create function to clean up expired cache entries if it doesn't exist
CREATE OR REPLACE FUNCTION cleanup_expired_audio_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM audio_cache
  WHERE expires_at < now();
END;
$$;

-- Create a trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_audio_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM cleanup_expired_audio_cache();
  RETURN NEW;
END;
$$;

-- Create a trigger that runs the cleanup function periodically if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'cleanup_expired_audio_cache_trigger'
  ) THEN
    CREATE TRIGGER cleanup_expired_audio_cache_trigger
    AFTER INSERT ON audio_cache
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_cleanup_expired_audio_cache();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Handle case where pg_trigger doesn't exist in some Postgres versions
    -- Try creating the trigger anyway, and let it fail if it already exists
    BEGIN
      CREATE TRIGGER cleanup_expired_audio_cache_trigger
      AFTER INSERT ON audio_cache
      FOR EACH STATEMENT
      EXECUTE FUNCTION trigger_cleanup_expired_audio_cache();
    EXCEPTION
      WHEN duplicate_object THEN
        -- Trigger already exists, do nothing
        NULL;
    END;
END $$;