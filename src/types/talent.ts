// Talent Discovery Types

export interface TalentProfile {
  id: string;
  anonymousId: string; // Used for display until invite is sent
  userId: string;
  isAnonymous: boolean;
  
  // Basic Info (anonymized)
  title: string;
  seniority: SeniorityLevel;
  location: {
    city?: string;
    state?: string;
    country: string;
    isRemote: boolean;
    timezone?: string;
  };
  
  // Skills & Experience
  skills: TalentSkill[];
  experience: TalentExperience[];
  education: TalentEducation[];
  
  // Scoring & Matching
  scores: TalentScores;
  availability: AvailabilityStatus;
  preferences: TalentPreferences;
  
  // Metadata
  lastActive: string;
  profileCompleteness: number; // 0-100
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export type SeniorityLevel = 
  | 'entry' 
  | 'junior' 
  | 'mid' 
  | 'senior' 
  | 'lead' 
  | 'principal' 
  | 'executive';

export interface TalentSkill {
  name: string;
  category: string;
  proficiency: number; // 1-100
  yearsExperience: number;
  isVerified: boolean;
  verificationSource?: 'quest' | 'certification' | 'peer_review';
  lastUsed?: string;
}

export interface TalentExperience {
  id: string;
  title: string;
  company: string; // Anonymized for discovery
  industry: string;
  duration: number; // in months
  isCurrentRole: boolean;
  skills: string[];
  achievements: string[];
  startDate: string;
  endDate?: string;
}

export interface TalentEducation {
  id: string;
  degree: string;
  field: string;
  institution: string; // May be anonymized
  graduationYear: number;
  gpa?: number;
  honors?: string[];
}

export interface TalentScores {
  overall: number; // 0-100 composite score
  technical: number; // Based on skills, quests, experience
  cultural: number; // Based on values, work style, team fit
  communication: number; // Based on writing samples, presentations
  leadership: number; // Based on experience, achievements
  growth: number; // Learning velocity, adaptability
  reliability: number; // Based on quest completion, references
}

export type AvailabilityStatus = 
  | 'actively_looking' 
  | 'open_to_opportunities' 
  | 'not_looking' 
  | 'unavailable';

export interface TalentPreferences {
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  workArrangement: ('remote' | 'hybrid' | 'onsite')[];
  companySize: ('startup' | 'small' | 'medium' | 'large' | 'enterprise')[];
  industries: string[];
  roleTypes: string[];
  benefits: string[];
  dealBreakers: string[];
}

export type VerificationStatus = 'unverified' | 'partial' | 'verified' | 'premium';

// Search & Filtering
export interface TalentSearchFilters {
  keywords?: string;
  skills?: string[];
  seniority?: SeniorityLevel[];
  location?: {
    cities?: string[];
    states?: string[];
    countries?: string[];
    remoteOnly?: boolean;
    radius?: number;
  };
  availability?: AvailabilityStatus[];
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  experience?: {
    minYears?: number;
    maxYears?: number;
    industries?: string[];
    companies?: string[];
  };
  education?: {
    degrees?: string[];
    fields?: string[];
    institutions?: string[];
  };
  scores?: {
    overall?: { min: number; max: number };
    technical?: { min: number; max: number };
    cultural?: { min: number; max: number };
    communication?: { min: number; max: number };
    leadership?: { min: number; max: number };
  };
  verification?: VerificationStatus[];
  lastActive?: number; // days
}

export interface TalentSearchResult {
  profiles: TalentProfile[];
  total: number;
  page: number;
  pageSize: number;
  filters: TalentSearchFilters;
  aggregations: SearchAggregations;
}

export interface SearchAggregations {
  skills: { name: string; count: number }[];
  seniority: { level: SeniorityLevel; count: number }[];
  locations: { location: string; count: number }[];
  industries: { industry: string; count: number }[];
  salaryRanges: { range: string; count: number }[];
}

// Smart Pools
export interface SmartPool {
  id: string;
  name: string;
  description: string;
  companyId: string;
  createdBy: string;
  
  // Pool Configuration
  filters: TalentSearchFilters;
  scoringWeights: ScoringWeights;
  autoRefresh: boolean;
  refreshFrequency: 'daily' | 'weekly' | 'monthly';
  
  // Pool Stats
  candidateCount: number;
  averageScore: number;
  lastRefreshed: string;
  
  // Metadata
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScoringWeights {
  technical: number; // 0-1
  cultural: number;
  communication: number;
  leadership: number;
  growth: number;
  reliability: number;
  experience: number;
  education: number;
  availability: number;
  locationMatch: number;
}

// Invitations & Interactions
export interface TalentInvitation {
  id: string;
  talentId: string;
  companyId: string;
  projectId?: string;
  questId?: string;
  
  type: 'interview' | 'project' | 'quest' | 'general_inquiry';
  message: string;
  compensation?: {
    type: 'salary' | 'hourly' | 'project' | 'equity';
    amount?: number;
    currency?: string;
    benefits?: string[];
  };
  
  status: InvitationStatus;
  sentAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export type InvitationStatus = 
  | 'pending' 
  | 'viewed' 
  | 'accepted' 
  | 'declined' 
  | 'expired' 
  | 'withdrawn';

// Analytics
export interface TalentAnalytics {
  searchMetrics: {
    totalSearches: number;
    uniqueSearchers: number;
    averageResultsPerSearch: number;
    topKeywords: string[];
    topFilters: string[];
  };
  invitationMetrics: {
    totalInvitations: number;
    responseRate: number;
    acceptanceRate: number;
    averageResponseTime: number; // hours
    topDeclineReasons: string[];
  };
  poolMetrics: {
    totalPools: number;
    averagePoolSize: number;
    mostActiveFilters: string[];
    poolPerformance: { poolId: string; successRate: number }[];
  };
}