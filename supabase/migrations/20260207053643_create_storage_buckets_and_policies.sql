/*
  # Create storage buckets and RLS policies

  1. New Buckets
    - `avatars` - For profile pictures (5MB limit, images only)
    - `banners` - For profile banners (5MB limit, images only)
    - `posts-media` - For post media (50MB limit, images, videos, documents)
  
  2. Security
    - Users can only upload/update/delete their own files
    - Anyone can view public files
    - File paths are organized by user ID for security
  
  3. Notes
    - File size limits: 5MB for avatars/banners, 50MB for post media
    - Allowed formats: JPEG, PNG, WebP, GIF for images; MP4, WebM for videos; PDF, DOC for documents
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('banners', 'banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('posts-media', 'posts-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to allow recreation)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
  
  DROP POLICY IF EXISTS "Users can upload their own banner" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own banner" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own banner" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view banners" ON storage.objects;
  
  DROP POLICY IF EXISTS "Users can upload their own post media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own post media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own post media" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view post media" ON storage.objects;
END $$;

-- Create RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Create RLS policies for banners bucket
CREATE POLICY "Users can upload their own banner"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own banner"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own banner"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Create RLS policies for posts-media bucket
CREATE POLICY "Users can upload their own post media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own post media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'posts-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view post media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts-media');
