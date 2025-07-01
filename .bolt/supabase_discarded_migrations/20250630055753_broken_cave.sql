/*
  # Update Supplement and Audio Cache Policies

  1. Security Changes
    - Modify existing RLS policies if they exist, otherwise create them
    - Update permissions for supplement and audio cache tables
  
  2. Trigger Updates
    - Ensure audio cache cleanup trigger is properly configured
*/

-- Enable RLS on supplements table if not already enabled
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

-- Check if select policy exists for supplements and alter it, otherwise create it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'supplements' AND policyname = 'Anyone can view supplement stacks'
  ) THEN
    ALTER POLICY "Anyone can view supplement stacks" 
      ON supplements
      FOR SELECT
      TO public
      USING (true);
  ELSE
    CREATE POLICY "Anyone can view supplement stacks" 
      ON supplements
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Enable RLS on supplement_forms table if not already enabled
ALTER TABLE supplement_forms ENABLE ROW LEVEL SECURITY;

-- Check if select policy exists for supplement_forms and alter it, otherwise create it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'supplement_forms' AND policyname = 'Anyone can view supplement forms'
  ) THEN
    ALTER POLICY "Anyone can view supplement forms" 
      ON supplement_forms
      FOR SELECT
      TO public
      USING (true);
  ELSE
    CREATE POLICY "Anyone can view supplement forms" 
      ON supplement_forms
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Enable RLS on audio_cache table if not already enabled
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Check and update policies for audio_cache table
DO $$
BEGIN
  -- View own audio cache policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'Users can view their own audio cache'
  ) THEN
    ALTER POLICY "Users can view their own audio cache" 
      ON audio_cache
      FOR SELECT
      TO public
      USING (user_id = auth.uid());
  ELSE
    CREATE POLICY "Users can view their own audio cache" 
      ON audio_cache
      FOR SELECT
      TO public
      USING (user_id = auth.uid());
  END IF;

  -- Insert own audio cache policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'Users can insert their own audio cache'
  ) THEN
    ALTER POLICY "Users can insert their own audio cache" 
      ON audio_cache
      FOR INSERT
      TO public
      WITH CHECK (user_id = auth.uid());
  ELSE
    CREATE POLICY "Users can insert their own audio cache" 
      ON audio_cache
      FOR INSERT
      TO public
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Update own audio cache policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'Users can update their own audio cache'
  ) THEN
    ALTER POLICY "Users can update their own audio cache" 
      ON audio_cache
      FOR UPDATE
      TO public
      USING (user_id = auth.uid());
  ELSE
    CREATE POLICY "Users can update their own audio cache" 
      ON audio_cache
      FOR UPDATE
      TO public
      USING (user_id = auth.uid());
  END IF;

  -- Delete own audio cache policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audio_cache' AND policyname = 'Users can delete their own audio cache'
  ) THEN
    ALTER POLICY "Users can delete their own audio cache" 
      ON audio_cache
      FOR DELETE
      TO public
      USING (user_id = auth.uid());
  ELSE
    CREATE POLICY "Users can delete their own audio cache" 
      ON audio_cache
      FOR DELETE
      TO public
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Ensure the audio cache cleanup function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'trigger_cleanup_audio_cache'
  ) THEN
    CREATE OR REPLACE FUNCTION trigger_cleanup_audio_cache()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Delete expired cache entries
      DELETE FROM audio_cache 
      WHERE expires_at < NOW();
      
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END $$;

-- Ensure the auto cleanup trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'auto_cleanup_audio_cache'
  ) THEN
    CREATE TRIGGER auto_cleanup_audio_cache
      AFTER INSERT OR UPDATE ON audio_cache
      FOR EACH STATEMENT
      EXECUTE FUNCTION trigger_cleanup_audio_cache();
  END IF;
END $$;