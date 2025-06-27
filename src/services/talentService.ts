import { supabase, handleSupabaseError, getCurrentUser, checkUserRole } from '../lib/supabase';
import { cvService } from './cvService';
import { CandidateInvitation, InvitationStats } from '../types';
import { aiService } from './aiService';

interface TalentSearchFilters {
  skills?: string[];
  experience?: string;
  location?: string;
  education?: string;
  salary?: string;
  availability?: string;
  keywords?: string;
}

interface TalentSearchResult {
  profiles: any[];
  total: number;
  page: number;
  pageSize: number;
  filters: TalentSearchFilters;
  aggregations: {
    skills: string[];
    seniority: string[];
    locations: string[];
    industries: string[];
    salaryRanges: string[];
  };
}

interface SmartPool {
  id: string;
  name: string;
  description: string;
  filters: TalentSearchFilters;
  candidateCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AIMatchRequest {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
}

interface AIMatchResult {
  matches: {
    candidateId: string;
    score: number;
    relevance: number;
    matchedSkills: string[];
    missingSkills: string[];
    notes: string;
    profile?: any; // Full candidate profile data
  }[];
  suggestions: string[];
}

class TalentService {
  // Search talent using the anonymized candidate profiles view
  async searchTalent(filters: TalentSearchFilters, page: number = 1, pageSize: number = 20): Promise<TalentSearchResult> {
    try {
      // Ensure user is a recruiter
      await checkUserRole('recruiter');

      let query = supabase
        .from('candidate_cv_profiles')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.keywords) {
        // Search in CV title and sections content
        query = query.or(`cv_title.ilike.%${filters.keywords}%,sections.cs.%${filters.keywords}%`);
      }

      if (filters.skills && filters.skills.length > 0) {
        // Search for skills in the skills array
        const skillsFilter = filters.skills.map(skill => 
          `skills.cs.%${skill}%`
        ).join(',');
        query = query.or(skillsFilter);
      }

      if (filters.location) {
        // Search in location fields
        query = query.or(`sections.cs.%${filters.location}%`);
      }

      if (filters.experience) {
        // Filter by experience level (this would need more sophisticated logic)
        // For now, we'll search in experience descriptions
        query = query.or(`experience.cs.%${filters.experience}%`);
      }

      if (filters.education) {
        // Search in education data
        query = query.or(`education.cs.%${filters.education}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Order by most recently updated
      query = query.order('updated_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        profiles: data || [],
        total: count || 0,
        page,
        pageSize,
        filters,
        aggregations: {
          skills: [], // Would be populated with actual aggregation logic
          seniority: [],
          locations: [],
          industries: [],
          salaryRanges: []
        }
      };
    } catch (error) {
      console.error('Talent search failed:', error);
      return {
        profiles: [],
        total: 0,
        page,
        pageSize,
        filters,
        aggregations: {
          skills: [],
          seniority: [],
          locations: [],
          industries: [],
          salaryRanges: []
        }
      };
    }
  }

  // Get anonymized candidate CV for recruiter viewing
  async getAnonymizedCandidateCV(cvId: string): Promise<any> {
    try {
      // Ensure user is a recruiter
      await checkUserRole('recruiter');

      const { data, error } = await supabase
        .from('candidate_cv_profiles')
        .select('*')
        .eq('cv_id', cvId)
        .single();

      if (error) throw error;

      // Log the recruiter view
      await cvService.incrementCVRecruiterView(cvId);

      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  // AI-powered candidate matching
  async getAICandidateMatches(request: AIMatchRequest): Promise<AIMatchResult> {
    try {
      // Ensure user is a recruiter
      await checkUserRole('recruiter');
      
      // First, get a pool of candidates to match against
      const { profiles } = await this.searchTalent({}, 1, 50);
      
      if (profiles.length === 0) {
        return {
          matches: [],
          suggestions: ['No candidate profiles found to match against. Try adding more candidates to the platform.']
        };
      }
      
      // Call the AI service to match candidates to the job
      const matchResult = await aiService.matchCandidatesToJob({
        jobTitle: request.jobTitle,
        jobDescription: request.jobDescription,
        requiredSkills: request.requiredSkills,
        candidates: profiles
      });
      
      // Enrich the matches with full profile data
      const enrichedMatches = matchResult.matches.map(match => {
        const profile = profiles.find(p => p.cv_id === match.candidateId);
        return {
          ...match,
          profile
        };
      });
      
      return {
        matches: enrichedMatches,
        suggestions: matchResult.suggestions || []
      };
    } catch (error) {
      console.error('AI candidate matching failed:', error);
      throw error;
    }
  }

  // Smart Pools Management
  async getSmartPools(userId: string): Promise<SmartPool[]> {
    try {
      const { data, error } = await supabase
        .from('smart_pools')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data and add candidate count (placeholder for now)
      return (data || []).map(pool => ({
        id: pool.id,
        name: pool.name,
        description: pool.description || '',
        filters: pool.filters || {},
        candidateCount: 0, // Would be calculated based on filters
        isActive: pool.is_active,
        createdAt: pool.created_at,
        updatedAt: pool.updated_at
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  async createSmartPool(poolData: {
    name: string;
    description: string;
    filters: TalentSearchFilters;
  }): Promise<SmartPool> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('smart_pools')
        .insert({
          created_by: user.id,
          name: poolData.name,
          description: poolData.description,
          filters: poolData.filters,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        filters: data.filters || {},
        candidateCount: 0,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateSmartPool(poolId: string, updates: Partial<SmartPool>): Promise<SmartPool> {
    try {
      const { data, error } = await supabase
        .from('smart_pools')
        .update({
          name: updates.name,
          description: updates.description,
          filters: updates.filters,
          is_active: updates.isActive
        })
        .eq('id', poolId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        filters: data.filters || {},
        candidateCount: 0,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteSmartPool(poolId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('smart_pools')
        .delete()
        .eq('id', poolId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  // Candidate Invitation System
  async sendInvitation(invitation: {
    candidateId: string;
    cvId: string;
    questId?: string;
    message: string;
    expiresInDays?: number;
  }): Promise<CandidateInvitation> {
    try {
      const recruiter = await checkUserRole('recruiter');
      
      // Calculate expiration date (default: 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (invitation.expiresInDays || 7));
      
      const { data, error } = await supabase
        .from('candidate_invitations')
        .insert({
          candidate_id: invitation.candidateId,
          recruiter_id: recruiter.id,
          quest_id: invitation.questId,
          cv_id: invitation.cvId,
          message: invitation.message,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        candidateId: data.candidate_id,
        recruiterId: data.recruiter_id,
        questId: data.quest_id,
        cvId: data.cv_id,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        responseAt: data.response_at,
        responseMessage: data.response_message
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }
  
  async getInvitations(options?: {
    status?: 'pending' | 'accepted' | 'declined';
    candidateId?: string;
    questId?: string;
  }): Promise<CandidateInvitation[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');
      
      let query = supabase
        .from('candidate_invitations')
        .select(`
          *,
          candidates:candidate_id (first_name, last_name, email),
          recruiters:recruiter_id (first_name, last_name, company_name),
          quests (title, category, difficulty)
        `);
      
      // Filter by user role
      if (user.role === 'recruiter') {
        query = query.eq('recruiter_id', user.id);
      } else {
        query = query.eq('candidate_id', user.id);
      }
      
      // Apply additional filters
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      if (options?.candidateId) {
        query = query.eq('candidate_id', options.candidateId);
      }
      
      if (options?.questId) {
        query = query.eq('quest_id', options.questId);
      }
      
      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(invitation => ({
        id: invitation.id,
        candidateId: invitation.candidate_id,
        recruiterId: invitation.recruiter_id,
        questId: invitation.quest_id,
        cvId: invitation.cv_id,
        message: invitation.message,
        status: invitation.status,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        responseAt: invitation.response_at,
        responseMessage: invitation.response_message
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }
  
  async respondToInvitation(invitationId: string, response: {
    status: 'accepted' | 'declined';
    message?: string;
  }): Promise<CandidateInvitation> {
    try {
      const user = await checkUserRole('candidate');
      
      const { data, error } = await supabase
        .from('candidate_invitations')
        .update({
          status: response.status,
          response_at: new Date().toISOString(),
          response_message: response.message || null
        })
        .eq('id', invitationId)
        .eq('candidate_id', user.id) // Ensure the candidate owns this invitation
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        candidateId: data.candidate_id,
        recruiterId: data.recruiter_id,
        questId: data.quest_id,
        cvId: data.cv_id,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        responseAt: data.response_at,
        responseMessage: data.response_message
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }
  
  async getInvitationStats(): Promise<InvitationStats> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');
      
      // This would be better implemented as a database function or view
      // For now, we'll fetch all invitations and calculate stats client-side
      const { data, error } = await supabase
        .from('candidate_invitations')
        .select('status')
        .eq('recruiter_id', user.id);
      
      if (error) throw error;
      
      const invitations = data || [];
      const total = invitations.length;
      const pending = invitations.filter(i => i.status === 'pending').length;
      const accepted = invitations.filter(i => i.status === 'accepted').length;
      const declined = invitations.filter(i => i.status === 'declined').length;
      const responseRate = total > 0 ? (accepted + declined) / total : 0;
      
      return {
        total,
        pending,
        accepted,
        declined,
        responseRate
      };
    } catch (error) {
      console.error('Failed to get invitation stats:', error);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        responseRate: 0
      };
    }
  }

  // Analytics for talent discovery
  async getTalentAnalytics(companyId: string): Promise<any> {
    try {
      // This would aggregate data from various sources
      // For now, return placeholder data structure
      
      return {
        searchMetrics: {
          totalSearches: 0,
          uniqueSearchers: 0,
          averageResultsPerSearch: 0,
          topKeywords: [],
          topFilters: []
        },
        invitationMetrics: {
          totalInvitations: 0,
          responseRate: 0,
          acceptanceRate: 0,
          averageResponseTime: 0,
          topDeclineReasons: []
        },
        poolMetrics: {
          totalPools: 0,
          averagePoolSize: 0,
          mostActiveFilters: [],
          poolPerformance: []
        },
        recruiterViews: {
          totalViews: 0,
          uniqueCandidatesViewed: 0,
          averageViewsPerCandidate: 0,
          topViewedProfiles: []
        }
      };
    } catch (error) {
      console.error('Failed to get talent analytics:', error);
      return {
        searchMetrics: {
          totalSearches: 0,
          uniqueSearchers: 0,
          averageResultsPerSearch: 0,
          topKeywords: [],
          topFilters: []
        },
        invitationMetrics: {
          totalInvitations: 0,
          responseRate: 0,
          acceptanceRate: 0,
          averageResponseTime: 0,
          topDeclineReasons: []
        },
        poolMetrics: {
          totalPools: 0,
          averagePoolSize: 0,
          mostActiveFilters: [],
          poolPerformance: []
        },
        recruiterViews: {
          totalViews: 0,
          uniqueCandidatesViewed: 0,
          averageViewsPerCandidate: 0,
          topViewedProfiles: []
        }
      };
    }
  }
}

export const talentService = new TalentService();