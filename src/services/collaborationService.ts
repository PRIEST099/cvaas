import {
  CVComment,
  FeedbackSession,
  MiniChallenge,
  ChallengeSubmission,
  SkillBadge,
  CollaborationAnalytics,
  CommentTarget,
  CommentPosition,
  CommentType,
  CommentPriority,
  FeedbackInvitation,
  ParticipantRole
} from '../types/collaboration';

// Mock data
const mockComments: CVComment[] = [
  {
    id: 'comment_1',
    cvId: 'cv_1',
    sectionId: 'summary',
    authorId: 'reviewer_1',
    authorType: 'peer',
    targetElement: {
      type: 'text',
      elementId: 'summary_text',
      textRange: {
        start: 45,
        end: 78,
        selectedText: 'experienced software engineer'
      }
    },
    position: { x: 320, y: 150, anchor: 'right' },
    content: 'Consider being more specific about your experience. What technologies? How many years?',
    type: 'suggestion',
    priority: 'medium',
    tags: ['specificity', 'technical_details'],
    isResolved: false,
    replies: [
      {
        id: 'reply_1',
        commentId: 'comment_1',
        authorId: 'cv_owner_1',
        content: 'Good point! I\'ll add specific technologies and years of experience.',
        createdAt: '2024-01-21T10:30:00Z',
        isFromOwner: true
      }
    ],
    createdAt: '2024-01-21T09:15:00Z',
    updatedAt: '2024-01-21T10:30:00Z',
    isPrivate: false,
    upvotes: 3,
    downvotes: 0,
    votedBy: ['user_1', 'user_2', 'user_3']
  },
  {
    id: 'comment_2',
    cvId: 'cv_1',
    sectionId: 'experience',
    authorId: 'employer_1',
    authorType: 'employer',
    targetElement: {
      type: 'bullet_point',
      elementId: 'exp_1_bullet_2'
    },
    position: { x: 280, y: 320, anchor: 'left' },
    content: 'This achievement is impressive! Can you quantify the impact? What was the performance improvement percentage?',
    type: 'question',
    priority: 'high',
    tags: ['quantification', 'impact_metrics'],
    isResolved: false,
    replies: [],
    createdAt: '2024-01-21T11:45:00Z',
    updatedAt: '2024-01-21T11:45:00Z',
    isPrivate: false,
    upvotes: 5,
    downvotes: 0,
    votedBy: ['user_4', 'user_5', 'user_6', 'user_7', 'user_8']
  }
];

