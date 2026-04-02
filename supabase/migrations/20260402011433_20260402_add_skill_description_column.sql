/*
  # Add Skill Description Column

  1. Changes
    - Add `skill_description` field to the `skills_detailed` JSON structure
    - This allows students to provide detailed descriptions for each skill they add
  
  2. Notes
    - The `skills_detailed` column stores skill entries as JSONB with: name, description, proficiency
    - This is a structural change and doesn't require table modifications
    - Existing data will continue to work; new entries will include the description field
*/

-- No migration needed - skills_detailed is a JSONB column that already supports the description field
-- The change is purely in the application layer where we'll ensure the description field is captured and saved
SELECT 1;