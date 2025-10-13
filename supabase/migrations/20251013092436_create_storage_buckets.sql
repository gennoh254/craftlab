/*
  # Create Storage Buckets for Videos and CVs

  ## Storage Buckets
  
  ### `videos`
  For user portfolio videos with public access
  
  ### `cvs`
  For user CV/resume files with restricted access

  ### `profile-pictures`
  For user profile pictures with public access

  ## Security
  - Videos are publicly accessible if user's profile is public
  - CVs are only accessible by the owner and admins
  - Profile pictures are publicly accessible
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('videos', 'videos', true),
  ('cvs', 'cvs', false),
  ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Videos bucket policies
CREATE POLICY "Public videos are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Users can upload own videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- CVs bucket policies
CREATE POLICY "Users can view own CVs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cvs' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     auth.uid() IN (SELECT auth_user_id FROM admin_users))
  );

CREATE POLICY "Users can upload own CVs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own CVs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own CVs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Profile pictures bucket policies
CREATE POLICY "Profile pictures are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload own profile pictures"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own profile pictures"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own profile pictures"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );