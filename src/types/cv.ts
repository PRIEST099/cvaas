export interface CV {
  id: string;
  userId: string;
  title: string;
  isPublic: boolean;
  publicUrl?: string;
  templateId: string;
  version: number;
  parentId?: string; // For version control
  status: CVStatus;
  aiOptimizations: AIOptimization[];
  skillsRadar: SkillsRadarData;
  sections: CVSection[];
  metadata: CVMetadata;
  createdAt: string;
  updatedAt: string;
}

export type CVStatus = 'draft' | 'published' | 'archived' | 'optimizing';

export interface CVVersion {
  id: string;
  cvId: string;
  version: number;
  title: string;
  description?: string;
  templateId: string;
  sections: CVSection[];
  performance: VersionPerformance;
  createdAt: string;
}

export interface VersionPerformance {
  views: number;
  downloads: number;
  applications: number;
  responseRate: number;
  lastTracked: string;
}

export interface AIOptimization {
  id: string;
  jobDescription: string;
  optimizedSections: string[];
  keywordsHighlighted: string[];
  changes: OptimizationChange[];
  score: number;
  appliedAt: string;
}

export interface OptimizationChange {
  sectionId: string;
  field: string;
  original: string;
  optimized: string;
  reason: string;
  confidence: number;
}

export interface SkillsRadarData {
  id: string;
  lastScanned: string;
  sources: SkillSource[];
  detectedSkills: DetectedSkill[];
  manualSkills: ManualSkill[];
  skillCategories: SkillCategory[];
}

export interface SkillSource {
  type: 'linkedin' | 'github' | 'portfolio' | 'manual';
  url?: string;
  lastScanned: string;
  status: 'connected' | 'scanning' | 'error' | 'disconnected';
  skillsFound: number;
}

export interface DetectedSkill {
  name: string;
  category: string;
  proficiency: number; // 1-100
  source: string;
  evidence: string[];
  confidence: number;
  isVerified: boolean;
}

export interface ManualSkill {
  name: string;
  category: string;
  proficiency: number;
  yearsExperience?: number;
  certifications?: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
  averageProficiency: number;
  color: string;
}

export interface CVSection {
  id: string;
  type: SectionType;
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
  aiOptimized: boolean;
  originalContent?: any;
}

export type SectionType = 
  | 'personal_info'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'achievements'
  | 'volunteer';

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  description: string;
  bulletPoints: BulletPoint[];
  skills: string[];
}

export interface BulletPoint {
  id: string;
  text: string;
  originalText?: string;
  isOptimized: boolean;
  keywords: string[];
  impact?: string;
  metrics?: string[];
}

export interface CVMetadata {
  totalViews: number;
  uniqueViews: number;
  downloadCount: number;
  shareCount: number;
  lastViewedAt?: string;
  averageViewTime?: number;
  topReferrers: string[];
  keywordMatches: KeywordMatch[];
}

export interface KeywordMatch {
  keyword: string;
  frequency: number;
  context: string[];
  relevanceScore: number;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'executive';
  previewImage: string;
  isPremium: boolean;
  sections: TemplateSectionConfig[];
  styling: TemplateStyles;
}

export interface TemplateSectionConfig {
  type: SectionType;
  isRequired: boolean;
  defaultTitle: string;
  maxItems?: number;
  customFields?: CustomField[];
}

export interface CustomField {
  name: string;
  type: 'text' | 'textarea' | 'date' | 'url' | 'select';
  options?: string[];
  isRequired: boolean;
}

export interface TemplateStyles {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  layout: {
    columns: number;
    spacing: string;
    borderRadius: string;
  };
}