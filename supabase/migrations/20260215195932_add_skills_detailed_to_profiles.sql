/*
  # Add Skills Detailed Field to Profiles

  1. Changes
    - Add `skills_detailed` JSONB field to profiles table to store skills with descriptions
    - This field stores an array of skill objects: [{ id, name, description, proficiency }]

  2. Structure
    - id: unique identifier for each skill entry
    - name: skill name (e.g., "React")
    - description: detailed description of skill experience
    - proficiency: skill level (Beginner, Intermediate, Advanced, Expert)

  3. Notes
    - Keeps existing `skills` field for backward compatibility
    - AI matching will prioritize skills_detailed over skills array
*/

-- Add skills_detailed column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS skills_detailed jsonb DEFAULT '[]'::jsonb;

-- Create an index on skills_detailed for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_skills_detailed ON profiles USING gin(skills_detailed);
