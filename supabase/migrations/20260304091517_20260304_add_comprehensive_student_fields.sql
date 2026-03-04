/*
  # Add Comprehensive Student Profile Fields

  1. New Student Profile Fields
    - `contact_email` - Preferred email for contact
    - `contact_phone` - Phone number
    - `address` - Current address/location
    - `professional_summary` - Professional headline/bio
    - `education` - JSONB array of education entries
    - `employment_history` - JSONB array of employment records
    - `media_links` - JSONB object with portfolio/social links
    - `interests` - JSONB array of career interests
    - `languages` - JSONB array of languages known
    - `certifications` - JSONB array of certifications/achievements
    - `projects` - JSONB array of personal/academic projects
    - `extracurricular` - JSONB array of extracurricular activities
    - `location_preference` - JSONB array of preferred work locations
    - `work_mode_preference` - JSONB array of preferred work modes
    - `availability` - Text field for availability status
    - `open_to_roles` - JSONB array of job types student is seeking
    - `bio` - Longer biographical information

  2. Data Structure Examples
    - education: [{ degree, institution, field_of_study, graduation_year }]
    - employment_history: [{ job_title, company_name, start_date, end_date, description }]
    - media_links: { linkedin: url, github: url, portfolio: url, ... }
    - skills_detailed: [{ name, proficiency, years_of_experience, description }]

  3. Security
    - All fields are nullable for gradual profile completion
    - RLS policies already enforce per-user access
    - Fields are student-specific and won't affect organizations

  4. Indexes
    - Added GIN indexes on JSONB fields for better query performance
*/

DO $$
BEGIN
  -- Student contact fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN contact_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN contact_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;

  -- Student professional fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'professional_summary'
  ) THEN
    ALTER TABLE profiles ADD COLUMN professional_summary text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;

  -- Student education and experience
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'education'
  ) THEN
    ALTER TABLE profiles ADD COLUMN education jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'employment_history'
  ) THEN
    ALTER TABLE profiles ADD COLUMN employment_history jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Student media and portfolio
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'media_links'
  ) THEN
    ALTER TABLE profiles ADD COLUMN media_links jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Student interests and preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'interests'
  ) THEN
    ALTER TABLE profiles ADD COLUMN interests jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'languages'
  ) THEN
    ALTER TABLE profiles ADD COLUMN languages jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE profiles ADD COLUMN certifications jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'projects'
  ) THEN
    ALTER TABLE profiles ADD COLUMN projects jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'extracurricular'
  ) THEN
    ALTER TABLE profiles ADD COLUMN extracurricular jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Student work preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_preference jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'work_mode_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN work_mode_preference jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'availability'
  ) THEN
    ALTER TABLE profiles ADD COLUMN availability text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'open_to_roles'
  ) THEN
    ALTER TABLE profiles ADD COLUMN open_to_roles jsonb DEFAULT '[]'::jsonb;
  END IF;

END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_education ON profiles USING gin(education);
CREATE INDEX IF NOT EXISTS idx_profiles_employment_history ON profiles USING gin(employment_history);
CREATE INDEX IF NOT EXISTS idx_profiles_skills_detailed ON profiles USING gin(skills_detailed);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING gin(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_certifications ON profiles USING gin(certifications);
CREATE INDEX IF NOT EXISTS idx_profiles_projects ON profiles USING gin(projects);
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON profiles USING gin(languages);
