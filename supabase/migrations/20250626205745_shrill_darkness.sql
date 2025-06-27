/*
  # Fix candidate invitation system and recruiter view

  1. Changes
    - Add candidate_invitations table for recruiters to invite candidates
    - Update get_anonymized_candidate_cv function to include user_id
    - Update candidate_cv_profiles view to include user_id
    - Update search_candidate_profiles function to return user_id
    - Add conditional checks to prevent errors on existing objects
*/

-- Create candidate_invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS candidate_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruiter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id uuid REFERENCES quests(id) ON DELETE SET NULL,
  cv_id uuid NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  response_at timestamptz,
  response_message text
);

-- Create indexes for candidate_invitations
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_candidate_id ON candidate_invitations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_recruiter_id ON candidate_invitations(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_quest_id ON candidate_invitations(quest_id);
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_status ON candidate_invitations(status);
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_expires_at ON candidate_invitations(expires_at);

-- Enable RLS on candidate_invitations
ALTER TABLE candidate_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for candidate_invitations (with checks to prevent duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'candidate_invitations' 
    AND policyname = 'Recruiters can manage their own invitations'
  ) THEN
    CREATE POLICY "Recruiters can manage their own invitations"
      ON candidate_invitations
      FOR ALL
      TO authenticated
      USING (recruiter_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'candidate_invitations' 
    AND policyname = 'Candidates can view invitations sent to them'
  ) THEN
    CREATE POLICY "Candidates can view invitations sent to them"
      ON candidate_invitations
      FOR SELECT
      TO authenticated
      USING (candidate_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'candidate_invitations' 
    AND policyname = 'Candidates can update invitations to respond'
  ) THEN
    CREATE POLICY "Candidates can update invitations to respond"
      ON candidate_invitations
      FOR UPDATE
      TO authenticated
      USING (candidate_id = auth.uid())
      WITH CHECK (
        candidate_id = auth.uid() AND 
        status = 'pending' AND 
        expires_at > now()
      );
  END IF;
END$$;

-- Create smart_pools table if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'smart_pools') THEN
    -- Create smart_pools table for saved search criteria
    CREATE TABLE smart_pools (
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
    CREATE INDEX idx_smart_pools_created_by ON smart_pools(created_by);
    CREATE INDEX idx_smart_pools_is_active ON smart_pools(is_active);

    -- Create trigger for smart_pools updated_at
    CREATE TRIGGER update_smart_pools_updated_at
      BEFORE UPDATE ON smart_pools
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- Update the get_anonymized_candidate_cv function to include user_id
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
  user_id uuid;
BEGIN
  -- Check if the requesting user is a recruiter
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'recruiter'
  ) THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;

  -- Get user_id for the CV
  SELECT c.user_id INTO user_id
  FROM cvs c
  WHERE c.id = cv_id;

  -- Get basic CV data
  SELECT jsonb_build_object(
    'cv_id', c.id,
    'user_id', c.user_id,
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
          'id', cs.id,
          'cv_id', cs.cv_id,
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
          'display_order', cs.display_order,
          'is_visible', cs.is_visible,
          'ai_optimized', cs.ai_optimized
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

-- Update the candidate_cv_profiles view to include user_id
CREATE OR REPLACE VIEW candidate_cv_profiles AS
SELECT 
  c.id as cv_id,
  u.id as user_id,
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

-- Update the search_candidate_profiles function to include user_id in results
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
      'user_id', cp.user_id,
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
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION get_anonymized_candidate_cv(uuid) TO authenticated;
  GRANT EXECUTE ON FUNCTION search_candidate_profiles(text, text[], integer, text, text, integer, integer) TO authenticated;
EXCEPTION
  WHEN OTHERS THEN NULL;
END$$;