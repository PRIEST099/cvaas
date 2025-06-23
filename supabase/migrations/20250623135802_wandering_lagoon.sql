/*
  # Create quests and badges tables

  1. New Tables
    - `quests`
      - `id` (uuid, primary key)
      - `created_by` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `category` (enum)
      - `difficulty` (enum)
      - `estimated_time` (integer, optional)
      - `instructions` (jsonb)
      - `resources` (jsonb)
      - `skills_assessed` (text array, optional)
      - `verification_criteria` (jsonb)
      - `passing_score` (integer)
      - `badge_metadata` (jsonb)
      - `is_active` (boolean)
      - `total_attempts` (integer)
      - `success_rate` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quest_submissions`
      - `id` (uuid, primary key)
      - `quest_id` (uuid, foreign key to quests)
      - `user_id` (uuid, foreign key to users)
      - `submission_content` (jsonb)
      - `status` (enum)
      - `score` (integer, optional)
      - `feedback` (jsonb, optional)
      - `time_spent` (integer, optional)
      - `attempt_number` (integer)
      - `submitted_at` (timestamp)
      - `reviewed_at` (timestamp, optional)
      - `reviewed_by` (uuid, optional)
    
    - `badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `quest_id` (uuid, foreign key to quests, optional)
      - `name` (text)
      - `description` (text, optional)
      - `image_url` (text, optional)
      - `skill` (text)
      - `level` (text)
      - `rarity` (text)
      - `blockchain_data` (jsonb)
      - `is_verified` (boolean)
      - `is_displayed` (boolean)
      - `display_order` (integer)
      - `earned_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for quest management by recruiters
    - Add policies for quest submissions by candidates
    - Add policies for public quest viewing
    - Add policies for badge management

  3. Triggers
    - Add updated_at triggers for quests
*/

-- Create enums
DO $$ BEGIN
  CREATE TYPE quest_category AS ENUM ('coding', 'design', 'writing', 'analysis', 'leadership', 'communication');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quest_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('submitted', 'under_review', 'passed', 'failed', 'needs_revision');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category quest_category NOT NULL,
  difficulty quest_difficulty NOT NULL,
  estimated_time integer,
  instructions jsonb DEFAULT '{}',
  resources jsonb DEFAULT '{}',
  skills_assessed text[],
  verification_criteria jsonb DEFAULT '{}',
  passing_score integer DEFAULT 80,
  badge_metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  total_attempts integer DEFAULT 0,
  success_rate numeric(5,4) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quest_submissions table
CREATE TABLE IF NOT EXISTS quest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_content jsonb NOT NULL,
  status submission_status DEFAULT 'submitted',
  score integer CHECK (score >= 0 AND score <= 100),
  feedback jsonb,
  time_spent integer,
  attempt_number integer DEFAULT 1,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id uuid REFERENCES quests(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  image_url text,
  skill text NOT NULL,
  level text DEFAULT 'bronze',
  rarity text DEFAULT 'common',
  blockchain_data jsonb DEFAULT '{}',
  is_verified boolean DEFAULT false,
  is_displayed boolean DEFAULT true,
  display_order integer DEFAULT 0,
  earned_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quests_created_by ON quests(created_by);
CREATE INDEX IF NOT EXISTS idx_quests_category ON quests(category);
CREATE INDEX IF NOT EXISTS idx_quests_difficulty ON quests(difficulty);
CREATE INDEX IF NOT EXISTS idx_quests_is_active ON quests(is_active);
CREATE INDEX IF NOT EXISTS idx_quest_submissions_quest_id ON quest_submissions(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_submissions_user_id ON quest_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_submissions_status ON quest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_skill ON badges(skill);
CREATE INDEX IF NOT EXISTS idx_badges_is_displayed ON badges(is_displayed);

-- Enable RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quests
CREATE POLICY "Recruiters can manage their own quests"
  ON quests
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid() AND EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'recruiter'
  ));

CREATE POLICY "Active quests are publicly readable"
  ON quests
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- RLS Policies for quest_submissions
CREATE POLICY "Users can manage their own submissions"
  ON quest_submissions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Quest creators can view submissions to their quests"
  ON quest_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quests 
      WHERE quests.id = quest_submissions.quest_id 
      AND quests.created_by = auth.uid()
    )
  );

CREATE POLICY "Quest creators can update submissions to their quests"
  ON quest_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quests 
      WHERE quests.id = quest_submissions.quest_id 
      AND quests.created_by = auth.uid()
    )
  );

-- RLS Policies for badges
CREATE POLICY "Users can view their own badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public badges are readable"
  ON badges
  FOR SELECT
  TO authenticated, anon
  USING (is_displayed = true);

CREATE POLICY "System can insert badges"
  ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own badge display settings"
  ON badges
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger for quests
CREATE TRIGGER update_quests_updated_at
  BEFORE UPDATE ON quests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint for quest submissions
ALTER TABLE quest_submissions 
ADD CONSTRAINT unique_user_quest_attempt 
UNIQUE (quest_id, user_id, attempt_number);