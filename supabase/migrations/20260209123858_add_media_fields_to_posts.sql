/*
  # Add media fields to posts table

  1. Changes
    - Add `media_url` column to store uploaded media URLs
    - Add `media_type` column to store type of media (image, video, file)
    - Remove dependency on `image_url` (will be replaced by media_url)
  
  2. Notes
    - Existing image_url data will be preserved
    - media_type will help distinguish between different file types
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'media_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN media_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE posts ADD COLUMN media_type text CHECK (media_type IN ('image', 'video', 'file'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'banner_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banner_url text;
  END IF;
END $$;