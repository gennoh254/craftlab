/*
  # Create Applications Table

  1. New Tables
    - `applications`
      - `id` (uuid, primary key) - Unique identifier for each application
      - `opportunity_id` (uuid, foreign key) - References the opportunity
      - `student_id` (uuid, foreign key) - References the student applying
      - `status` (text) - Application status (Applied, Reviewing, Interview, Accepted, Rejected)
      - `applied_at` (timestamptz) - When the application was submitted
      - `updated_at` (timestamptz) - Last status update timestamp
      - Unique constraint on (opportunity_id, student_id) to prevent duplicate applications

  2. Security
    - Enable RLS on applications table
    - Allow authenticated students to view their own applications
    - Allow authenticated organizations to view applications to their opportunities
    - Allow students to create applications
    - Allow students to withdraw their applications
    - Allow organizations to update application status

  3. Notes
    - Applications are indexed by opportunity_id and student_id for efficient queries
    - Status must be one of: Applied, Reviewing, Interview, Accepted, Rejected
    - Composite unique index prevents students from applying twice to same opportunity
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Reviewing', 'Interview', 'Accepted', 'Rejected')),
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(opportunity_id, student_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Organizations can view applications to their opportunities"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = applications.opportunity_id
      AND opportunities.org_id = auth.uid()
    )
  );

CREATE POLICY "Students can create applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'STUDENT'
    )
  );

CREATE POLICY "Students can withdraw own applications"
  ON applications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Organizations can update status of applications to their opportunities"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = applications.opportunity_id
      AND opportunities.org_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = applications.opportunity_id
      AND opportunities.org_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS applications_opportunity_id_idx ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS applications_student_id_idx ON applications(student_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
CREATE INDEX IF NOT EXISTS applications_applied_at_idx ON applications(applied_at DESC);

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
