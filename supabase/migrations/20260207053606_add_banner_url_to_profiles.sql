/*
  # Add banner URL to profiles table

  1. Changes
    - Add `banner_url` column to `profiles` table to store user banner images
  
  2. Notes
    - Column is optional (nullable) to allow profiles without custom banners
    - Default is NULL for existing profiles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banner_url text;
  END IF;
END $$;
