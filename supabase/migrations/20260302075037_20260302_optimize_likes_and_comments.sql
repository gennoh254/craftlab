/*
  # Optimize Likes and Comments Performance

  1. Indexes Added
    - Index on post_likes for faster like queries
    - Index on comments for faster comment queries
    - Indexes for post_id lookups to improve query performance

  2. Ensures proper RLS policies are in place
    - User can like/unlike their own likes
    - User can view all public post likes and comments
    - User can create comments on public posts
*/

DO $$
BEGIN
  -- Create index for post_likes queries by post_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'post_likes' AND indexname = 'idx_post_likes_post_id'
  ) THEN
    CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
  END IF;

  -- Create index for post_likes queries by user_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'post_likes' AND indexname = 'idx_post_likes_user_id'
  ) THEN
    CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
  END IF;

  -- Create index for comments queries by post_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'comments' AND indexname = 'idx_comments_post_id'
  ) THEN
    CREATE INDEX idx_comments_post_id ON comments(post_id);
  END IF;

  -- Create index for comments queries by user_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'comments' AND indexname = 'idx_comments_user_id'
  ) THEN
    CREATE INDEX idx_comments_user_id ON comments(user_id);
  END IF;

  -- Create composite index for post_likes uniqueness
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'post_likes' AND indexname = 'idx_post_likes_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_post_likes_unique ON post_likes(post_id, user_id);
  END IF;
END $$;

-- Ensure RLS policies exist for post_likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'post_likes' AND policyname = 'Users can view all post likes'
  ) THEN
    CREATE POLICY "Users can view all post likes"
      ON post_likes FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'post_likes' AND policyname = 'Users can like posts'
  ) THEN
    CREATE POLICY "Users can like posts"
      ON post_likes FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'post_likes' AND policyname = 'Users can unlike their own likes'
  ) THEN
    CREATE POLICY "Users can unlike their own likes"
      ON post_likes FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure RLS policies exist for comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comments' AND policyname = 'Users can view all comments'
  ) THEN
    CREATE POLICY "Users can view all comments"
      ON comments FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comments' AND policyname = 'Users can create comments'
  ) THEN
    CREATE POLICY "Users can create comments"
      ON comments FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comments' AND policyname = 'Users can delete their own comments'
  ) THEN
    CREATE POLICY "Users can delete their own comments"
      ON comments FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
