// Core application types
export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter';
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  profile_image_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CV {
  id: string;
  user_id: string;
  title: string;
  is_public: boolean;
  public_url: string | null;
  template_id: string;
  version: number;
  parent_id: string | null;
  status: 'draft' | 'published' | 'archived' | 'optimizing';
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface CVSection {
  id: string;
  cv_id: string;
  section_type: string;
  title: string;
  content: any;
  display_order: number;
  is_visible: boolean;
  ai_optimized: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  created_by: string;
  title: string;
  description: string;
  category: 'coding' | 'design' | 'writing' | 'analysis' | 'leadership' | 'communication';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_time: number | null;
  instructions: any;
  resources: any;
  skills_assessed: string[] | null;
  verification_criteria: any;
  passing_score: number;
  badge_metadata: any;
  is_active: boolean;
  total_attempts: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface QuestSubmission {
  id: string;
  quest_id: string;
  user_id: string;
  submission_content: any;
  status: 'submitted' | 'under_review' | 'passed' | 'failed' | 'needs_revision';
  score: number | null;
  feedback: any;
  time_spent: number | null;
  attempt_number: number;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  quests?: {
    title: string;
    category: string;
    difficulty: string;
  };
}

export interface Badge {
  id: string;
  user_id: string;
  quest_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  skill: string;
  level: string;
  rarity: string;
  blockchain_data: any;
  is_verified: boolean;
  is_displayed: boolean;
  display_order: number;
  earned_at: string;
}

export interface EphemeralLink {
  id: string;
  cvId: string;
  createdBy: string;
  accessToken: string;
  expiresAt: string;
  maxViews?: number;
  currentViews: number;
  allowDownload: boolean;
  requirePassword?: boolean;
  password?: string;
  isActive: boolean;
  accessLog: LinkAccess[];
  createdAt: string;
}

export interface LinkAccess {
  id: string;
  linkId: string;
  accessedAt: string;
  ipAddress: string;
  userAgent: string;
  action: 'view' | 'download';
}

// Widget Configuration
export interface WidgetConfig {
  theme: 'light' | 'dark' | 'auto';
  size: 'small' | 'medium' | 'large';
  sections: string[];
  showPhoto: boolean;
  showContact: boolean;
  customCSS: string;
  autoUpdate: boolean;
}