/*
  # Create applications table

  1. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles)
      - `opportunity_id` (uuid, references opportunities)
      - `org_id` (uuid, references profiles)
      - `status` (text) - pending, shortlisted, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `applications` table
    - Students can view their own applications
    - Organizations can view applications for their opportunities
    - Students can create applications
    - Organizations can update application status
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  org_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, opportunity_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Organizations can view applications for their opportunities"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = org_id);

CREATE POLICY "Students can create applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Organizations can update application status"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = org_id)
  WITH CHECK (auth.uid() = org_id);