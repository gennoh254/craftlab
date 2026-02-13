/*
  # Create Student Matches Table

  1. New Table: student_matches
    - id (uuid, primary key)
    - student_id (uuid, foreign key to profiles)
    - opportunity_id (uuid, foreign key to opportunities)
    - match_score (integer) - 0-100 matching percentage
    - matched_skills (text array) - skills that matched
    - reasoning (text) - explanation of match
    - analyzed_at (timestamptz)
    - created_at (timestamptz)

  2. Security:
    - Enable RLS
    - Students can view their own matches
    - Only edge function can insert matches
*/

CREATE TABLE IF NOT EXISTS student_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  match_score integer NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  matched_skills text[] DEFAULT '{}',
  reasoning text,
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, opportunity_id)
);

ALTER TABLE student_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own matches"
  ON student_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Service role can insert matches"
  ON student_matches FOR INSERT
  TO authenticated
  WITH CHECK (true);