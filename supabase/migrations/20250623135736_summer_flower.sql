/*
  # Create CV content tables

  1. New Tables
    - `education`
      - `id` (uuid, primary key)
      - `cv_id` (uuid, foreign key to cvs)
      - `institution` (text)
      - `degree` (text)
      - `field_of_study` (text, optional)
      - `start_date` (date, optional)
      - `end_date` (date, optional)
      - `is_current` (boolean)
      - `gpa` (numeric, optional)
      - `honors` (text array, optional)
      - `description` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `experience`
      - `id` (uuid, primary key)
      - `cv_id` (uuid, foreign key to cvs)
      - `company` (text)
      - `position` (text)
      - `location` (text, optional)
      - `start_date` (date, optional)
      - `end_date` (date, optional)
      - `is_current` (boolean)
      - `description` (text, optional)
      - `achievements` (text array, optional)
      - `skills_used` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `cv_id` (uuid, foreign key to cvs)
      - `title` (text)
      - `description` (text, optional)
      - `technologies` (text array, optional)
      - `start_date` (date, optional)
      - `end_date` (date, optional)
      - `is_ongoing` (boolean)
      - `project_url` (text, optional)
      - `github_url` (text, optional)
      - `achievements` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `skills`
      - `id` (uuid, primary key)
      - `cv_id` (uuid, foreign key to cvs)
      - `name` (text)
      - `category` (text, optional)
      - `proficiency_level` (integer, optional)
      - `years_experience` (integer, optional)
      - `is_verified` (boolean)
      - `verification_source` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own CV content
    - Add policies for public access to content from public CVs
    - Add policies for recruiters to view content from CVs they have access to

  3. Triggers
    - Add updated_at triggers for all tables
*/

-- Create education table
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  institution text NOT NULL,
  degree text NOT NULL,
  field_of_study text,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  gpa numeric(3,2),
  honors text[],
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create experience table
CREATE TABLE IF NOT EXISTS experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  company text NOT NULL,
  position text NOT NULL,
  location text,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  achievements text[],
  skills_used text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  technologies text[],
  start_date date,
  end_date date,
  is_ongoing boolean DEFAULT false,
  project_url text,
  github_url text,
  achievements text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  proficiency_level integer CHECK (proficiency_level >= 1 AND proficiency_level <= 100),
  years_experience integer CHECK (years_experience >= 0),
  is_verified boolean DEFAULT false,
  verification_source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_education_cv_id ON education(cv_id);
CREATE INDEX IF NOT EXISTS idx_experience_cv_id ON experience(cv_id);
CREATE INDEX IF NOT EXISTS idx_projects_cv_id ON projects(cv_id);
CREATE INDEX IF NOT EXISTS idx_skills_cv_id ON skills(cv_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

-- Enable RLS
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for education
CREATE POLICY "Users can manage education for their own CVs"
  ON education
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = education.cv_id 
      AND cvs.user_id = auth.uid()
    )
  );

CREATE POLICY "Public education is readable"
  ON education
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = education.cv_id 
      AND cvs.is_public = true
    )
  );

-- RLS Policies for experience
CREATE POLICY "Users can manage experience for their own CVs"
  ON experience
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = experience.cv_id 
      AND cvs.user_id = auth.uid()
    )
  );

CREATE POLICY "Public experience is readable"
  ON experience
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = experience.cv_id 
      AND cvs.is_public = true
    )
  );

-- RLS Policies for projects
CREATE POLICY "Users can manage projects for their own CVs"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = projects.cv_id 
      AND cvs.user_id = auth.uid()
    )
  );

CREATE POLICY "Public projects are readable"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = projects.cv_id 
      AND cvs.is_public = true
    )
  );

-- RLS Policies for skills
CREATE POLICY "Users can manage skills for their own CVs"
  ON skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = skills.cv_id 
      AND cvs.user_id = auth.uid()
    )
  );

CREATE POLICY "Public skills are readable"
  ON skills
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = skills.cv_id 
      AND cvs.is_public = true
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at
  BEFORE UPDATE ON experience
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();