const mockChallenges: MiniChallenge[] = [
  {
    id: 'challenge_1',
    title: 'React Component Optimization',
    description: 'Optimize a React component for better performance and accessibility',
    category: 'coding',
    difficulty: 'intermediate',
    prompt: 'You\'ve been given a React component that renders a list of 1000 items. The component is slow and has accessibility issues. Your task is to optimize it.',
    instructions: [
      'Implement virtualization for the list',
      'Add proper ARIA labels',
      'Optimize re-renders',
      'Ensure keyboard navigation works'
    ],
    resources: [
      {
        type: 'link',
        title: 'React Virtualization Guide',
        url: 'https://react-window.vercel.app/',
        isRequired: true
      },
      {
        type: 'code_snippet',
        title: 'Starting Component',
        content: 'const ItemList = ({ items }) => {\n  return (\n    <div>\n      {items.map(item => <Item key={item.id} data={item} />)}\n    </div>\n  );\n};',
        isRequired: true
      }
    ],
    timeLimit: 60,
    skillsAssessed: ['React', 'Performance Optimization', 'Accessibility', 'JavaScript'],
    verificationCriteria: [
      {
        id: 'criteria_1',
        criterion: 'Implements virtualization correctly',
        weight: 0.3,
        type: 'automated',
        passingThreshold: 80
      },
      {
        id: 'criteria_2',
        criterion: 'Proper accessibility implementation',
        weight: 0.25,
        type: 'automated',
        passingThreshold: 85
      },
      {
        id: 'criteria_3',
        criterion: 'Performance improvements measurable',
        weight: 0.25,
        type: 'automated',
        passingThreshold: 75
      },
      {
        id: 'criteria_4',
        criterion: 'Code quality and best practices',
        weight: 0.2,
        type: 'peer_review',
        passingThreshold: 80
      }
    ],
    passingScore: 80,
    badgeContract: '0x1234567890abcdef1234567890abcdef12345678',
    badgeMetadata: {
      name: 'React Performance Master',
      description: 'Demonstrated expertise in React performance optimization and accessibility',
      imageUrl: 'https://badges.cvaas.com/react-performance-master.png',
      attributes: [
        { trait_type: 'Skill', value: 'React' },
        { trait_type: 'Level', value: 'Intermediate' },
        { trait_type: 'Category', value: 'Performance' },
        { trait_type: 'Earned Date', value: '2024-01-21', display_type: 'date' }
      ],
      rarity: 'uncommon'
    },
    totalAttempts: 156,
    successRate: 0.68,
    averageScore: 82,
    createdBy: 'platform_admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'challenge_2',
    title: 'UX Writing Excellence',
    description: 'Craft compelling and user-friendly microcopy for a mobile app',
    category: 'writing',
    difficulty: 'intermediate',
    prompt: 'You\'re tasked with writing microcopy for a fintech app\'s onboarding flow. The copy should be clear, trustworthy, and reduce user anxiety.',
    instructions: [
      'Write error messages that help users recover',
      'Create onboarding copy that builds trust',
      'Design empty state messages that guide action',
      'Craft confirmation messages that reassure users'
    ],
    resources: [
      {
        type: 'link',
        title: 'UX Writing Guidelines',
        url: 'https://uxwriting.com/guidelines',
        isRequired: true
      },
      {
        type: 'document',
        title: 'App Context & User Research',
        content: 'Target users: 25-45, tech-savvy, security-conscious...',
        isRequired: true
      }
    ],
    timeLimit: 45,
    skillsAssessed: ['UX Writing', 'Communication', 'User Psychology', 'Content Strategy'],
    verificationCriteria: [
      {
        id: 'criteria_5',
        criterion: 'Clarity and conciseness',
        weight: 0.3,
        type: 'peer_review',
        passingThreshold: 85
      },
      {
        id: 'criteria_6',
        criterion: 'Tone appropriateness',
        weight: 0.25,
        type: 'peer_review',
        passingThreshold: 80
      },
      {
        id: 'criteria_7',
        criterion: 'User empathy and guidance',
        weight: 0.25,
        type: 'expert_review',
        passingThreshold: 85
      },
      {
        id: 'criteria_8',
        criterion: 'Brand voice consistency',
        weight: 0.2,
        type: 'expert_review',
        passingThreshold: 80
      }
    ],
    passingScore: 82,
    badgeContract: '0xabcdef1234567890abcdef1234567890abcdef12',
    badgeMetadata: {
      name: 'UX Writing Specialist',
      description: 'Proven ability to craft user-centered microcopy that drives engagement',
      imageUrl: 'https://badges.cvaas.com/ux-writing-specialist.png',
      attributes: [
        { trait_type: 'Skill', value: 'UX Writing' },
        { trait_type: 'Level', value: 'Intermediate' },
        { trait_type: 'Category', value: 'Communication' },
        { trait_type: 'Earned Date', value: '2024-01-21', display_type: 'date' }
      ],
      rarity: 'rare'
    },
    totalAttempts: 89,
    successRate: 0.74,
    averageScore: 85,
    createdBy: 'ux_expert_1',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

const mockBadges: SkillBadge[] = [
  {
    id: 'badge_1',
    tokenId: '1001',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'React Performance Master',
    description: 'Demonstrated expertise in React performance optimization and accessibility',
    imageUrl: 'https://badges.cvaas.com/react-performance-master.png',
    skill: 'React',
    level: 'silver',
    rarity: 'uncommon',
    ownerId: 'user_1',
    earnedAt: '2024-01-21T15:30:00Z',
    earnedThrough: 'challenge',
    challengeId: 'challenge_1',
    blockchainData: {
      network: 'polygon',
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
      tokenId: '1001',
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 12345678,
      gasUsed: 150000,
      mintedAt: '2024-01-21T15:30:00Z',
      metadata: {
        name: 'React Performance Master',
        description: 'Demonstrated expertise in React performance optimization and accessibility',
        image: 'https://badges.cvaas.com/react-performance-master.png',
        attributes: [
          { trait_type: 'Skill', value: 'React' },
          { trait_type: 'Level', value: 'Intermediate' },
          { trait_type: 'Category', value: 'Performance' }
        ]
      }
    },
    isVerified: true,
    verificationProof: 'ipfs://QmVerificationProofHash123',
    isDisplayed: true,
    displayOrder: 1,
    endorsements: [
      {
        id: 'endorsement_1',
        badgeId: 'badge_1',
        endorserId: 'employer_1',
        endorserType: 'employer',
        message: 'Excellent work on the React optimization challenge. The solution was both elegant and performant.',
        credibility: 95,
        createdAt: '2024-01-21T16:00:00Z'
      }
    ]
  }
];

class CollaborationService {
  private baseUrl = '/api/collaboration';

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // CV Comments & Feedback
  async getComments(cvId: string): Promise<CVComment[]> {
    await this.delay();
    return mockComments.filter(comment => comment.cvId === cvId);
  }

  async addComment(commentData: Partial<CVComment>): Promise<CVComment> {
    await this.delay();
    const newComment: CVComment = {
      id: `comment_${Date.now()}`,
      cvId: commentData.cvId!,
      sectionId: commentData.sectionId!,
      authorId: commentData.authorId!,
      authorType: commentData.authorType!,
      targetElement: commentData.targetElement!,
      position: commentData.position!,
      content: commentData.content!,
      type: commentData.type || 'suggestion',
      priority: commentData.priority || 'medium',
      tags: commentData.tags || [],
      isResolved: false,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrivate: commentData.isPrivate || false,
      upvotes: 0,
      downvotes: 0,
      votedBy: []
    };
    mockComments.push(newComment);
    return newComment;
  }

  async updateComment(commentId: string, updates: Partial<CVComment>): Promise<CVComment> {
    await this.delay();
    const commentIndex = mockComments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) throw new Error('Comment not found');
    
    mockComments[commentIndex] = {
      ...mockComments[commentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return mockComments[commentIndex];
  }

  async resolveComment(commentId: string, resolvedBy: string): Promise<CVComment> {
    await this.delay();
    return this.updateComment(commentId, {
      isResolved: true,
      resolvedBy,
      resolvedAt: new Date().toISOString()
    });
  }

  async voteOnComment(commentId: string, userId: string, voteType: 'up' | 'down'): Promise<CVComment> {
    await this.delay();
    const comment = mockComments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');
    
    // Remove previous vote if exists
    const hasVoted = comment.votedBy.includes(userId);
    if (hasVoted) {
      comment.votedBy = comment.votedBy.filter(id => id !== userId);
      if (voteType === 'up') comment.upvotes--;
      else comment.downvotes--;
    }
    
    // Add new vote
    comment.votedBy.push(userId);
    if (voteType === 'up') comment.upvotes++;
    else comment.downvotes++;
    
    return comment;
  }

  // Feedback Sessions
  async createFeedbackSession(sessionData: Partial<FeedbackSession>): Promise<FeedbackSession> {
    await this.delay();
    const newSession: FeedbackSession = {
      id: `session_${Date.now()}`,
      cvId: sessionData.cvId!,
      ownerId: sessionData.ownerId!,
      title: sessionData.title!,
      description: sessionData.description || '',
      type: sessionData.type || 'peer_review',
      visibility: sessionData.visibility || 'invite_only',
      maxParticipants: sessionData.maxParticipants,
      deadline: sessionData.deadline,
      participants: [],
      invitations: [],
      status: 'draft',
      commentsCount: 0,
      resolvedCount: 0,
      rewardPool: sessionData.rewardPool,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newSession;
  }

  async inviteToFeedbackSession(
    sessionId: string, 
    invitations: { email?: string; userId?: string; role: ParticipantRole; message: string }[]
  ): Promise<FeedbackInvitation[]> {
    await this.delay();
    return invitations.map(inv => ({
      id: `inv_${Date.now()}_${Math.random()}`,
      sessionId,
      invitedBy: 'current_user',
      invitedUser: inv.userId,
      invitedEmail: inv.email,
      role: inv.role,
      message: inv.message,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  // Mini-Challenges
  async getChallenges(filters?: { category?: string; difficulty?: string; skill?: string }): Promise<MiniChallenge[]> {
    await this.delay();
    let challenges = [...mockChallenges];
    
    if (filters?.category) {
      challenges = challenges.filter(c => c.category === filters.category);
    }
    if (filters?.difficulty) {
      challenges = challenges.filter(c => c.difficulty === filters.difficulty);
    }
    if (filters?.skill) {
      challenges = challenges.filter(c => 
        c.skillsAssessed.some(skill => 
          skill.toLowerCase().includes(filters.skill!.toLowerCase())
        )
      );
    }
    
    return challenges;
  }

  async getChallenge(challengeId: string): Promise<MiniChallenge> {
    await this.delay();
    const challenge = mockChallenges.find(c => c.id === challengeId);
    if (!challenge) throw new Error('Challenge not found');
    return challenge;
  }

  async submitChallenge(challengeId: string, submission: any): Promise<ChallengeSubmission> {
    await this.delay(2000); // Simulate processing time
    
    const newSubmission: ChallengeSubmission = {
      id: `submission_${Date.now()}`,
      challengeId,
      userId: 'current_user',
      submission: {
        type: submission.type,
        content: submission.content,
        files: submission.files || [],
        metadata: submission.metadata
      },
      submittedAt: new Date().toISOString(),
      status: 'under_review',
      feedback: [],
      peerReviews: [],
      requiredReviews: 2,
      timeSpent: submission.timeSpent || 0,
      attempts: 1
    };
    
    // Simulate automated scoring
    setTimeout(() => {
      newSubmission.status = 'passed';
      newSubmission.score = 85;
      newSubmission.blockchainTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      newSubmission.badgeTokenId = '1002';
    }, 3000);
    
    return newSubmission;
  }

  // Skill Badges
  async getUserBadges(userId: string): Promise<SkillBadge[]> {
    await this.delay();
    return mockBadges.filter(badge => badge.ownerId === userId);
  }

  async verifyBadge(tokenId: string, contractAddress: string): Promise<{ isValid: boolean; metadata: any }> {
    await this.delay(1000); // Simulate blockchain verification
    return {
      isValid: true,
      metadata: {
        name: 'React Performance Master',
        description: 'Verified on blockchain',
        attributes: []
      }
    };
  }

  async endorseBadge(badgeId: string, endorsement: { message: string; endorserType: string }): Promise<void> {
    await this.delay();
    const badge = mockBadges.find(b => b.id === badgeId);
    if (badge) {
      badge.endorsements.push({
        id: `endorsement_${Date.now()}`,
        badgeId,
        endorserId: 'current_user',
        endorserType: endorsement.endorserType as any,
        message: endorsement.message,
        credibility: 85,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Analytics
  async getCollaborationAnalytics(userId?: string): Promise<CollaborationAnalytics> {
    await this.delay();
    return {
      feedbackMetrics: {
        totalComments: 1247,
        averageCommentsPerCV: 8.3,
        resolutionRate: 0.78,
        averageResolutionTime: 24,
        topCommentTypes: [
          { type: 'suggestion', count: 456 },
          { type: 'question', count: 234 },
          { type: 'praise', count: 189 }
        ],
        mostActiveReviewers: [
          { userId: 'reviewer_1', commentsGiven: 89 },
          { userId: 'reviewer_2', commentsGiven: 67 }
        ]
      },
      challengeMetrics: {
        totalChallenges: 45,
        totalSubmissions: 2341,
        averageSuccessRate: 0.71,
        badgesIssued: 1658,
        topSkillsAssessed: [
          { skill: 'React', count: 234 },
          { skill: 'JavaScript', count: 198 },
          { skill: 'UX Writing', count: 156 }
        ],
        difficultyDistribution: [
          { difficulty: 'beginner', count: 12 },
          { difficulty: 'intermediate', count: 23 },
          { difficulty: 'advanced', count: 8 },
          { difficulty: 'expert', count: 2 }
        ]
      },
      engagementMetrics: {
        activeFeedbackSessions: 34,
        averageParticipantsPerSession: 4.2,
        userRetentionRate: 0.84,
        badgeDisplayRate: 0.92,
        peerReviewAccuracy: 0.87
      }
    };
  }
}

export const collaborationService = new CollaborationService();