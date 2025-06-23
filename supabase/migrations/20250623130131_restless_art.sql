/*
  # Create CV sections table

  1. New Tables
    - `cv_sections`
      - `id` (uuid, primary key)
      - `cv_id` (uuid, foreign key to cvs)
      - `section_type` (text) - type of section
      - `title` (text) - section title
      - `content` (jsonb) - section content
      - `display_order` (integer) - display order
      - `is_visible` (boolean) - visibility flag
      - `ai_optimized` (boolean) - AI optimization flag
      - `created_at` (timestamptz) - creation timestamp
      - `updated_at` (timestamptz) - last update timestamp

  2. Security
    - Enable RLS on `cv_sections` table
    - Add policies for section access control
*/

-- Create CV sections table
CREATE TABLE IF NOT EXISTS cv_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  title text NOT NULL,
  content jsonb DEFAULT '{}',
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  ai_optimized boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cv_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage sections of their own CVs"
  ON cv_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = cv_sections.cv_id 
      AND cvs.user_id = auth.uid()
    )
  );

CREATE POLICY "Public CV sections are readable"
  ON cv_sections
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = cv_sections.cv_id 
      AND cvs.is_public = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_cv_sections_updated_at
  BEFORE UPDATE ON cv_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cv_sections_cv_id ON cv_sections(cv_id);
CREATE INDEX IF NOT EXISTS idx_cv_sections_type ON cv_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_cv_sections_order ON cv_sections(cv_id, display_order);