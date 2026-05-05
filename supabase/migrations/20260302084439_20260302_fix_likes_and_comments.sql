/*
  # Fix Likes and Comments Foreign Key References
  
  ## Problem
  The post_likes and comments tables were incorrectly referencing profiles(id) instead of auth.users(id)
  This prevented likes and comments from being properly saved and displayed.
  
  ## Solution
  1. Drop existing policies and constraints on post_likes and comments
  2. Alter foreign key references to use auth.users(id) correctly
  3. Recreate RLS policies with correct auth references
  4. Add UPDATE policy for posts to allow likes_count updates
  
  ## Changes
  - Fixed post_likes.user_id to reference auth.users(id)
  - Fixed comments.user_id to reference auth.users(id)
  - Added policies to allow reading/updating posts likes_count
  - Ensure data integrity with proper cascade rules
*/

DO $$
BEGIN
  -- Drop old policies on post_likes
  DROP POLICY IF EXISTS "Anyone can view likes on public posts" ON post_likes;
  DROP POLICY IF EXISTS "Authenticated users can view likes on their posts" ON post_likes;
  DROP POLICY IF EXISTS "Authenticated users can like posts" ON post_likes;
  DROP POLICY IF EXISTS "Users can unlike own likes" ON post_likes;
  
  -- Drop old policies on comments
  DROP POLICY IF EXISTS "Anyone can view comments on public posts" ON comments;
  DROP POLICY IF EXISTS "Authenticated users can view comments on their posts" ON comments;
  DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
  DROP POLICY IF EXISTS "Users can update own comments" ON comments;
  DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
  
  -- Drop old foreign keys if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'post_likes' AND constraint_name LIKE '%user_id%'
  ) THEN
    ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey CASCADE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'comments' AND constraint_name LIKE '%user_id%'
  ) THEN
    ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey CASCADE;
  END IF;
  
  -- Add correct foreign key for post_likes
  ALTER TABLE post_likes 
  ADD CONSTRAINT post_likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  -- Add correct foreign key for comments
  ALTER TABLE comments 
  ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
END $$;

-- Recreate RLS policies for post_likes
CREATE POLICY "Anyone can view public post likes"
  ON post_likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_likes.post_id
      AND posts.visibility = 'public'
    )
  );

CREATE POLICY "Authenticated users can view own post likes"
  ON post_likes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_likes.post_id
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert likes"
  ON post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recreate RLS policies for comments
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

CREATE POLICY "Authenticated users can view comments on own posts"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert comments"
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

-- Add UPDATE policy for posts to allow likes_count updates
CREATE POLICY "Allow updating posts likes_count"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());
