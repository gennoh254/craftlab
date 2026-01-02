/*
  # Fix Opportunities Schema and RLS for Organization Posting

  1. Schema Changes
    - Add `created_by` column to opportunities table (links to profiles.id)
    - Ensure proper foreign key constraints
  
  2. Security (RLS)
    - Organizations can INSERT their own opportunities
    - Organizations can UPDATE/DELETE their own opportunities
    - All authenticated users can view active opportunities
    - Admins can manage all opportunities

  3. Data Integrity
    - Organizations must be the creator to modify opportunities
    - Opportunities default to active status
*/

-- Add created_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN created_by uuid REFERENCES profiles(id) ON DELETE CASCADE;
    CREATE INDEX idx_opportunities_created_by ON opportunities(created_by);
  END IF;
END $$;

-- Drop existing policies to replace them
DROP POLICY IF EXISTS "Admins can manage opportunities" ON opportunities;
DROP POLICY IF EXISTS "Everyone can view active opportunities" ON opportunities;

-- CREATE NEW POLICIES FOR OPPORTUNITIES
-- Policy 1: Everyone can view active opportunities
CREATE POLICY "Everyone can view active opportunities" ON opportunities
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy 2: Organizations can insert opportunities
CREATE POLICY "Organizations can insert opportunities" ON opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM profiles 
      WHERE auth_user_id = auth.uid() AND user_type = 'organization'
    )
  );

-- Policy 3: Organizations can update their own opportunities
CREATE POLICY "Organizations can update own opportunities" ON opportunities
  FOR UPDATE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM profiles 
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    created_by IN (
      SELECT id FROM profiles 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Policy 4: Organizations can delete their own opportunities
CREATE POLICY "Organizations can delete own opportunities" ON opportunities
  FOR DELETE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM profiles 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Policy 5: Admins can manage all opportunities
CREATE POLICY "Admins can manage all opportunities" ON opportunities
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  )
  WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  );

-- Sync existing opportunities with posted_by to created_by if needed
UPDATE opportunities
SET created_by = (SELECT id FROM profiles WHERE id = posted_by LIMIT 1)
WHERE created_by IS NULL AND posted_by IS NOT NULL;
