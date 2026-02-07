/*
  # Create Post Likes Table

  1. New Tables
    - `post_likes`
      - `id` (uuid, primary key) - Unique identifier
      - `post_id` (uuid, foreign key) - References the post being liked
      - `user_id` (uuid, foreign key) - References the user who liked the post
      - `created_at` (timestamptz) - When the like was created
      - Unique constraint on (post_id, user_id) to prevent duplicate likes

  2. Security
    - Enable RLS on post_likes table
    - Allow anyone to view likes on public posts
    - Allow authenticated users to like posts
    - Allow users to unlike only their own likes

  3. Notes
    - Composite unique index on post_id and user_id prevents duplicate likes
    - Used for tracking likes and updating posts likes_count
*/

CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes on public posts"
  ON post_likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_likes.post_id
      AND posts.visibility = 'public'
    )
  );

CREATE POLICY "Authenticated users can view likes on their posts"
  ON post_likes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_likes.post_id
      AND (posts.visibility = 'public' OR posts.author_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can like posts"
  ON post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
  ON post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS post_likes_post_user_idx ON post_likes(post_id, user_id);
