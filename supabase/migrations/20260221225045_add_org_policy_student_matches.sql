/*
  # Add Organization Access Policy for Student Matches

  1. Security Enhancement
    - Add RLS policy for organizations to view matches for their opportunities
    - Organizations can only see matches for opportunities they created
    - This allows the AI Matched Students section on org dashboard to work correctly

  2. Changes
    - CREATE POLICY: Organizations can view matches for their opportunities
*/

-- Allow organizations to view student matches for opportunities they posted
CREATE POLICY "Organizations can view matches for their opportunities"
  ON student_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = student_matches.opportunity_id
      AND opportunities.org_id = auth.uid()
    )
  );
