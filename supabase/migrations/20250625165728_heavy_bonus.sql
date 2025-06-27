/*
  # Add CV optimization support

  1. Schema Updates
    - Add `original_content` column to cv_sections table to store content before AI optimization
    - This enables rollback functionality for AI-optimized content

  2. Changes
    - Add nullable jsonb column for storing original section content
    - This allows users to revert AI optimizations back to their original content
*/

-- Add original_content column to cv_sections table
DO $$ BEGIN
  ALTER TABLE cv_sections ADD COLUMN original_content jsonb DEFAULT NULL;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Add comment to document the new column
COMMENT ON COLUMN cv_sections.original_content IS 'Stores the original content before AI optimization, enabling rollback functionality';