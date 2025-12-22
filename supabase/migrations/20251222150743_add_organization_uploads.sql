/*
  # Add Organization Upload Fields

  1. Changes
    - Add company_logo field to profiles table (URL to uploaded logo)
    - Add registration_certificate field to profiles table (URL to uploaded certificate)
    - Add certificate_verification_status field to track verification status

  2. Security
    - Maintain existing RLS policies
    - Organizations can update their own logo and certificate
*/

-- Add company logo and registration certificate fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company_logo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_logo TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'registration_certificate'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_certificate TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'certificate_verification_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN certificate_verification_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN profiles.company_logo IS 'URL to company logo image';
COMMENT ON COLUMN profiles.registration_certificate IS 'URL to official registration certificate';
COMMENT ON COLUMN profiles.certificate_verification_status IS 'Status: pending, verified, rejected';