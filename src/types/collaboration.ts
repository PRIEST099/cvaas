// Collaboration & Feedback Types

export interface CVComment {
  id: string;
  cvId: string;
  sectionId: string;
  authorId: string;
  authorType: 'peer' | 'employer' | 'mentor' | 'system';
  
  // Comment positioning
  targetElement: CommentTarget;
  position: CommentPosition;
  
  // Comment content
  content: string;
  type: CommentType;
  priority: CommentPriority;
  tags: string[];
  
  // Collaboration
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  replies: CVCommentReply[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean; // Only visible to CV owner and author
  upvotes: number;
  downvotes: number;
  votedBy: string[];
}

export interface CommentTarget {
  type: 'text' | 'section' | 'bullet_point' | 'skill' | 'experience_item';
  elementId: string;
  textRange?: {
    start: number;
    end: number;
    selectedText: string;
  };
}

export interface CommentPosition {
  x: number;
  y: number;
  anchor: 'left' | 'right' | 'top' | 'bottom';
}

export type CommentType = 
  | 'suggestion' 
  | 'question' 
  | 'praise' 
  | 'concern' 
  | 'grammar' 
  | 'formatting' 
  | 'content_gap' 
  | 'keyword_optimization';

export type CommentPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CVCommentReply {
  id: string;
  commentId: string;
  authorId: string;
  content: string;
  createdAt: string;
  isFromOwner: boolean;
}

// Feedback Sessions
export interface FeedbackSession {
  id: string;
  cvId: string;
  ownerId: string;
  title: string;
  description: string;
  
  // Session configuration
  type: SessionType;
  visibility: SessionVisibility;
  maxParticipants?: number;
  deadline?: string;
  
  // Participants
  participants: FeedbackParticipant[];
  invitations: FeedbackInvitation[];
  
  // Progress
  status: SessionStatus;
  commentsCount: number;
  resolvedCount: number;
  
  // Rewards & Incentives
  rewardPool?: {
    totalBadges: number;
    skillBadges: string[];
    completionReward: number; // in platform credits
  };
  
  createdAt: string;
  updatedAt: string;
}

export type SessionType = 'peer_review' | 'employer_feedback' | 'mentor_session' | 'open_community';
export type SessionVisibility = 'private' | 'invite_only' | 'public';
export type SessionStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface FeedbackParticipant {
  userId: string;
  role: ParticipantRole;
  joinedAt: string;
  commentsGiven: number;
  helpfulVotes: number;
  badgesEarned: string[];
  isActive: boolean;
}

export type ParticipantRole = 'reviewer' | 'mentor' | 'employer' | 'peer';

export interface FeedbackInvitation {
  id: string;
  sessionId: string;
  invitedBy: string;
  invitedUser?: string;
  invitedEmail?: string;
  role: ParticipantRole;
  message: string;
  status: InvitationStatus;
  sentAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Mini-Challenges & Skill Badges
export interface MiniChallenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  
  // Challenge content
  prompt: string;
  instructions: string[];
  resources: ChallengeResource[];
  timeLimit?: number; // in minutes
  
  // Skills & Verification
  skillsAssessed: string[];
  verificationCriteria: VerificationCriteria[];
  passingScore: number;
  
  // Blockchain & Badges
  badgeContract: string; // Smart contract address
  badgeMetadata: BadgeMetadata;
  
  // Challenge stats
  totalAttempts: number;
  successRate: number;
  averageScore: number;
  
  // Metadata
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ChallengeCategory = 
  | 'coding' 
  | 'design' 
  | 'writing' 
  | 'analysis' 
  | 'leadership' 
  | 'communication' 
  | 'problem_solving';

export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ChallengeResource {
  type: 'link' | 'document' | 'video' | 'code_snippet';
  title: string;
  url?: string;
  content?: string;
  isRequired: boolean;
}

export interface VerificationCriteria {
  id: string;
  criterion: string;
  weight: number; // 0-1
  type: 'automated' | 'peer_review' | 'expert_review';
  passingThreshold: number;
}

export interface BadgeMetadata {
  name: string;
  description: string;
  imageUrl: string;
  attributes: BadgeAttribute[];
  rarity: BadgeRarity;
  expiresAt?: string; // Some badges may expire
}

export interface BadgeAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
}

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Challenge Submissions
export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  
  // Submission content
  submission: SubmissionContent;
  submittedAt: string;
  
