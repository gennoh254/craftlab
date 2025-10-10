/*
  # Create Profile Pictures Storage Bucket
  
  1. Storage Setup
    - Creates `profile-pictures` bucket for user profile images
    - Sets bucket to public for easy access
    - Configures file size limit (5MB)
    - Allowed file types: jpg, jpeg, png, webp
  
  2. Security
    - RLS policies for upload (users can only upload their own pictures)
    - Public read access for all profile pictures
    - Users can delete their own profile pictures
*/

-- Create profile-pictures storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload own profile picture"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own profile pictures
CREATE POLICY "Users can update own profile picture"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own profile pictures
CREATE POLICY "Users can delete own profile picture"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to all profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
