/*
  # Create Posts Table with Media Support

  ## Overview
  Creates a posts table to store user-generated content (updates, showcases, etc.) 
  for the public feed with support for media attachments (images, videos, files).

  ## New Tables
  - `posts`
    - `id` (uuid, primary key) - Unique identifier for each post
    - `author_id` (uuid, foreign key) - References profiles table
    - `type` (text) - Post type (e.g., 'Showcase', 'Update', 'Skill Demo')
    - `title` (text) - Post title/headline
    - `content` (text) - Main post content/description
    - `tags` (text[]) - Array of hashtags/topics
    - `visibility` (text) - 'public' or 'private' visibility setting
    - `media_url` (text, nullable) - URL of attached media (image/video/file)
    - `media_type` (text, nullable) - Type of media (image, video, file)
    - `likes_count` (integer) - Cached count of likes
    - `created_at` (timestamptz) - Post creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on posts table
  - Allow authenticated users to create their own posts
  - Allow authenticated users to read all public posts
  - Allow users to update/delete only their own posts

  ## Notes
  - Posts are indexed by author_id and created_at for efficient feed queries
  - Tags stored as array for flexible filtering
  - Likes count is denormalized for performance
  - Media URL is optional for text-only posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'Update',
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'public',
  media_url text,
  media_type text,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (visibility = 'public');

CREATE POLICY "Users can view own posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_visibility_idx ON posts(visibility);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
