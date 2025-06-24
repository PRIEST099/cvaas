import { supabase, handleSupabaseError, getCurrentUser, checkUserRole } from '../lib/supabase';
import { cvService } from './cvService';

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