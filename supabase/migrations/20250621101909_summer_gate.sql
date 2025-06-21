/*
  # Initial CVaaS Platform Schema

  1. New Tables
    - `users` - User profiles with role-based access
    - `cvs` - CV documents with metadata
    - `cv_sections` - Individual CV sections (experience, education, etc.)
    - `education` - Education entries linked to CVs
    - `experience` - Work experience entries linked to CVs
    - `projects` - Project entries linked to CVs
    - `skills` - Skills entries linked to CVs
    - `quests` - Recruiter-created challenges
    - `quest_submissions` - Candidate quest submissions
    - `badges` - Skill badges earned through quests
    - `cv_comments` - Collaborative feedback on CVs
    - `ephemeral_links` - Time-limited CV sharing links

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure candidate/recruiter data separation

  3. Indexes
    - Performance indexes for common queries
    - Full-text search indexes for CVs and quests
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter');
CREATE TYPE cv_status AS ENUM ('draft', 'published', 'archived', 'optimizing');
CREATE TYPE quest_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE quest_category AS ENUM ('coding', 'design', 'writing', 'analysis', 'leadership', 'communication');
CREATE TYPE submission_status AS ENUM ('submitted', 'under_review', 'passed', 'failed', 'needs_revision');
CREATE TYPE comment_type AS ENUM ('suggestion', 'question', 'praise', 'concern', 'grammar', 'formatting');
CREATE TYPE comment_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'candidate',
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CVs table
CREATE TABLE IF NOT EXISTS cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled CV',
  is_public BOOLEAN DEFAULT FALSE,
  public_url TEXT UNIQUE,
  template_id TEXT DEFAULT 'modern-1',
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES cvs(id),
  status cv_status DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CV Sections table
CREATE TABLE IF NOT EXISTS cv_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  ai_optimized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  gpa DECIMAL(3,2),
  honors TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experience table
CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  achievements TEXT[],
  skills_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  technologies TEXT[],
  start_date DATE,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT FALSE,
  project_url TEXT,
  github_url TEXT,
  achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 100),
  years_experience INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category quest_category NOT NULL,
  difficulty quest_difficulty NOT NULL,
  estimated_time INTEGER, -- in minutes
  instructions JSONB DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  skills_assessed TEXT[],
  verification_criteria JSONB DEFAULT '[]',
  passing_score INTEGER DEFAULT 80,
  badge_metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  total_attempts INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quest Submissions table
CREATE TABLE IF NOT EXISTS quest_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_content JSONB NOT NULL,
  status submission_status DEFAULT 'submitted',
  score INTEGER,
  feedback JSONB DEFAULT '[]',
  time_spent INTEGER, -- in minutes
  attempt_number INTEGER DEFAULT 1,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  skill TEXT NOT NULL,
  level TEXT DEFAULT 'bronze',
  rarity TEXT DEFAULT 'common',
  blockchain_data JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_displayed BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- CV Comments table
CREATE TABLE IF NOT EXISTS cv_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  section_id UUID REFERENCES cv_sections(id),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type comment_type DEFAULT 'suggestion',
  priority comment_priority DEFAULT 'medium',
  target_element JSONB DEFAULT '{}',
  position JSONB DEFAULT '{}',
  tags TEXT[],
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment Replies table
CREATE TABLE IF NOT EXISTS comment_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES cv_comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ephemeral Links table
CREATE TABLE IF NOT EXISTS ephemeral_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  allow_download BOOLEAN DEFAULT FALSE,
  require_password BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link Access Log table
CREATE TABLE IF NOT EXISTS link_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES ephemeral_links(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  location JSONB DEFAULT '{}',
  action TEXT DEFAULT 'view'
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ephemeral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Recruiters can read candidate profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'recruiter'
    )
  );

-- CVs policies
CREATE POLICY "Users can manage own CVs" ON cvs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public CVs are readable by all" ON cvs
  FOR SELECT USING (is_public = true);

CREATE POLICY "Recruiters can read all CVs" ON cvs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'recruiter'
    )
  );

-- CV Sections policies
CREATE POLICY "Users can manage own CV sections" ON cv_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "CV sections readable with CV access" ON cv_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND (
        c.user_id = auth.uid() OR 
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

-- Education policies
CREATE POLICY "Users can manage own education" ON education
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Education readable with CV access" ON education
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND (
        c.user_id = auth.uid() OR 
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

-- Experience policies
CREATE POLICY "Users can manage own experience" ON experience
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Experience readable with CV access" ON experience
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND (
        c.user_id = auth.uid() OR 
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

-- Projects policies
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Projects readable with CV access" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND (
        c.user_id = auth.uid() OR 
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

-- Skills policies
CREATE POLICY "Users can manage own skills" ON skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Skills readable with CV access" ON skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND (
        c.user_id = auth.uid() OR 
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

-- Quests policies
CREATE POLICY "Recruiters can manage own quests" ON quests
  FOR ALL USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'recruiter'
    )
  );

CREATE POLICY "Active quests are readable by candidates" ON quests
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'candidate'
    )
  );

CREATE POLICY "Recruiters can read all quests" ON quests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'recruiter'
    )
  );

-- Quest Submissions policies
CREATE POLICY "Users can manage own submissions" ON quest_submissions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Quest creators can read submissions" ON quest_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quests q 
      WHERE q.id = quest_id AND q.created_by = auth.uid()
    )
  );

-- Badges policies
CREATE POLICY "Users can read own badges" ON badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public badges are readable by all" ON badges
  FOR SELECT USING (is_displayed = true);

CREATE POLICY "Users can update own badge display" ON badges
  FOR UPDATE USING (auth.uid() = user_id);

-- CV Comments policies
CREATE POLICY "Users can read comments on accessible CVs" ON cv_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND (
        c.user_id = auth.uid() OR 
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

CREATE POLICY "Users can create comments on accessible CVs" ON cv_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND (
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

CREATE POLICY "Users can update own comments" ON cv_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "CV owners can resolve comments" ON cv_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND c.user_id = auth.uid()
    )
  );

-- Comment Replies policies
CREATE POLICY "Users can read replies on accessible comments" ON comment_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cv_comments cc
      JOIN cvs c ON c.id = cc.cv_id
      WHERE cc.id = comment_id AND (
        c.user_id = auth.uid() OR 
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

CREATE POLICY "Users can create replies on accessible comments" ON comment_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cv_comments cc
      JOIN cvs c ON c.id = cc.cv_id
      WHERE cc.id = comment_id AND (
        c.is_public = true OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() AND u.role = 'recruiter'
        )
      )
    )
  );

-- Ephemeral Links policies
CREATE POLICY "Users can manage own ephemeral links" ON ephemeral_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cvs c 
      WHERE c.id = cv_id AND c.user_id = auth.uid()
    )
  );

-- Link Access Log policies
CREATE POLICY "Link creators can read access logs" ON link_access_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ephemeral_links el
      JOIN cvs c ON c.id = el.cv_id
      WHERE el.id = link_id AND c.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_cvs_public ON cvs(is_public) WHERE is_public = true;
CREATE INDEX idx_cv_sections_cv_id ON cv_sections(cv_id);
CREATE INDEX idx_education_cv_id ON education(cv_id);
CREATE INDEX idx_experience_cv_id ON experience(cv_id);
CREATE INDEX idx_projects_cv_id ON projects(cv_id);
CREATE INDEX idx_skills_cv_id ON skills(cv_id);
CREATE INDEX idx_skills_name ON skills USING gin(name gin_trgm_ops);
CREATE INDEX idx_quests_active ON quests(is_active) WHERE is_active = true;
CREATE INDEX idx_quests_category ON quests(category);
CREATE INDEX idx_quest_submissions_user_id ON quest_submissions(user_id);
CREATE INDEX idx_quest_submissions_quest_id ON quest_submissions(quest_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_cv_comments_cv_id ON cv_comments(cv_id);
CREATE INDEX idx_ephemeral_links_token ON ephemeral_links(access_token);
CREATE INDEX idx_ephemeral_links_active ON ephemeral_links(is_active) WHERE is_active = true;

-- Create full-text search indexes
CREATE INDEX idx_cvs_search ON cvs USING gin(to_tsvector('english', title));
CREATE INDEX idx_quests_search ON quests USING gin(to_tsvector('english', title || ' ' || description));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cvs_updated_at BEFORE UPDATE ON cvs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_sections_updated_at BEFORE UPDATE ON cv_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_comments_updated_at BEFORE UPDATE ON cv_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();