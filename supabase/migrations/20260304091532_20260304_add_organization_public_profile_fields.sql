/*
  # Add Organization Public Profile Display Fields

  1. New Organization Profile Fields
    - `public_profile_headline` - Short headline for org profile
    - `public_description` - Public facing description
    - `logo_url` - Organization logo
    - `banner_url` - Profile banner (already exists from previous migration)
    - `social_links` - JSONB object with social media handles
    - `key_personnel` - JSONB array of key team members
    - `achievements` - JSONB array of awards and achievements
    - `testimonials` - JSONB array of student/partner testimonials
    - `partnership_benefits` - JSONB array of benefits for partners
    - `hiring_team_info` - JSONB with contact info for hiring team
    - `verification_status` - Verification badge status
    - `featured_opportunities` - JSONB array of IDs of featured job posts

  2. Data Structure Examples
    - social_links: { linkedin: url, twitter: handle, instagram: handle, website: url }
    - key_personnel: [{ name, role, image_url, bio }]
    - achievements: [{ title, year, description }]
    - partnership_benefits: [{ title, description, icon }]

  3. Security
    - All fields are nullable for gradual profile completion
    - RLS policies enforce per-organization access
    - Public fields can be queried by authenticated users
    - Organization can update own profile data

  4. Indexes
    - Added indexes for frequently queried fields
*/

DO $$
BEGIN
  -- Public profile information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'public_profile_headline'
  ) THEN
    ALTER TABLE profiles ADD COLUMN public_profile_headline text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'public_description'
  ) THEN
    ALTER TABLE profiles ADD COLUMN public_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN logo_url text;
  END IF;

  -- Social and contact
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE profiles ADD COLUMN social_links jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Team and people
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'key_personnel'
  ) THEN
    ALTER TABLE profiles ADD COLUMN key_personnel jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hiring_team_info'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hiring_team_info jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Achievements and recognition
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'achievements'
  ) THEN
    ALTER TABLE profiles ADD COLUMN achievements jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'testimonials'
  ) THEN
    ALTER TABLE profiles ADD COLUMN testimonials jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Partnership information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'partnership_benefits'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partnership_benefits jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Verification and featured content
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'featured_opportunities'
  ) THEN
    ALTER TABLE profiles ADD COLUMN featured_opportunities jsonb DEFAULT '[]'::jsonb;
  END IF;

END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_logo_url ON profiles(logo_url);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_key_personnel ON profiles USING gin(key_personnel);
CREATE INDEX IF NOT EXISTS idx_profiles_achievements ON profiles USING gin(achievements);
CREATE INDEX IF NOT EXISTS idx_profiles_social_links ON profiles USING gin(social_links);
