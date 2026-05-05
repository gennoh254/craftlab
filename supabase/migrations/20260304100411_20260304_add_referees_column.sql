/*
  # Add referees column to profiles table

  1. Changes
    - Add `referees` column to store referee information for students
    - Stored as text to allow flexible formatting of multiple referees

  2. Notes
    - Column is nullable to allow students to fill it in gradually
    - Supports both structured list and "Available upon request" format
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'referees'
  ) THEN
    ALTER TABLE profiles ADD COLUMN referees text;
  END IF;
END $$;
