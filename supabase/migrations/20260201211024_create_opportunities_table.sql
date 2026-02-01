/*
  # Create Opportunities Table

  1. New Tables
    - `opportunities`
      - `id` (uuid, primary key) - Unique identifier for each opportunity
      - `org_id` (uuid, foreign key) - References the organization that posted this opportunity
      - `role` (text) - Job/role title (e.g., "UX Designer Intern")
      - `type` (text) - Type of opportunity (Internship, Attachment, Apprenticeship, Volunteer)
      - `description` (text) - Detailed description of the opportunity
      - `skills_required` (text) - Comma-separated skills or requirements
      - `start_date` (date) - Expected start date
      - `work_mode` (text) - Remote, On-site, or Hybrid
      - `hours_per_week` (integer) - Expected hours per week
      - `created_at` (timestamptz) - When the opportunity was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `opportunities` table
    - Add policy for public to view all opportunities
    - Add policy for authenticated organizations to create opportunities
    - Add policy for organizations to update/delete their own opportunities

  3. Important Notes
    - Organizations (users with user_type = 'ORGANIZATION') can post opportunities
    - All users (authenticated or not) can view opportunities
    - Only the posting organization can modify or delete their opportunities
*/

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  type text NOT NULL CHECK (type IN ('Internship', 'Attachment', 'Apprenticeship', 'Volunteer')),
  description text NOT NULL,
  skills_required text DEFAULT '',
  start_date date,
  work_mode text CHECK (work_mode IN ('Remote', 'On-site', 'Hybrid')),
  hours_per_week integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opportunities"
  ON opportunities
  FOR SELECT
  USING (true);

CREATE POLICY "Organizations can create opportunities"
  ON opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'ORGANIZATION'
    )
    AND org_id = auth.uid()
  );

CREATE POLICY "Organizations can update own opportunities"
  ON opportunities
  FOR UPDATE
  TO authenticated
  USING (org_id = auth.uid())
  WITH CHECK (org_id = auth.uid());

CREATE POLICY "Organizations can delete own opportunities"
  ON opportunities
  FOR DELETE
  TO authenticated
  USING (org_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_opportunities_org_id ON opportunities(org_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);