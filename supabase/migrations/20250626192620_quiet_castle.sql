/*
  # Create candidate invitation system

  1. New Tables
    - `candidate_invitations`
      - `id` (uuid, primary key)
      - `candidate_id` (uuid, foreign key to users)
      - `recruiter_id` (uuid, foreign key to users)
      - `quest_id` (uuid, foreign key to quests, optional)
      - `cv_id` (uuid, foreign key to cvs)
      - `message` (text)
      - `status` (text) - 'pending', 'accepted', 'declined'
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `response_at` (timestamptz, nullable)
      - `response_message` (text, nullable)

  2. Security
    - Enable RLS on the table
    - Add policies for recruiters to manage their invitations
    - Add policies for candidates to view and respond to invitations

  3. Indexes
    - Add indexes for better performance
*/

-- Create candidate_invitations table
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

-- Enable RLS
ALTER TABLE candidate_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Recruiters can manage their own invitations"
  ON candidate_invitations
  FOR ALL
  TO authenticated
  USING (recruiter_id = auth.uid());

CREATE POLICY "Candidates can view invitations sent to them"
  ON candidate_invitations
  FOR SELECT
  TO authenticated
  USING (candidate_id = auth.uid());

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_candidate_id ON candidate_invitations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_recruiter_id ON candidate_invitations(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_quest_id ON candidate_invitations(quest_id);
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_status ON candidate_invitations(status);
CREATE INDEX IF NOT EXISTS idx_candidate_invitations_expires_at ON candidate_invitations(expires_at);

-- Create function to get invitation statistics for a recruiter
CREATE OR REPLACE FUNCTION get_recruiter_invitation_stats(recruiter_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count integer;
  pending_count integer;
  accepted_count integer;
  declined_count integer;
  response_rate numeric;
BEGIN
  -- Get counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'accepted'),
    COUNT(*) FILTER (WHERE status = 'declined')
  INTO
    total_count,
    pending_count,
    accepted_count,
    declined_count
  FROM candidate_invitations
  WHERE recruiter_id = $1;
  
  -- Calculate response rate
  IF total_count > 0 THEN
    response_rate := (accepted_count + declined_count)::numeric / total_count;
  ELSE
    response_rate := 0;
  END IF;
  
  -- Return stats as JSON
  RETURN jsonb_build_object(
    'total', total_count,
    'pending', pending_count,
    'accepted', accepted_count,
    'declined', declined_count,
    'response_rate', response_rate
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_recruiter_invitation_stats(uuid) TO authenticated;