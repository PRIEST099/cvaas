/*
  # Talent Discovery Schema

  1. New Tables
    - `smart_pools` - Saved search criteria for recruiters
    - `candidate_cv_profiles` view - Anonymized CV data for recruiters

  2. Functions
    - `increment_cv_recruiter_view` - Safely increment recruiter view count

  3. Security
    - Enable RLS on smart_pools table
    - Add policies for recruiter access to anonymized candidate data
*/

-- Create smart_pools table for saved search criteria
CREATE TABLE IF NOT EXISTS smart_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  filters jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on smart_pools
ALTER TABLE smart_pools ENABLE ROW LEVEL SECURITY;

-- Create policies for smart_pools
CREATE POLICY "Users can manage their own smart pools"
  ON smart_pools
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Create indexes for smart_pools
CREATE INDEX IF NOT EXISTS idx_smart_pools_created_by ON smart_pools(created_by);
CREATE INDEX IF NOT EXISTS idx_smart_pools_is_active ON smart_pools(is_active);

-- Create trigger for smart_pools updated_at
CREATE TRIGGER update_smart_pools_updated_at
  BEFORE UPDATE ON smart_pools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to safely increment CV recruiter views
CREATE OR REPLACE FUNCTION increment_cv_recruiter_view(cv_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the metadata JSONB column to increment recruiterViews
  UPDATE cvs 
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{recruiterViews}',
    to_jsonb(COALESCE((metadata->>'recruiterViews')::int, 0) + 1),
    true
  )
  WHERE id = cv_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_cv_recruiter_view(uuid) TO authenticated;

-- Create anonymized candidate CV profiles view
CREATE OR REPLACE VIEW candidate_cv_profiles AS
SELECT 
  c.id as cv_id,
  'Candidate #' || substring(c.id::text, 1, 8) as display_name,
  c.title as cv_title,
  c.template_id,
  c.status,
  c.metadata,
  c.created_at,
  c.updated_at,
  -- Aggregate sections data (excluding personal info)
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'section_type', cs.section_type,
        'title', cs.title,
        'content', CASE 
          WHEN cs.section_type = 'personal_info' THEN 
            jsonb_build_object(
              'title', cs.content->>'title',
              'location', cs.content->>'location'
            )
          ELSE cs.content
        END,
        'is_visible', cs.is_visible
      )
    )
    FROM cv_sections cs 
    WHERE cs.cv_id = c.id AND cs.is_visible = true), 
    '[]'::jsonb
  ) as sections,
  -- Aggregate education data
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'institution', e.institution,
        'degree', e.degree,
        'field_of_study', e.field_of_study,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'is_current', e.is_current,
        'gpa', e.gpa
      )
    )
    FROM education e 
    WHERE e.cv_id = c.id), 
    '[]'::jsonb
  ) as education,
  -- Aggregate experience data (anonymized)
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'company', 'Company ' || row_number() OVER (ORDER BY ex.start_date DESC),
        'position', ex.position,
        'location', ex.location,
        'start_date', ex.start_date,
        'end_date', ex.end_date,
        'is_current', ex.is_current,
        'description', ex.description,
        'skills_used', ex.skills_used
      )
    )
    FROM experience ex 
    WHERE ex.cv_id = c.id), 
    '[]'::jsonb
  ) as experience,
  -- Aggregate projects data
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'title', p.title,
        'description', p.description,
        'technologies', p.technologies,
        'start_date', p.start_date,
        'end_date', p.end_date,
        'is_ongoing', p.is_ongoing
      )
    )
    FROM projects p 
    WHERE p.cv_id = c.id), 
    '[]'::jsonb
  ) as projects,
  -- Aggregate skills data
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'name', s.name,
        'category', s.category,
        'proficiency_level', s.proficiency_level,
        'years_experience', s.years_experience,
        'is_verified', s.is_verified
      )
    )
    FROM skills s 
    WHERE s.cv_id = c.id), 
    '[]'::jsonb
  ) as skills
FROM cvs c
JOIN users u ON c.user_id = u.id
WHERE u.role = 'candidate' 
  AND c.is_public = true 
  AND c.status = 'published';

-- Enable RLS on the view
ALTER VIEW candidate_cv_profiles SET (security_barrier = true);

-- Create policy for recruiters to view candidate profiles
CREATE POLICY "Recruiters can view candidate profiles"
  ON candidate_cv_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'recruiter'
    )
  );