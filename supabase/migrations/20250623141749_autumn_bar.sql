-- Enhance the access_ephemeral_link function to return comprehensive CV data
CREATE OR REPLACE FUNCTION access_ephemeral_link(
  token text,
  password_input text DEFAULT NULL,
  ip_addr text DEFAULT NULL,
  user_agent_input text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  link_record ephemeral_links%ROWTYPE;
  cv_data jsonb;
  result jsonb;
BEGIN
  -- Get the ephemeral link
  SELECT * INTO link_record
  FROM ephemeral_links
  WHERE access_token = token
    AND is_active = true
    AND expires_at > now();
  
  -- Check if link exists and is valid
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Link not found or expired'
    );
  END IF;
  
  -- Check max views limit
  IF link_record.max_views IS NOT NULL AND link_record.current_views >= link_record.max_views THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Maximum views exceeded'
    );
  END IF;
  
  -- Check password if required
  IF link_record.require_password AND link_record.password_hash IS NOT NULL THEN
    IF password_input IS NULL OR encode(digest(password_input, 'sha256'), 'base64') != link_record.password_hash THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Invalid password'
      );
    END IF;
  END IF;
  
  -- Get comprehensive CV data with all related content
  SELECT jsonb_build_object(
    'id', c.id,
    'user_id', c.user_id,
    'title', c.title,
    'is_public', c.is_public,
    'public_url', c.public_url,
    'template_id', c.template_id,
    'version', c.version,
    'parent_id', c.parent_id,
    'status', c.status,
    'metadata', c.metadata,
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'sections', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', cs.id,
          'cv_id', cs.cv_id,
          'section_type', cs.section_type,
          'title', cs.title,
          'content', cs.content,
          'display_order', cs.display_order,
          'is_visible', cs.is_visible,
          'ai_optimized', cs.ai_optimized,
          'created_at', cs.created_at,
          'updated_at', cs.updated_at
        ) ORDER BY cs.display_order
      )
      FROM cv_sections cs 
      WHERE cs.cv_id = c.id AND cs.is_visible = true), 
      '[]'::jsonb
    ),
    'education', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'cv_id', e.cv_id,
          'institution', e.institution,
          'degree', e.degree,
          'field_of_study', e.field_of_study,
          'start_date', e.start_date,
          'end_date', e.end_date,
          'is_current', e.is_current,
          'gpa', e.gpa,
          'honors', e.honors,
          'description', e.description,
          'created_at', e.created_at,
          'updated_at', e.updated_at
        ) ORDER BY e.start_date DESC
      )
      FROM education e 
      WHERE e.cv_id = c.id), 
      '[]'::jsonb
    ),
    'experience', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', ex.id,
          'cv_id', ex.cv_id,
          'company', ex.company,
          'position', ex.position,
          'location', ex.location,
          'start_date', ex.start_date,
          'end_date', ex.end_date,
          'is_current', ex.is_current,
          'description', ex.description,
          'achievements', ex.achievements,
          'skills_used', ex.skills_used,
          'created_at', ex.created_at,
          'updated_at', ex.updated_at
        ) ORDER BY ex.start_date DESC
      )
      FROM experience ex 
      WHERE ex.cv_id = c.id), 
      '[]'::jsonb
    ),
    'projects', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'cv_id', p.cv_id,
          'title', p.title,
          'description', p.description,
          'technologies', p.technologies,
          'start_date', p.start_date,
          'end_date', p.end_date,
          'is_ongoing', p.is_ongoing,
          'project_url', p.project_url,
          'github_url', p.github_url,
          'achievements', p.achievements,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        ) ORDER BY p.start_date DESC
      )
      FROM projects p 
      WHERE p.cv_id = c.id), 
      '[]'::jsonb
    ),
    'skills', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'cv_id', s.cv_id,
          'name', s.name,
          'category', s.category,
          'proficiency_level', s.proficiency_level,
          'years_experience', s.years_experience,
          'is_verified', s.is_verified,
          'verification_source', s.verification_source,
          'created_at', s.created_at,
          'updated_at', s.updated_at
        ) ORDER BY s.category, s.name
      )
      FROM skills s 
      WHERE s.cv_id = c.id), 
      '[]'::jsonb
    )
  ) INTO cv_data
  FROM cvs c
  WHERE c.id = link_record.cv_id;
  
  IF cv_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CV not found'
    );
  END IF;
  
  -- Increment view count
  UPDATE ephemeral_links
  SET current_views = current_views + 1
  WHERE id = link_record.id;
  
  -- Log the access
  INSERT INTO link_access_log (link_id, ip_address, user_agent, action)
  VALUES (link_record.id, ip_addr, user_agent_input, 'view');
  
  -- Return success with comprehensive CV data
  RETURN jsonb_build_object(
    'success', true,
    'cv', cv_data,
    'link', jsonb_build_object(
      'allow_download', link_record.allow_download,
      'current_views', link_record.current_views + 1,
      'max_views', link_record.max_views
    )
  );
END;
$$;