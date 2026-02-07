/*
  # Create Comments Table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key) - Unique identifier for each comment
      - `post_id` (uuid, foreign key) - References the post being commented on
      - `user_id` (uuid, foreign key) - References the user who made the comment
      - `content` (text) - Comment text content
      - `created_at` (timestamptz) - When the comment was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on comments table
    - Allow anyone to view comments on public posts
    - Allow authenticated users to create comments
    - Allow users to update/delete only their own comments

  3. Notes
    - Comments are indexed by post_id for efficient retrieval
    - Automatic timestamp management for updates
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on public posts"
  ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND posts.visibility = 'public'
    )
  );

CREATE POLICY "Authenticated users can view comments on their posts"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND (posts.visibility = 'public' OR posts.author_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
