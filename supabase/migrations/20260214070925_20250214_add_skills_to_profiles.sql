/*
  # Add Skills Column to Profiles Table

  ## Overview
  Adds a skills column to store an array of user skills for better profile matching
  and AI opportunity matching analysis.

  ## Changes
  - Add `skills` column to profiles table (text array type)
  - Column stores comma-separated or array of skills
  - Default value is empty array

  ## Notes
  - Column is optional (nullable)
  - Used for AI matching algorithm to match students with opportunities
  - Skills should be comma-separated strings like "React, TypeScript, UI Design"
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'skills'
  ) THEN
    ALTER TABLE profiles ADD COLUMN skills text[] DEFAULT '{}';
  END IF;
END $$;