  // Evaluation
  status: SubmissionStatus;
  score?: number;
  feedback: SubmissionFeedback[];
  
  // Peer review (if required)
  peerReviews: PeerReview[];
  requiredReviews: number;
  
  // Blockchain verification
  blockchainTxHash?: string;
  badgeTokenId?: string;
  verificationProof?: string;
  
  // Metadata
  timeSpent: number; // in minutes
  attempts: number;
}

export interface SubmissionContent {
  type: 'text' | 'code' | 'file' | 'url' | 'multimedia';
  content: string;
  files?: SubmissionFile[];
  metadata?: Record<string, any>;
}

export interface SubmissionFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export type SubmissionStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'peer_review' 
  | 'passed' 
  | 'failed' 
  | 'needs_revision';

export interface SubmissionFeedback {
  id: string;
  reviewerId: string;
  reviewerType: 'automated' | 'peer' | 'expert';
  criterionId: string;
  score: number;
  feedback: string;
  suggestions: string[];
  createdAt: string;
}

export interface PeerReview {
  id: string;
  reviewerId: string;
  scores: { criterionId: string; score: number; feedback: string }[];
  overallFeedback: string;
  recommendedAction: 'pass' | 'fail' | 'needs_revision';
  submittedAt: string;
  helpfulnessScore?: number; // Rated by submission author
}

// Skill Badges & Blockchain
export interface SkillBadge {
  id: string;
  tokenId: string;
  contractAddress: string;
  
  // Badge details
  name: string;
  description: string;
  imageUrl: string;
  skill: string;
  level: BadgeLevel;
  rarity: BadgeRarity;
  
  // Ownership & verification
  ownerId: string;
  earnedAt: string;
  earnedThrough: BadgeSource;
  challengeId?: string;
  
  // Blockchain data
  blockchainData: BlockchainBadgeData;
  
  // Verification & authenticity
  isVerified: boolean;
  verificationProof: string;
  expiresAt?: string;
  
  // Usage & display
  isDisplayed: boolean;
  displayOrder: number;
  endorsements: BadgeEndorsement[];
}

export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type BadgeSource = 'challenge' | 'peer_verification' | 'employer_issued' | 'certification';

export interface BlockchainBadgeData {
  network: 'ethereum' | 'polygon' | 'arbitrum';
  contractAddress: string;
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  mintedAt: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: BadgeAttribute[];
    external_url?: string;
  };
}

export interface BadgeEndorsement {
  id: string;
  badgeId: string;
  endorserId: string;
  endorserType: 'peer' | 'employer' | 'expert';
  message: string;
  credibility: number; // 0-100 based on endorser's reputation
  createdAt: string;
}

// Analytics & Insights
export interface CollaborationAnalytics {
  feedbackMetrics: {
    totalComments: number;
    averageCommentsPerCV: number;
    resolutionRate: number;
    averageResolutionTime: number; // in hours
    topCommentTypes: { type: CommentType; count: number }[];
    mostActiveReviewers: { userId: string; commentsGiven: number }[];
  };
  
  challengeMetrics: {
    totalChallenges: number;
    totalSubmissions: number;
    averageSuccessRate: number;
    badgesIssued: number;
    topSkillsAssessed: { skill: string; count: number }[];
    difficultyDistribution: { difficulty: ChallengeDifficulty; count: number }[];
  };
  
  engagementMetrics: {
    activeFeedbackSessions: number;
    averageParticipantsPerSession: number;
    userRetentionRate: number;
    badgeDisplayRate: number;
    peerReviewAccuracy: number;
  };
}