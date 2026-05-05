/*
  # Extend profiles table with comprehensive organization fields

  1. Changes to profiles table
    - Add organization-specific columns for ORGANIZATION user types
    - Basic Information: org_type, industry_sector, year_established, registration_number, branches
    - Contact & Location: headquarters_location, website, official_email_domain
    - Organization Overview: about_us, mission_statement, vision, core_values
    - Impact & Culture: employee_count, countries_of_operation, beneficiaries_served, work_culture_description, work_modes

  2. Security
    - RLS policies automatically apply to new columns
    - Organizations can edit their own profile data
    - All authenticated users can view organization profiles

  3. Notes
    - Arrays store multiple locations/work modes as JSONB for flexibility
    - All new fields are nullable - organizations can populate gradually
    - Core_values and branches stored as JSONB arrays for scalability
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'org_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN org_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'industry_sector'
  ) THEN
    ALTER TABLE profiles ADD COLUMN industry_sector text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'year_established'
  ) THEN
    ALTER TABLE profiles ADD COLUMN year_established integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'headquarters_location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN headquarters_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'branch_locations'
  ) THEN
    ALTER TABLE profiles ADD COLUMN branch_locations jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'official_email_domain'
  ) THEN
    ALTER TABLE profiles ADD COLUMN official_email_domain text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'about_us'
  ) THEN
    ALTER TABLE profiles ADD COLUMN about_us text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'mission_statement'
  ) THEN
    ALTER TABLE profiles ADD COLUMN mission_statement text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'vision'
  ) THEN
    ALTER TABLE profiles ADD COLUMN vision text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'core_values'
  ) THEN
    ALTER TABLE profiles ADD COLUMN core_values jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'employee_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN employee_count text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'countries_of_operation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN countries_of_operation jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'beneficiaries_served'
  ) THEN
    ALTER TABLE profiles ADD COLUMN beneficiaries_served text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'work_culture_description'
  ) THEN
    ALTER TABLE profiles ADD COLUMN work_culture_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'work_modes'
  ) THEN
    ALTER TABLE profiles ADD COLUMN work_modes jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organization_pace'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization_pace text;
  END IF;
END $$;
