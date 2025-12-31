/*
  # Add Terms & Conditions Acceptance Tracking

  1. New Columns
    - `terms_accepted` (boolean) - Whether user has accepted T&C
    - `terms_accepted_at` (timestamp) - When user accepted T&C
  
  2. Changes
    - Add these columns to profiles table to track T&C acceptance
    - Default to false so users must accept before full access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'terms_accepted'
  ) THEN
    ALTER TABLE profiles ADD COLUMN terms_accepted BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;
END $$;
