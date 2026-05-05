/*
  # Posts Table for Public Feed

  ## Overview
  Creates a posts table to store user-generated content (updates, showcases, etc.) 
  for the public feed, enabling students and organizations to share their stories.

  ## New Tables
  - `posts`
    - `id` (uuid, primary key) - Unique identifier for each post
    - `author_id` (uuid, foreign key) - References profiles table
    - `type` (text) - Post type (e.g., 'Showcase', 'Update', 'Skill Demo')
    - `title` (text) - Post title/headline
    - `content` (text) - Main post content/description
    - `tags` (text[]) - Array of hashtags/topics
    - `visibility` (text) - 'public' or 'private' visibility setting
    - `image_url` (text, nullable) - Optional image/media URL
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
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'Update',
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'public',
  image_url text,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all public posts
CREATE POLICY "Anyone can view public posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (visibility = 'public');

-- Policy: Users can view their own posts (public or private)
CREATE POLICY "Users can view own posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Policy: Users can create posts
CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_visibility_idx ON posts(visibility);

-- Create updated_at trigger
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
