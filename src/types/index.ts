export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accountType: AccountType;
  companyId?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'super_admin'
  | 'business_owner'
  | 'business_recruiter'
  | 'business_team_member'
  | 'individual_premium'
  | 'individual_free';

export type AccountType = 'business' | 'individual';

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: CompanySize;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export interface CV {
  id: string;
  userId: string;
  title: string;
  isPublic: boolean;
  publicUrl?: string;
  templateId: string;
  sections: CVSection[];
  createdAt: string;
  updatedAt: string;
}

export interface CVSection {
  id: string;
  type: SectionType;
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
}

export type SectionType = 
  | 'personal_info'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages';

export interface Quest {
  id: string;
  companyId: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  estimatedTime: number; // in minutes
  questions: QuestQuestion[];
  skillTags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type QuestType = 'coding' | 'design' | 'writing' | 'analysis' | 'presentation';
export type QuestDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface QuestQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export type QuestionType = 'multiple_choice' | 'text' | 'code' | 'file_upload';

export interface QuestSubmission {
  id: string;
  questId: string;
  userId: string;
  answers: QuestAnswer[];
  score?: number;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
}

export interface QuestAnswer {
  questionId: string;
  answer: string;
  fileUrl?: string;
}

export type SubmissionStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';