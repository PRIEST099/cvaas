/*
  # Create talent discovery infrastructure for recruiters

  1. New Tables
    - `smart_pools` - Saved search criteria for recruiters

  2. Functions
    - `increment_cv_recruiter_view()` - Track recruiter views on CVs
    - `get_anonymized_candidate_cv()` - Get full anonymized CV data
    - `search_candidate_profiles()` - Search and filter candidate profiles

  3. Views
    - `candidate_cv_profiles` - Simplified view for candidate listing

  4. Security
    - RLS policies for smart pools
    - Function-level security for recruiter-only access
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
  -- Check if the requesting user is a recruiter
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'recruiter'
  ) THEN
    RETURN false;
  END IF;

  -- Update the metadata JSONB column to increment recruiterViews
  UPDATE cvs 
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{recruiterViews}',
    to_jsonb(COALESCE((metadata->>'recruiterViews')::int, 0) + 1),
    true
  )
  WHERE id = cv_id
    AND is_public = true;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_cv_recruiter_view(uuid) TO authenticated;

-- Create function to get anonymized candidate CV profile
CREATE OR REPLACE FUNCTION get_anonymized_candidate_cv(cv_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cv_data jsonb;
  experience_data jsonb;
  company_counter integer := 1;
  exp_record record;
BEGIN
  -- Check if the requesting user is a recruiter
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'recruiter'
  ) THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  -- Get basic CV data
  SELECT jsonb_build_object(
    'cv_id', c.id,
    'display_name', 'Candidate #' || substring(c.id::text, 1, 8),
    'cv_title', c.title,
    'template_id', c.template_id,
    'status', c.status,
    'metadata', c.metadata,
    'created_at', c.created_at,
    'updated_at', c.updated_at
  ) INTO cv_data
  FROM cvs c
  JOIN users u ON c.user_id = u.id
  WHERE c.id = cv_id
    AND u.role = 'candidate'
    AND c.is_public = true
    AND c.status = 'published';

  IF cv_data IS NULL THEN
    RETURN jsonb_build_object('error', 'CV not found or not accessible');
  END IF;

  -- Increment the recruiter view count
  PERFORM increment_cv_recruiter_view(cv_id);

  -- Add sections (excluding personal info)
  cv_data := cv_data || jsonb_build_object(
    'sections',
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
      WHERE cs.cv_id = cv_id AND cs.is_visible = true), 
      '[]'::jsonb
    )
  );

  -- Add education
  cv_data := cv_data || jsonb_build_object(
    'education',
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
        ) ORDER BY e.start_date DESC
      )
      FROM education e 
      WHERE e.cv_id = cv_id), 
      '[]'::jsonb
    )
  );

  -- Add anonymized experience
  experience_data := '[]'::jsonb;
  FOR exp_record IN 
    SELECT * FROM experience 
    WHERE cv_id = cv_id 
    ORDER BY start_date DESC
  LOOP
    experience_data := experience_data || jsonb_build_array(
      jsonb_build_object(
        'company', 'Company ' || company_counter,
        'position', exp_record.position,
        'location', exp_record.location,
        'start_date', exp_record.start_date,
        'end_date', exp_record.end_date,
        'is_current', exp_record.is_current,
        'description', exp_record.description,
        'skills_used', exp_record.skills_used
      )
    );
    company_counter := company_counter + 1;
  END LOOP;

  cv_data := cv_data || jsonb_build_object('experience', experience_data);

  -- Add projects
  cv_data := cv_data || jsonb_build_object(
    'projects',
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'title', p.title,
          'description', p.description,
          'technologies', p.technologies,
          'start_date', p.start_date,
          'end_date', p.end_date,
          'is_ongoing', p.is_ongoing
        ) ORDER BY p.start_date DESC
      )
      FROM projects p 
      WHERE p.cv_id = cv_id), 
      '[]'::jsonb
    )
  );

  -- Add skills
  cv_data := cv_data || jsonb_build_object(
    'skills',
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'name', s.name,
          'category', s.category,
          'proficiency_level', s.proficiency_level,
          'years_experience', s.years_experience,
          'is_verified', s.is_verified
        ) ORDER BY s.category, s.name
      )
      FROM skills s 
      WHERE s.cv_id = cv_id), 
      '[]'::jsonb
    )
  );

  RETURN cv_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_anonymized_candidate_cv(uuid) TO authenticated;

-- Create simplified view for candidate CV profiles list
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
  -- Get summary data for search/filtering
  (
    SELECT string_agg(s.name, ', ')
    FROM skills s 
    WHERE s.cv_id = c.id
    LIMIT 10
  ) as skills_summary,
  (
    SELECT string_agg(DISTINCT ex.position, ', ')
    FROM experience ex 
    WHERE ex.cv_id = c.id
    LIMIT 5
  ) as positions_summary,
  (
    SELECT string_agg(DISTINCT e.degree || CASE WHEN e.field_of_study IS NOT NULL THEN ' in ' || e.field_of_study ELSE '' END, ', ')
    FROM education e 
    WHERE e.cv_id = c.id
    LIMIT 3
  ) as education_summary,
  (
    SELECT MAX(EXTRACT(YEAR FROM AGE(COALESCE(ex.end_date::date, CURRENT_DATE), ex.start_date::date)))
    FROM experience ex 
    WHERE ex.cv_id = c.id
    AND ex.start_date IS NOT NULL
  ) as max_experience_years
FROM cvs c
JOIN users u ON c.user_id = u.id
WHERE u.role = 'candidate' 
  AND c.is_public = true 
  AND c.status = 'published';

-- Create function to search candidate profiles
CREATE OR REPLACE FUNCTION search_candidate_profiles(
  search_query text DEFAULT NULL,
  skills_filter text[] DEFAULT NULL,
  min_experience integer DEFAULT NULL,
  location_filter text DEFAULT NULL,
  education_filter text DEFAULT NULL,
  page_number integer DEFAULT 1,
  page_size integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count integer;
  profiles jsonb;
  offset_val integer;
BEGIN
  -- Check if the requesting user is a recruiter
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'recruiter'
  ) THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  offset_val := (page_number - 1) * page_size;

  -- Get total count for pagination
  SELECT COUNT(*) INTO total_count
  FROM candidate_cv_profiles cp
  WHERE (search_query IS NULL OR (
    cp.cv_title ILIKE '%' || search_query || '%' OR
    cp.skills_summary ILIKE '%' || search_query || '%' OR
    cp.positions_summary ILIKE '%' || search_query || '%'
  ))
  AND (skills_filter IS NULL OR EXISTS (
    SELECT 1 FROM skills s 
    WHERE s.cv_id = cp.cv_id 
    AND s.name = ANY(skills_filter)
  ))
  AND (min_experience IS NULL OR cp.max_experience_years >= min_experience)
  AND (location_filter IS NULL OR EXISTS (
    SELECT 1 FROM experience ex 
    WHERE ex.cv_id = cp.cv_id 
    AND ex.location ILIKE '%' || location_filter || '%'
  ))
  AND (education_filter IS NULL OR cp.education_summary ILIKE '%' || education_filter || '%');

  -- Get paginated results
  SELECT jsonb_agg(
    jsonb_build_object(
      'cv_id', cp.cv_id,
      'display_name', cp.display_name,
      'cv_title', cp.cv_title,
      'skills_summary', cp.skills_summary,
      'positions_summary', cp.positions_summary,
      'education_summary', cp.education_summary,
      'max_experience_years', cp.max_experience_years,
      'created_at', cp.created_at
    )
  ) INTO profiles
  FROM candidate_cv_profiles cp
  WHERE (search_query IS NULL OR (
    cp.cv_title ILIKE '%' || search_query || '%' OR
    cp.skills_summary ILIKE '%' || search_query || '%' OR
    cp.positions_summary ILIKE '%' || search_query || '%'
  ))
  AND (skills_filter IS NULL OR EXISTS (
    SELECT 1 FROM skills s 
    WHERE s.cv_id = cp.cv_id 
    AND s.name = ANY(skills_filter)
  ))
  AND (min_experience IS NULL OR cp.max_experience_years >= min_experience)
  AND (location_filter IS NULL OR EXISTS (
    SELECT 1 FROM experience ex 
    WHERE ex.cv_id = cp.cv_id 
    AND ex.location ILIKE '%' || location_filter || '%'
  ))
  AND (education_filter IS NULL OR cp.education_summary ILIKE '%' || education_filter || '%')
  ORDER BY cp.created_at DESC
  LIMIT page_size OFFSET offset_val;

  RETURN jsonb_build_object(
    'profiles', COALESCE(profiles, '[]'::jsonb),
    'total', total_count,
    'page', page_number,
    'page_size', page_size,
    'total_pages', CEIL(total_count::float / page_size)
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_candidate_profiles(text, text[], integer, text, text, integer, integer) TO authenticated;