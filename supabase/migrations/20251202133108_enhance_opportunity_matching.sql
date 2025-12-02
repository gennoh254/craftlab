/*
  # Enhanced Opportunity Matching System

  1. Schema Changes
    - Add `created_by` field to opportunities for organization users
    - Update RLS policies to allow organizations to post opportunities
    - Add portfolio tracking fields to profiles

  2. New Features
    - Organizations can post opportunities directly
    - Enhanced AI matching with portfolio videos
    - Better tracking of user portfolios and skills

  3. Security
    - Organizations can only manage their own opportunities
    - Users can view all active opportunities
    - Proper RLS policies for organization access
*/

-- Add created_by field to opportunities table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN created_by uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add portfolio_url field to profiles for tracking portfolio links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'portfolio_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN portfolio_url text;
  END IF;
END $$;

-- Add cv_url and cv_uploaded_at fields to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cv_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cv_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cv_uploaded_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cv_uploaded_at timestamptz;
  END IF;
END $$;

-- Drop old policies for opportunities
DROP POLICY IF EXISTS "Everyone can view active opportunities" ON opportunities;
DROP POLICY IF EXISTS "Admins can insert opportunities" ON opportunities;
DROP POLICY IF EXISTS "Admins can update opportunities" ON opportunities;
DROP POLICY IF EXISTS "Admins can delete opportunities" ON opportunities;

-- Create new policies for opportunities with organization support
CREATE POLICY "Everyone can view active opportunities" ON opportunities
  FOR SELECT TO authenticated
  USING (is_active = true OR
         created_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
         posted_by IN (SELECT id FROM admin_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organizations and admins can insert opportunities" ON opportunities
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid() AND user_type = 'organization') OR
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  );

CREATE POLICY "Creators and admins can update opportunities" ON opportunities
  FOR UPDATE TO authenticated
  USING (
    created_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
    posted_by IN (SELECT id FROM admin_users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    created_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
    posted_by IN (SELECT id FROM admin_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Creators and admins can delete opportunities" ON opportunities
  FOR DELETE TO authenticated
  USING (
    created_by IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
    posted_by IN (SELECT id FROM admin_users WHERE auth_user_id = auth.uid())
  );

-- Create a view for opportunity matches (for better AI matching)
CREATE OR REPLACE VIEW opportunity_matches AS
SELECT
  o.id as opportunity_id,
  o.title,
  o.company,
  o.location,
  o.type,
  o.salary,
  o.deadline,
  o.requirements,
  o.work_type,
  o.industry,
  p.id as user_id,
  p.name as user_name,
  p.skills,
  p.experience,
  p.education,
  p.preferences,
  p.videos_count,
  p.completion_score
FROM opportunities o
CROSS JOIN profiles p
WHERE o.is_active = true
  AND p.user_type IN ('attachee', 'intern', 'apprentice', 'volunteer');

-- Create function to calculate match score (basic implementation)
CREATE OR REPLACE FUNCTION calculate_match_score(
  user_skills jsonb,
  user_preferences jsonb,
  user_type text,
  opp_requirements jsonb,
  opp_type text,
  opp_location text,
  opp_work_type text
) RETURNS integer AS $$
DECLARE
  score integer := 0;
  user_skill_array text[];
  required_skills text[];
  matched_skills integer := 0;
BEGIN
  -- Extract user skills
  user_skill_array := ARRAY(
    SELECT jsonb_array_elements_text(user_skills->'programming') UNION
    SELECT jsonb_array_elements_text(user_skills->'design') UNION
    SELECT jsonb_array_elements_text(user_skills->'data') UNION
    SELECT jsonb_array_elements_text(user_skills->'business') UNION
    SELECT jsonb_array_elements_text(user_skills->'marketing')
  );

  -- Extract required skills
  required_skills := ARRAY(SELECT jsonb_array_elements_text(opp_requirements->'skills'));

  -- Calculate skills match (35 points max)
  IF array_length(required_skills, 1) > 0 THEN
    SELECT COUNT(*) INTO matched_skills
    FROM unnest(required_skills) AS req_skill
    WHERE EXISTS (
      SELECT 1 FROM unnest(user_skill_array) AS user_skill
      WHERE lower(user_skill) LIKE '%' || lower(req_skill) || '%'
         OR lower(req_skill) LIKE '%' || lower(user_skill) || '%'
    );

    score := score + LEAST((matched_skills * 35 / array_length(required_skills, 1)), 35);
  ELSE
    score := score + 20;
  END IF;

  -- User type compatibility (25 points max)
  IF (user_type = 'attachee' AND opp_type = 'attachment') OR
     (user_type = 'intern' AND opp_type = 'internship') THEN
    score := score + 25;
  ELSIF user_type IN ('attachee', 'intern') AND opp_type IN ('attachment', 'internship') THEN
    score := score + 20;
  ELSE
    score := score + 10;
  END IF;

  -- Work type match (15 points max)
  IF user_preferences->>'workType' = opp_work_type THEN
    score := score + 15;
  ELSIF opp_work_type IN ('remote', 'hybrid') THEN
    score := score + 10;
  ELSE
    score := score + 5;
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON opportunities(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_by ON opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
