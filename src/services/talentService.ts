import { 
  TalentProfile, 
  TalentSearchFilters, 
  TalentSearchResult, 
  SmartPool, 
  TalentInvitation,
  TalentAnalytics,
  ScoringWeights
} from '../types/talent';

// Mock data for talent profiles
const mockTalentProfiles: TalentProfile[] = [
  {
    id: 'talent_1',
    anonymousId: 'ANX_001',
    userId: 'user_1',
    isAnonymous: true,
    title: 'Senior Full Stack Engineer',
    seniority: 'senior',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      isRemote: true,
      timezone: 'PST'
    },
    skills: [
      { name: 'JavaScript', category: 'Programming', proficiency: 95, yearsExperience: 6, isVerified: true, verificationSource: 'quest' },
      { name: 'React', category: 'Frontend', proficiency: 90, yearsExperience: 5, isVerified: true, verificationSource: 'quest' },
      { name: 'Node.js', category: 'Backend', proficiency: 85, yearsExperience: 4, isVerified: true },
      { name: 'TypeScript', category: 'Programming', proficiency: 88, yearsExperience: 3, isVerified: true },
      { name: 'AWS', category: 'Cloud', proficiency: 80, yearsExperience: 3, isVerified: false }
    ],
    experience: [
      {
        id: 'exp_1',
        title: 'Senior Software Engineer',
        company: 'Tech Unicorn Inc.',
        industry: 'Technology',
        duration: 24,
        isCurrentRole: true,
        skills: ['JavaScript', 'React', 'Node.js', 'AWS'],
        achievements: ['Led team of 5 engineers', 'Improved app performance by 40%', 'Launched 3 major features'],
        startDate: '2022-01-01',
        endDate: undefined
      },
      {
        id: 'exp_2',
        title: 'Software Engineer',
        company: 'Growing Startup',
        industry: 'FinTech',
        duration: 18,
        isCurrentRole: false,
        skills: ['JavaScript', 'Vue.js', 'Python'],
        achievements: ['Built payment processing system', 'Reduced API response time by 60%'],
        startDate: '2020-07-01',
        endDate: '2021-12-31'
      }
    ],
    education: [
      {
        id: 'edu_1',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Top University',
        graduationYear: 2020,
        gpa: 3.8,
        honors: ['Magna Cum Laude', 'Dean\'s List']
      }
    ],
    scores: {
      overall: 87,
      technical: 92,
      cultural: 85,
      communication: 80,
      leadership: 88,
      growth: 90,
      reliability: 95
    },
    availability: 'open_to_opportunities',
    preferences: {
      salaryRange: { min: 140000, max: 180000, currency: 'USD' },
      workArrangement: ['remote', 'hybrid'],
      companySize: ['medium', 'large'],
      industries: ['Technology', 'FinTech', 'HealthTech'],
      roleTypes: ['Senior Engineer', 'Tech Lead', 'Principal Engineer'],
      benefits: ['Health Insurance', 'Stock Options', 'Flexible PTO'],
      dealBreakers: ['No remote work', 'Micromanagement']
    },
    lastActive: '2024-01-20T10:30:00Z',
    profileCompleteness: 95,
    verificationStatus: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'talent_2',
    anonymousId: 'ANX_002',
    userId: 'user_2',
    isAnonymous: true,
    title: 'Product Designer',
    seniority: 'mid',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      isRemote: false,
      timezone: 'EST'
    },
    skills: [
      { name: 'Figma', category: 'Design Tools', proficiency: 95, yearsExperience: 4, isVerified: true },
      { name: 'User Research', category: 'UX', proficiency: 85, yearsExperience: 3, isVerified: true },
      { name: 'Prototyping', category: 'Design', proficiency: 90, yearsExperience: 4, isVerified: true },
      { name: 'Design Systems', category: 'Design', proficiency: 80, yearsExperience: 2, isVerified: false }
    ],
    experience: [
      {
        id: 'exp_3',
        title: 'Product Designer',
        company: 'Design-Forward Company',
        industry: 'E-commerce',
        duration: 30,
        isCurrentRole: true,
        skills: ['Figma', 'User Research', 'Prototyping'],
        achievements: ['Redesigned checkout flow, increased conversion by 25%', 'Led design system initiative'],
        startDate: '2021-07-01',
        endDate: undefined
      }
    ],
    education: [
      {
        id: 'edu_2',
        degree: 'Bachelor of Fine Arts',
        field: 'Graphic Design',
        institution: 'Art Institute',
        graduationYear: 2019
      }
    ],
    scores: {
      overall: 82,
      technical: 85,
      cultural: 88,
      communication: 92,
      leadership: 75,
      growth: 85,
      reliability: 90
    },
    availability: 'actively_looking',
    preferences: {
      salaryRange: { min: 90000, max: 120000, currency: 'USD' },
      workArrangement: ['onsite', 'hybrid'],
      companySize: ['startup', 'medium'],
      industries: ['E-commerce', 'SaaS', 'Consumer'],
      roleTypes: ['Product Designer', 'UX Designer', 'Senior Designer'],
      benefits: ['Health Insurance', 'Professional Development'],
      dealBreakers: ['No design input in product decisions']
    },
    lastActive: '2024-01-21T14:15:00Z',
    profileCompleteness: 88,
    verificationStatus: 'partial',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-21T14:15:00Z'
  },
  {
    id: 'talent_3',
    anonymousId: 'ANX_003',
    userId: 'user_3',
    isAnonymous: true,
    title: 'Data Scientist',
    seniority: 'lead',
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      isRemote: true,
      timezone: 'CST'
    },
    skills: [
      { name: 'Python', category: 'Programming', proficiency: 95, yearsExperience: 7, isVerified: true },
      { name: 'Machine Learning', category: 'AI/ML', proficiency: 92, yearsExperience: 6, isVerified: true },
      { name: 'TensorFlow', category: 'AI/ML', proficiency: 88, yearsExperience: 4, isVerified: true },
      { name: 'SQL', category: 'Database', proficiency: 90, yearsExperience: 7, isVerified: true },
      { name: 'Leadership', category: 'Soft Skills', proficiency: 85, yearsExperience: 3, isVerified: false }
    ],
    experience: [
      {
        id: 'exp_4',
        title: 'Lead Data Scientist',
        company: 'AI-First Company',
        industry: 'Technology',
        duration: 36,
        isCurrentRole: true,
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Leadership'],
        achievements: ['Built recommendation engine serving 10M+ users', 'Led team of 8 data scientists', 'Published 3 research papers'],
        startDate: '2021-01-01',
        endDate: undefined
      }
    ],
    education: [
      {
        id: 'edu_3',
        degree: 'PhD',
        field: 'Computer Science',
        institution: 'Research University',
        graduationYear: 2018,
        honors: ['Summa Cum Laude']
      }
    ],
    scores: {
      overall: 94,
      technical: 96,
      cultural: 90,
      communication: 88,
      leadership: 95,
      growth: 92,
      reliability: 98
    },
    availability: 'not_looking',
    preferences: {
      salaryRange: { min: 180000, max: 250000, currency: 'USD' },
      workArrangement: ['remote'],
      companySize: ['large', 'enterprise'],
      industries: ['Technology', 'AI/ML', 'Research'],
      roleTypes: ['Lead Data Scientist', 'Principal Data Scientist', 'Head of Data Science'],
      benefits: ['Stock Options', 'Research Budget', 'Conference Attendance'],
      dealBreakers: ['No research opportunities', 'Micromanagement']
    },
    lastActive: '2024-01-19T09:45:00Z',
    profileCompleteness: 98,
    verificationStatus: 'premium',
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-19T09:45:00Z'
  }
];

