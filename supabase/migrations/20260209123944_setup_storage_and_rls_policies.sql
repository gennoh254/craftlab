/*
  # Setup storage buckets and comprehensive RLS policies

  1. Storage Buckets
    - Create posts-media bucket for post attachments
    - Create avatars bucket for user profile pictures
    - Create banners bucket for user banner images

  2. Security
    - Setup storage policies for authenticated users
    - Add comprehensive RLS policies for all tables
    - Ensure data security across the platform
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('posts-media', 'posts-media', true),
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for posts-media
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
END $$;

-- Storage policies for avatars
DO $$
BEGIN
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
END $$;

-- Storage policies for banners
DO $$
BEGIN
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

-- RLS policies for profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Anyone can view public profiles'
  ) THEN
    CREATE POLICY "Anyone can view public profiles"
      ON profiles
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- RLS policies for posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'posts' 
    AND policyname = 'Anyone can view public posts'
  ) THEN
    CREATE POLICY "Anyone can view public posts"
      ON posts
      FOR SELECT
      TO public
      USING (visibility = 'public');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'posts' 
    AND policyname = 'Users can view own posts'
  ) THEN
    CREATE POLICY "Users can view own posts"
      ON posts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'posts' 
    AND policyname = 'Authenticated users can create posts'
  ) THEN
    CREATE POLICY "Authenticated users can create posts"
      ON posts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'posts' 
    AND policyname = 'Users can update own posts'
  ) THEN
    CREATE POLICY "Users can update own posts"
      ON posts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = author_id)
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'posts' 
    AND policyname = 'Users can delete own posts'
  ) THEN
    CREATE POLICY "Users can delete own posts"
      ON posts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = author_id);
  END IF;
END $$;

-- RLS policies for opportunities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'opportunities' 
    AND policyname = 'Anyone can view opportunities'
  ) THEN
    CREATE POLICY "Anyone can view opportunities"
      ON opportunities
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'opportunities' 
    AND policyname = 'Organizations can create opportunities'
  ) THEN
    CREATE POLICY "Organizations can create opportunities"
      ON opportunities
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = org_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'opportunities' 
    AND policyname = 'Organizations can update own opportunities'
  ) THEN
    CREATE POLICY "Organizations can update own opportunities"
      ON opportunities
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = org_id)
      WITH CHECK (auth.uid() = org_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'opportunities' 
    AND policyname = 'Organizations can delete own opportunities'
  ) THEN
    CREATE POLICY "Organizations can delete own opportunities"
      ON opportunities
      FOR DELETE
      TO authenticated
      USING (auth.uid() = org_id);
  END IF;
END $$;