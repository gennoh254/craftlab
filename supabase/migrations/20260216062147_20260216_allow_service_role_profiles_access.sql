/*
  # Allow Service Role Access to Profiles

  1. Changes
    - Add policy to allow service role to read profiles table
    - This enables edge functions to fetch profile data for AI matching analysis

  2. Security
    - Service role is Supabase internal and only available server-side
    - No risk to data integrity as service role is trusted
*/

CREATE POLICY "Service role can read all profiles"
  ON profiles
  FOR SELECT
  TO service_role
  USING (true);
