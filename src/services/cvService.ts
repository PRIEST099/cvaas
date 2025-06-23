import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabase';
import { Database } from '../types/database';

type CV = Database['public']['Tables']['cvs']['Row'];
type CVInsert = Database['public']['Tables']['cvs']['Insert'];
type CVUpdate = Database['public']['Tables']['cvs']['Update'];
type CVSection = Database['public']['Tables']['cv_sections']['Row'];
type CVSectionInsert = Database['public']['Tables']['cv_sections']['Insert'];

class CVService {
  // CV Management
  async getCVs(userId?: string): Promise<CV[]> {
    try {
      const user = await getCurrentUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', targetUserId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  async getCV(cvId: string): Promise<CV & { sections: CVSection[] }> {
    try {
      // Get CV with sections
      const { data: cv, error: cvError } = await supabase
        .from('cvs')
        .select(`
          *,
          cv_sections (*)
        `)
        .eq('id', cvId)
        .single();

      if (cvError) throw cvError;
      if (!cv) throw new Error('CV not found');

      return {
        ...cv,
        sections: cv.cv_sections || []
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async createCV(cvData: Partial<CVInsert>): Promise<CV> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('cvs')
        .insert({
          user_id: user.id,
          title: cvData.title || 'Untitled CV',
          template_id: cvData.template_id || 'modern-1',
          ...cvData
        })
        .select()
        .single();

      if (error) throw error;

      // Create default sections
      const defaultSections: CVSectionInsert[] = [
        {
          cv_id: data.id,
          section_type: 'personal_info',
          title: 'Personal Information',
          display_order: 0
        },
        {
          cv_id: data.id,
          section_type: 'summary',
          title: 'Professional Summary',
          display_order: 1
        },
        {
          cv_id: data.id,
          section_type: 'experience',
          title: 'Experience',
          display_order: 2
        },
        {
          cv_id: data.id,
          section_type: 'education',
          title: 'Education',
          display_order: 3
        },
        {
          cv_id: data.id,
          section_type: 'skills',
          title: 'Skills',
          display_order: 4
        }
      ];

      const { error: sectionsError } = await supabase
        .from('cv_sections')
        .insert(defaultSections);

      if (sectionsError) throw sectionsError;

      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateCV(cvId: string, updates: CVUpdate): Promise<CV> {
    try {
      const { data, error } = await supabase
        .from('cvs')
        .update(updates)
        .eq('id', cvId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteCV(cvId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cvId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // CV Sections
  async updateCVSection(sectionId: string, updates: Partial<CVSection>): Promise<CVSection> {
    try {
      const { data, error } = await supabase
        .from('cv_sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  // Public CV access
  async getPublicCV(publicUrl: string): Promise<CV & { sections: CVSection[] }> {
    try {
      const { data: cv, error } = await supabase
        .from('cvs')
        .select(`
          *,
          cv_sections (*)
        `)
        .eq('public_url', publicUrl)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      if (!cv) throw new Error('Public CV not found');

      return {
        ...cv,
        sections: cv.cv_sections || []
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  // Search CVs (for recruiters)
  async searchCVs(query: string, filters?: {
    skills?: string[];
    experience_years?: number;
    location?: string;
  }): Promise<CV[]> {
    try {
      let queryBuilder = supabase
        .from('cvs')
        .select('*')
        .eq('is_public', true);

      if (query) {
        queryBuilder = queryBuilder.textSearch('title', query);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  // Placeholder methods for future AI features
  async optimizeForRole(request: {
    cvId: string;
    jobDescription: string;
    preserveOriginal?: boolean;
  }): Promise<any> {
    // Placeholder for AI optimization
    console.log('AI optimization not yet implemented');
    return {
      optimizationId: 'placeholder',
      changes: [],
      keywordsHighlighted: [],
      score: 0,
      estimatedImpact: 'AI optimization coming soon',
      suggestions: []
    };
  }

  async scanSkills(request: {
    sources: any;
    existingSkills?: string[];
  }): Promise<any> {
    // Placeholder for skills scanning
    console.log('Skills scanning not yet implemented');
    return {
      scanId: 'placeholder',
      detectedSkills: [],
      skillCategories: [],
      recommendations: []
    };
  }

  async createVersion(request: {
    cvId: string;
    title: string;
    description?: string;
    templateId?: string;
    changes: string[];
  }): Promise<any> {
    // Placeholder for version control
    console.log('Version control not yet implemented');
    return {
      versionId: 'placeholder',
      version: 1,
      comparisonUrl: ''
    };
  }

  async getCVVersions(cvId: string): Promise<any[]> {
    // Placeholder for version history
    console.log('Version history not yet implemented');
    return [];
  }

  async applyOptimization(cvId: string, optimizationId: string): Promise<CV> {
    // Placeholder for applying optimizations
    console.log('Apply optimization not yet implemented');
    const cv = await this.getCV(cvId);
    return cv;
  }
}

export const cvService = new CVService();