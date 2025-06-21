// Talent Syndication Network Types

export interface SyndicationCredit {
  id: string;
  ownerId: string;
  amount: number;
  type: CreditType;
  source: CreditSource;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreditType = 'submission' | 'referral' | 'bonus' | 'purchase';
export type CreditSource = 'platform_reward' | 'referral_bonus' | 'purchase' | 'quest_completion';

export interface CandidateSubmission {
  id: string;
  submitterId: string; // Recruiter who submitted
  candidateId: string;
  projectId: string;
  creditsUsed: number;
  submissionType: SubmissionType;
  qualityScore?: number;
  status: SubmissionStatus;
  revenueShare?: RevenueShare;
  submittedAt: string;
  reviewedAt?: string;
}

export type SubmissionType = 'direct_referral' | 'talent_pool' | 'quest_winner' | 'network_referral';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'hired' | 'withdrawn';

export interface RevenueShare {
  submitterId: string;
  percentage: number; // 0-100
  amount: number;
  currency: string;
  paidAt?: string;
  status: 'pending' | 'paid' | 'cancelled';
}

export interface SyndicationMarketplace {
  id: string;
  sellerId: string;
  creditAmount: number;
  pricePerCredit: number;
  currency: string;
  minPurchase: number;
  maxPurchase: number;
  isActive: boolean;
  totalSold: number;
  createdAt: string;
  expiresAt?: string;
}

export interface CreditTransaction {
  id: string;
  fromUserId?: string;
  toUserId: string;
  amount: number;
  type: TransactionType;
  reference: string; // submission ID, purchase ID, etc.
  description: string;
  createdAt: string;
}

export type TransactionType = 'earned' | 'spent' | 'purchased' | 'transferred' | 'expired';

// Privacy & Trust Types
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
  location?: {
    country: string;
    city: string;
  };
  action: 'view' | 'download';
}

export interface ZKCredential {
  id: string;
  userId: string;
  credentialType: CredentialType;
  issuer: string;
  proofHash: string; // Zero-knowledge proof hash
  verificationKey: string;
  isVerified: boolean;
  expiresAt?: string;
  metadata: {
    skillLevel?: number;
    institution?: string;
    completionDate?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export type CredentialType = 
  | 'education_degree'
  | 'professional_certification'
  | 'skill_badge'
  | 'work_experience'
  | 'identity_verification';

export interface CredentialProof {
  credentialId: string;
  proofData: string; // Encrypted proof data
  verificationResult: boolean;
  verifiedAt: string;
  verifierId: string;
}

// Syndication Analytics
export interface SyndicationAnalytics {
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  currentBalance: number;
  successfulSubmissions: number;
  totalRevenue: number;
  averageQualityScore: number;
  topPerformingSubmissions: CandidateSubmission[];
  creditHistory: CreditTransaction[];
  marketplaceActivity: {
    totalSales: number;
    averagePrice: number;
    topBuyers: string[];
  };
}