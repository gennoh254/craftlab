/*
  # Add missing student profile columns

  1. Changes
    - Add `volunteering_history` column for volunteer experience entries
    - Stored as JSONB array to allow multiple volunteer entries with details

  2. Notes
    - Column is nullable to allow students to fill it in gradually
    - Defaults to empty array for consistency with other JSONB fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'volunteering_history'
  ) THEN
    ALTER TABLE profiles ADD COLUMN volunteering_history jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
