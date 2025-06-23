/*
  # Create ephemeral links tables

  1. New Tables
    - `ephemeral_links`
      - `id` (uuid, primary key)
      - `cv_id` (uuid, foreign key to cvs)
      - `created_by` (uuid, foreign key to users)
      - `access_token` (text, unique)
      - `expires_at` (timestamp)
      - `max_views` (integer, optional)
      - `current_views` (integer)
      - `allow_download` (boolean)
      - `require_password` (boolean)
      - `password_hash` (text, optional)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `link_access_log`
      - `id` (uuid, primary key)
      - `link_id` (uuid, foreign key to ephemeral_links)
      - `accessed_at` (timestamp)
      - `ip_address` (text, optional)
      - `user_agent` (text, optional)
      - `location` (jsonb, optional)
      - `action` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own ephemeral links
    - Add policies for public access to CVs via ephemeral links
    - Add policies for logging access

  3. Functions
    - Add function to validate ephemeral link access
    - Add function to log access attempts
*/

-- Create ephemeral_links table
CREATE TABLE IF NOT EXISTS ephemeral_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  max_views integer,
  current_views integer DEFAULT 0,
  allow_download boolean DEFAULT false,
  require_password boolean DEFAULT false,
  password_hash text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create link_access_log table
CREATE TABLE IF NOT EXISTS link_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES ephemeral_links(id) ON DELETE CASCADE,
  accessed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  location jsonb DEFAULT '{}',
  action text DEFAULT 'view'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ephemeral_links_cv_id ON ephemeral_links(cv_id);
CREATE INDEX IF NOT EXISTS idx_ephemeral_links_created_by ON ephemeral_links(created_by);
CREATE INDEX IF NOT EXISTS idx_ephemeral_links_access_token ON ephemeral_links(access_token);
CREATE INDEX IF NOT EXISTS idx_ephemeral_links_expires_at ON ephemeral_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_ephemeral_links_is_active ON ephemeral_links(is_active);
CREATE INDEX IF NOT EXISTS idx_link_access_log_link_id ON link_access_log(link_id);
CREATE INDEX IF NOT EXISTS idx_link_access_log_accessed_at ON link_access_log(accessed_at);

-- Enable RLS
ALTER TABLE ephemeral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ephemeral_links
CREATE POLICY "Users can manage their own ephemeral links"
  ON ephemeral_links
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Active ephemeral links are readable by token"
  ON ephemeral_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND expires_at > now());

-- RLS Policies for link_access_log
CREATE POLICY "Link creators can view access logs"
  ON link_access_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ephemeral_links 
      WHERE ephemeral_links.id = link_access_log.link_id 
      AND ephemeral_links.created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert access logs"
  ON link_access_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Function to validate and access ephemeral link
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
  cv_record cvs%ROWTYPE;
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
  
  -- Get the CV
  SELECT * INTO cv_record
  FROM cvs
  WHERE id = link_record.cv_id;
  
  IF NOT FOUND THEN
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
  
  -- Return success with CV data
  RETURN jsonb_build_object(
    'success', true,
    'cv', row_to_json(cv_record),
    'link', jsonb_build_object(
      'allow_download', link_record.allow_download,
      'current_views', link_record.current_views + 1,
      'max_views', link_record.max_views
    )
  );
END;
$$;

-- Function to log download access
CREATE OR REPLACE FUNCTION log_ephemeral_download(
  token text,
  ip_addr text DEFAULT NULL,
  user_agent_input text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  link_id uuid;
BEGIN
  -- Get the link ID
  SELECT id INTO link_id
  FROM ephemeral_links
  WHERE access_token = token
    AND is_active = true
    AND expires_at > now()
    AND allow_download = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Log the download
  INSERT INTO link_access_log (link_id, ip_address, user_agent, action)
  VALUES (link_id, ip_addr, user_agent_input, 'download');
  
  RETURN true;
END;
$$;