const mockSmartPools: SmartPool[] = [
  {
    id: 'pool_1',
    name: 'Senior Frontend Engineers',
    description: 'Experienced React/Vue developers for our product team',
    companyId: 'company_1',
    createdBy: 'user_business_1',
    filters: {
      skills: ['React', 'Vue.js', 'JavaScript', 'TypeScript'],
      seniority: ['senior', 'lead'],
      availability: ['actively_looking', 'open_to_opportunities'],
      salaryRange: { min: 120000, max: 200000, currency: 'USD' },
      location: { remoteOnly: true }
    },
    scoringWeights: {
      technical: 0.4,
      cultural: 0.2,
      communication: 0.15,
      leadership: 0.1,
      growth: 0.05,
      reliability: 0.05,
      experience: 0.03,
      education: 0.01,
      availability: 0.01,
      locationMatch: 0.0
    },
    autoRefresh: true,
    refreshFrequency: 'weekly',
    candidateCount: 47,
    averageScore: 84,
    lastRefreshed: '2024-01-20T00:00:00Z',
    isActive: true,
    tags: ['frontend', 'react', 'senior'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'pool_2',
    name: 'Product Design Leaders',
    description: 'Senior designers with leadership experience',
    companyId: 'company_1',
    createdBy: 'user_business_1',
    filters: {
      skills: ['Figma', 'User Research', 'Design Systems', 'Leadership'],
      seniority: ['senior', 'lead', 'principal'],
      availability: ['actively_looking', 'open_to_opportunities'],
      experience: { minYears: 5 }
    },
    scoringWeights: {
      technical: 0.3,
      cultural: 0.25,
      communication: 0.2,
      leadership: 0.15,
      growth: 0.05,
      reliability: 0.03,
      experience: 0.02,
      education: 0.0,
      availability: 0.0,
      locationMatch: 0.0
    },
    autoRefresh: true,
    refreshFrequency: 'daily',
    candidateCount: 23,
    averageScore: 87,
    lastRefreshed: '2024-01-21T00:00:00Z',
    isActive: true,
    tags: ['design', 'leadership', 'senior'],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-21T00:00:00Z'
  }
];

class TalentService {
  private baseUrl = '/api/talent';

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Talent Search & Discovery
  async searchTalent(filters: TalentSearchFilters, page: number = 1, pageSize: number = 20): Promise<TalentSearchResult> {
    await this.delay();
    
    // Apply filters to mock data
    let filteredProfiles = [...mockTalentProfiles];
    
    if (filters.skills?.length) {
      filteredProfiles = filteredProfiles.filter(profile =>
        filters.skills!.some(skill =>
          profile.skills.some(s => s.name.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }
    
    if (filters.seniority?.length) {
      filteredProfiles = filteredProfiles.filter(profile =>
        filters.seniority!.includes(profile.seniority)
      );
    }
    
    if (filters.availability?.length) {
      filteredProfiles = filteredProfiles.filter(profile =>
        filters.availability!.includes(profile.availability)
      );
    }
    
    if (filters.location?.remoteOnly) {
      filteredProfiles = filteredProfiles.filter(profile => profile.location.isRemote);
    }
    
    if (filters.salaryRange) {
      filteredProfiles = filteredProfiles.filter(profile => {
        const profileMax = profile.preferences.salaryRange.max;
        const profileMin = profile.preferences.salaryRange.min;
        return (!filters.salaryRange!.min || profileMin >= filters.salaryRange!.min) &&
               (!filters.salaryRange!.max || profileMax <= filters.salaryRange!.max);
      });
    }
    
    // Apply scoring and sorting
    const scoredProfiles = this.applyFitScoring(filteredProfiles, filters);
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedProfiles = scoredProfiles.slice(startIndex, startIndex + pageSize);
    
    return {
      profiles: paginatedProfiles,
      total: filteredProfiles.length,
      page,
      pageSize,
      filters,
      aggregations: this.generateAggregations(filteredProfiles)
    };
  }

  private applyFitScoring(profiles: TalentProfile[], filters: TalentSearchFilters): TalentProfile[] {
    return profiles.map(profile => {
      let fitScore = profile.scores.overall;
      
      // Boost score based on skill matches
      if (filters.skills?.length) {
        const skillMatches = filters.skills.filter(skill =>
          profile.skills.some(s => s.name.toLowerCase().includes(skill.toLowerCase()))
        );
        const skillMatchRatio = skillMatches.length / filters.skills.length;
        fitScore = fitScore * (0.7 + 0.3 * skillMatchRatio);
      }
      
      // Boost for availability
      if (profile.availability === 'actively_looking') fitScore *= 1.1;
      if (profile.availability === 'open_to_opportunities') fitScore *= 1.05;
      
      // Boost for verification
      if (profile.verificationStatus === 'verified') fitScore *= 1.05;
      if (profile.verificationStatus === 'premium') fitScore *= 1.1;
      
      return {
        ...profile,
        scores: {
          ...profile.scores,
          overall: Math.min(100, Math.round(fitScore))
        }
      };
    }).sort((a, b) => b.scores.overall - a.scores.overall);
  }

  private generateAggregations(profiles: TalentProfile[]): any {
    const skillCounts = new Map<string, number>();
    const seniorityCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();
    
    profiles.forEach(profile => {
      // Skills
      profile.skills.forEach(skill => {
        skillCounts.set(skill.name, (skillCounts.get(skill.name) || 0) + 1);
      });
      
      // Seniority
      seniorityCounts.set(profile.seniority, (seniorityCounts.get(profile.seniority) || 0) + 1);
      
      // Location
      const location = `${profile.location.city}, ${profile.location.state}`;
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
    });
    
    return {
      skills: Array.from(skillCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      seniority: Array.from(seniorityCounts.entries())
        .map(([level, count]) => ({ level: level as any, count })),
      locations: Array.from(locationCounts.entries())
        .map(([location, count]) => ({ location, count }))
        .slice(0, 10),
      industries: [],
      salaryRanges: []
    };
  }

  // Smart Pools
  async getSmartPools(companyId: string): Promise<SmartPool[]> {
    await this.delay();
    return mockSmartPools.filter(pool => pool.companyId === companyId);
  }

  async createSmartPool(poolData: Partial<SmartPool>): Promise<SmartPool> {
    await this.delay();
    const newPool: SmartPool = {
      id: `pool_${Date.now()}`,
      name: poolData.name || 'New Pool',
      description: poolData.description || '',
      companyId: poolData.companyId!,
      createdBy: poolData.createdBy!,
      filters: poolData.filters || {},
      scoringWeights: poolData.scoringWeights || {
        technical: 0.3,
        cultural: 0.2,
        communication: 0.15,
        leadership: 0.1,
        growth: 0.1,
        reliability: 0.05,
        experience: 0.05,
        education: 0.03,
        availability: 0.01,
        locationMatch: 0.01
      },
      autoRefresh: poolData.autoRefresh || false,
      refreshFrequency: poolData.refreshFrequency || 'weekly',
      candidateCount: 0,
      averageScore: 0,
      lastRefreshed: new Date().toISOString(),
      isActive: poolData.isActive !== false,
      tags: poolData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockSmartPools.push(newPool);
    return newPool;
  }

  async updateSmartPool(poolId: string, updates: Partial<SmartPool>): Promise<SmartPool> {
    await this.delay();
    const poolIndex = mockSmartPools.findIndex(pool => pool.id === poolId);
    if (poolIndex === -1) throw new Error('Pool not found');
    
    mockSmartPools[poolIndex] = {
      ...mockSmartPools[poolIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return mockSmartPools[poolIndex];
  }

  async refreshSmartPool(poolId: string): Promise<SmartPool> {
    await this.delay(1000); // Simulate refresh processing
    const pool = mockSmartPools.find(p => p.id === poolId);
    if (!pool) throw new Error('Pool not found');
    
    // Simulate refresh by running search with pool filters
    const searchResult = await this.searchTalent(pool.filters);
    
    pool.candidateCount = searchResult.total;
    pool.averageScore = searchResult.profiles.reduce((sum, p) => sum + p.scores.overall, 0) / searchResult.profiles.length;
    pool.lastRefreshed = new Date().toISOString();
    
    return pool;
  }

  // Talent Invitations
  async sendInvitation(invitation: Partial<TalentInvitation>): Promise<TalentInvitation> {
    await this.delay();
    const newInvitation: TalentInvitation = {
      id: `inv_${Date.now()}`,
      talentId: invitation.talentId!,
      companyId: invitation.companyId!,
      projectId: invitation.projectId,
      questId: invitation.questId,
      type: invitation.type || 'general_inquiry',
      message: invitation.message || '',
      compensation: invitation.compensation,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    return newInvitation;
  }

  async getInvitations(companyId: string): Promise<TalentInvitation[]> {
    await this.delay();
    // Mock invitations data
    return [
      {
        id: 'inv_1',
        talentId: 'talent_1',
        companyId,
        type: 'interview',
        message: 'We\'d love to chat about a senior engineering role',
        status: 'pending',
        sentAt: '2024-01-20T10:00:00Z',
        expiresAt: '2024-01-27T10:00:00Z'
      }
    ];
  }

  // Analytics
  async getTalentAnalytics(companyId: string): Promise<TalentAnalytics> {
    await this.delay();
    return {
      searchMetrics: {
        totalSearches: 156,
        uniqueSearchers: 12,
        averageResultsPerSearch: 23,
        topKeywords: ['React', 'JavaScript', 'Python', 'Design', 'Leadership'],
        topFilters: ['Remote', 'Senior Level', 'Actively Looking']
      },
      invitationMetrics: {
        totalInvitations: 45,
        responseRate: 0.67,
        acceptanceRate: 0.34,
        averageResponseTime: 48,
        topDeclineReasons: ['Salary too low', 'Not interested in role', 'Already committed']
      },
      poolMetrics: {
        totalPools: 8,
        averagePoolSize: 34,
        mostActiveFilters: ['Skills', 'Seniority', 'Location'],
        poolPerformance: [
          { poolId: 'pool_1', successRate: 0.28 },
          { poolId: 'pool_2', successRate: 0.35 }
        ]
      }
    };
  }
}

export const talentService = new TalentService();