/*
  # Update Skills Structure

  ## Overview
  This migration updates the skills structure from category-based (programming, design, data, business, marketing)
  to a flexible array of custom skills where users can define their own skills with descriptions.

  ## Changes

  ### Modified Tables

  #### `profiles`
  - Change `skills` from category-based JSONB to array of skill objects
  - Each skill object contains: {name: string, description: string}

  ## Notes
  - This migration preserves existing data by converting category-based skills to the new format
  - Users can now add any skill they want with custom descriptions
  - No predefined categories or limitations
*/

-- Update existing skills data to new format
DO $$
DECLARE
  profile_record RECORD;
  old_skills JSONB;
  new_skills JSONB;
  category TEXT;
  skill_name TEXT;
  skill_array JSONB;
BEGIN
  -- Loop through all profiles
  FOR profile_record IN SELECT id, skills FROM profiles LOOP
    old_skills := profile_record.skills;
    new_skills := '[]'::JSONB;

    -- Convert old category-based skills to new format
    IF old_skills IS NOT NULL THEN
      FOR category IN SELECT jsonb_object_keys(old_skills) LOOP
        skill_array := old_skills -> category;

        -- Add each skill from the category array to the new format
        FOR skill_name IN SELECT jsonb_array_elements_text(skill_array) LOOP
          new_skills := new_skills || jsonb_build_array(
            jsonb_build_object(
              'name', skill_name,
              'description', ''
            )
          );
        END LOOP;
      END LOOP;

      -- Update the profile with new skills format
      UPDATE profiles
      SET skills = new_skills
      WHERE id = profile_record.id;
    END IF;
  END LOOP;
END $$;

-- Create index for skills search
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN (skills);
