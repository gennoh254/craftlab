/*
  # Ensure Storage Buckets for Media Upload

  ## Overview
  Creates and configures storage buckets for posts, avatars, and banners with proper
  RLS policies to allow authenticated users to upload and public access to view files.

  ## Buckets
  - `posts-media`: For post images, videos, and files
  - `avatars`: For user profile pictures
  - `banners`: For user banner images

  ## Security
  - Authenticated users can upload to their respective buckets
  - Public can view all files from these buckets
  - Each bucket has proper RLS policies configured
*/

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('posts-media', 'posts-media', true),
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload post media'
  ) THEN
    CREATE POLICY "Authenticated users can upload post media"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'posts-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view post media'
  ) THEN
    CREATE POLICY "Anyone can view post media"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'posts-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload avatars'
  ) THEN
    CREATE POLICY "Authenticated users can upload avatars"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view avatars'
  ) THEN
    CREATE POLICY "Anyone can view avatars"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload banners'
  ) THEN
    CREATE POLICY "Authenticated users can upload banners"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'banners');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view banners'
  ) THEN
    CREATE POLICY "Anyone can view banners"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'banners');
  END IF;
END $$;
