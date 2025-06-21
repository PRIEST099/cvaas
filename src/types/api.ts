// API Request/Response Types for CV Builder

export interface OptimizeForRoleRequest {
  cvId: string;
  jobDescription: string;
  targetSections?: string[];
  preserveOriginal?: boolean;
}

export interface OptimizeForRoleResponse {
  optimizationId: string;
  changes: OptimizationChange[];
  keywordsHighlighted: string[];
  score: number;
  estimatedImpact: string;
  suggestions: string[];
}

export interface ScanSkillsRequest {
  sources: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  existingSkills?: string[];
}

export interface ScanSkillsResponse {
  scanId: string;
  detectedSkills: DetectedSkill[];
  skillCategories: SkillCategory[];
  recommendations: SkillRecommendation[];
  confidence: number;
}

export interface SkillRecommendation {
  skill: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  marketDemand: number;
  relatedSkills: string[];
}

export interface CreateCVVersionRequest {
  cvId: string;
  title: string;
  description?: string;
  templateId?: string;
  changes: string[];
}

export interface CreateCVVersionResponse {
  versionId: string;
  version: number;
  comparisonUrl: string;
}

export interface CVAnalyticsResponse {
  performance: {
    views: number;
    downloads: number;
    applications: number;
    responseRate: number;
  };
  keywords: KeywordMatch[];
  recommendations: string[];
  benchmarks: {
    industryAverage: number;
    topPerformers: number;
    yourScore: number;
  };
}

export interface AIFeedbackResponse {
  overallScore: number;
  sections: SectionFeedback[];
  improvements: ImprovementSuggestion[];
  strengths: string[];
  weaknesses: string[];
}

export interface SectionFeedback {
  sectionType: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface ImprovementSuggestion {
  type: 'content' | 'formatting' | 'keywords' | 'structure';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}