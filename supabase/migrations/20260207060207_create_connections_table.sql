/*
  # Create Connections/Follows Table

  1. New Tables
    - `connections`
      - `id` (uuid, primary key) - Unique identifier
      - `follower_id` (uuid, foreign key) - User who is following
      - `following_id` (uuid, foreign key) - User being followed
      - `created_at` (timestamptz) - When the connection was made
      - Unique constraint on (follower_id, following_id) to prevent duplicate follows

  2. Security
    - Enable RLS on connections table
    - Allow anyone to view public profiles' followers/following
    - Allow authenticated users to follow profiles
    - Allow users to unfollow only their own follows

  3. Notes
    - Supports one-directional following (follower_id follows following_id)
    - Composite unique index prevents duplicate follows
    - Used for building social network and discovery features
    - Indexed for fast follower/following queries
*/

CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view connections"
  ON connections
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow profiles"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow profiles"
  ON connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS connections_follower_id_idx ON connections(follower_id);
CREATE INDEX IF NOT EXISTS connections_following_id_idx ON connections(following_id);
CREATE INDEX IF NOT EXISTS connections_follower_following_idx ON connections(follower_id, following_id);
