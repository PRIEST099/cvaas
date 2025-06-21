import { 
  SyndicationCredit, 
  CandidateSubmission, 
  SyndicationMarketplace,
  CreditTransaction,
  EphemeralLink,
  ZKCredential,
  SyndicationAnalytics
} from '../types/syndication';

// Mock data for syndication system
const mockCredits: SyndicationCredit[] = [
  {
    id: 'credit_1',
    ownerId: 'user_business_1',
    amount: 150,
    type: 'purchase',
    source: 'purchase',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'credit_2',
    ownerId: 'user_business_1',
    amount: 25,
    type: 'referral',
    source: 'referral_bonus',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

const mockSubmissions: CandidateSubmission[] = [
  {
    id: 'sub_1',
    submitterId: 'recruiter_1',
    candidateId: 'candidate_1',
    projectId: 'project_1',
    creditsUsed: 10,
    submissionType: 'direct_referral',
    qualityScore: 85,
    status: 'approved',
    revenueShare: {
      submitterId: 'recruiter_1',
      percentage: 15,
      amount: 2500,
      currency: 'USD',
      status: 'pending'
    },
    submittedAt: '2024-01-20T00:00:00Z',
    reviewedAt: '2024-01-21T00:00:00Z'
  }
];

const mockEphemeralLinks: EphemeralLink[] = [
  {
    id: 'link_1',
    cvId: 'cv_1',
    createdBy: 'user_1',
    accessToken: 'ephemeral_abc123xyz',
    expiresAt: '2024-01-25T00:00:00Z',
    maxViews: 5,
    currentViews: 2,
    allowDownload: true,
    isActive: true,
    accessLog: [
      {
        id: 'access_1',
        linkId: 'link_1',
        accessedAt: '2024-01-22T10:00:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        action: 'view'
      }
    ],
    createdAt: '2024-01-22T00:00:00Z'
  }
];

class SyndicationService {
  private baseUrl = '/api/syndication';

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Credit Management
  async getUserCredits(userId: string): Promise<SyndicationCredit[]> {
    await this.delay();
    return mockCredits.filter(credit => credit.ownerId === userId);
  }

  async getCreditBalance(userId: string): Promise<number> {
    await this.delay();
    const credits = await this.getUserCredits(userId);
    return credits.reduce((total, credit) => total + credit.amount, 0);
  }

  async purchaseCredits(userId: string, amount: number, paymentMethod: string): Promise<SyndicationCredit> {
    await this.delay(1000);
    const newCredit: SyndicationCredit = {
      id: `credit_${Date.now()}`,
      ownerId: userId,
      amount,
      type: 'purchase',
      source: 'purchase',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockCredits.push(newCredit);
    return newCredit;
  }

  async transferCredits(fromUserId: string, toUserId: string, amount: number): Promise<CreditTransaction> {
    await this.delay();
    const transaction: CreditTransaction = {
      id: `tx_${Date.now()}`,
      fromUserId,
      toUserId,
      amount,
      type: 'transferred',
      reference: 'manual_transfer',
      description: `Credit transfer from ${fromUserId} to ${toUserId}`,
      createdAt: new Date().toISOString()
    };
    return transaction;
  }

  // Candidate Submissions
  async submitCandidate(submission: Partial<CandidateSubmission>): Promise<CandidateSubmission> {
    await this.delay();
    const newSubmission: CandidateSubmission = {
      id: `sub_${Date.now()}`,
      submitterId: submission.submitterId!,
      candidateId: submission.candidateId!,
      projectId: submission.projectId!,
      creditsUsed: submission.creditsUsed || 10,
      submissionType: submission.submissionType || 'direct_referral',
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    mockSubmissions.push(newSubmission);
    return newSubmission;
  }

  async getSubmissions(userId: string): Promise<CandidateSubmission[]> {
    await this.delay();
    return mockSubmissions.filter(sub => sub.submitterId === userId);
  }

  async updateSubmissionStatus(submissionId: string, status: string, qualityScore?: number): Promise<CandidateSubmission> {
    await this.delay();
    const submission = mockSubmissions.find(s => s.id === submissionId);
    if (!submission) throw new Error('Submission not found');
    
    submission.status = status as any;
    submission.qualityScore = qualityScore;
    submission.reviewedAt = new Date().toISOString();
    
    return submission;
  }

  // Marketplace
  async getMarketplaceListings(): Promise<SyndicationMarketplace[]> {
    await this.delay();
    return [
      {
        id: 'market_1',
        sellerId: 'recruiter_premium_1',
        creditAmount: 100,
        pricePerCredit: 0.95,
        currency: 'USD',
        minPurchase: 10,
        maxPurchase: 100,
        isActive: true,
        totalSold: 450,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'market_2',
        sellerId: 'agency_partner_1',
        creditAmount: 500,
        pricePerCredit: 0.90,
        currency: 'USD',
        minPurchase: 50,
        maxPurchase: 500,
        isActive: true,
        totalSold: 1200,
        createdAt: '2024-01-10T00:00:00Z'
      }
    ];
  }

  async createMarketplaceListing(listing: Partial<SyndicationMarketplace>): Promise<SyndicationMarketplace> {
    await this.delay();
    const newListing: SyndicationMarketplace = {
      id: `market_${Date.now()}`,
      sellerId: listing.sellerId!,
      creditAmount: listing.creditAmount!,
      pricePerCredit: listing.pricePerCredit!,
      currency: listing.currency || 'USD',
      minPurchase: listing.minPurchase || 1,
      maxPurchase: listing.maxPurchase || listing.creditAmount!,
      isActive: true,
      totalSold: 0,
      createdAt: new Date().toISOString()
    };
    return newListing;
  }

  // Ephemeral Links
  async createEphemeralLink(cvId: string, options: {
    expiresIn: number; // hours
    maxViews?: number;
    allowDownload?: boolean;
    requirePassword?: boolean;
    password?: string;
  }): Promise<EphemeralLink> {
    await this.delay();
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + options.expiresIn);
    
    const link: EphemeralLink = {
      id: `link_${Date.now()}`,
      cvId,
      createdBy: 'current_user',
      accessToken: `ephemeral_${Math.random().toString(36).substring(2)}`,
      expiresAt: expiresAt.toISOString(),
      maxViews: options.maxViews,
      currentViews: 0,
      allowDownload: options.allowDownload || false,
      requirePassword: options.requirePassword || false,
      password: options.password,
      isActive: true,
      accessLog: [],
      createdAt: new Date().toISOString()
    };
    
    mockEphemeralLinks.push(link);
    return link;
  }

  async accessEphemeralLink(token: string, password?: string): Promise<{ cv: any; canDownload: boolean }> {
    await this.delay();
    const link = mockEphemeralLinks.find(l => l.accessToken === token);
    
    if (!link || !link.isActive) {
      throw new Error('Link not found or expired');
    }
    
    if (new Date() > new Date(link.expiresAt)) {
      throw new Error('Link has expired');
    }
    
    if (link.maxViews && link.currentViews >= link.maxViews) {
      throw new Error('Link has reached maximum views');
    }
    
    if (link.requirePassword && link.password !== password) {
      throw new Error('Invalid password');
    }
    
    // Log access
    link.currentViews++;
    link.accessLog.push({
      id: `access_${Date.now()}`,
      linkId: link.id,
      accessedAt: new Date().toISOString(),
      ipAddress: '192.168.1.1', // Would be real IP
      userAgent: navigator.userAgent,
      action: 'view'
    });
    
    return {
      cv: { id: link.cvId, title: 'Sample CV' }, // Would fetch real CV
      canDownload: link.allowDownload
    };
  }

  async getEphemeralLinks(userId: string): Promise<EphemeralLink[]> {
    await this.delay();
    return mockEphemeralLinks.filter(link => link.createdBy === userId);
  }

  // Zero-Knowledge Credentials
  async createZKCredential(credentialData: Partial<ZKCredential>): Promise<ZKCredential> {
    await this.delay(2000); // Simulate ZK proof generation
    
    const credential: ZKCredential = {
      id: `zk_${Date.now()}`,
      userId: credentialData.userId!,
      credentialType: credentialData.credentialType!,
      issuer: credentialData.issuer || 'platform',
      proofHash: `zk_proof_${Math.random().toString(36)}`,
      verificationKey: `vk_${Math.random().toString(36)}`,
      isVerified: false,
      metadata: credentialData.metadata || {},
      createdAt: new Date().toISOString()
    };
    
    return credential;
  }

  async verifyZKCredential(credentialId: string, proofData: string): Promise<boolean> {
    await this.delay(1500); // Simulate ZK verification
    // In real implementation, this would verify the zero-knowledge proof
    return Math.random() > 0.1; // 90% success rate for demo
  }

  // Analytics
  async getSyndicationAnalytics(userId: string): Promise<SyndicationAnalytics> {
    await this.delay();
    return {
      totalCreditsEarned: 275,
      totalCreditsSpent: 125,
      currentBalance: 150,
      successfulSubmissions: 8,
      totalRevenue: 12500,
      averageQualityScore: 82,
      topPerformingSubmissions: mockSubmissions.slice(0, 3),
      creditHistory: [
        {
          id: 'tx_1',
          toUserId: userId,
          amount: 25,
          type: 'earned',
          reference: 'referral_bonus',
          description: 'Referral bonus for successful hire',
          createdAt: '2024-01-20T00:00:00Z'
        }
      ],
      marketplaceActivity: {
        totalSales: 450,
        averagePrice: 0.95,
        topBuyers: ['buyer_1', 'buyer_2', 'buyer_3']
      }
    };
  }
}

export const syndicationService = new SyndicationService();