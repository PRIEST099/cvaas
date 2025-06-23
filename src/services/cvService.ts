import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabase';
import { Database } from '../types/database';

type CV = Database['public']['Tables']['cvs']['Row'];
type CVInsert = Database['public']['Tables']['cvs']['Insert'];
type CVUpdate = Database['public']['Tables']['cvs']['Update'];
type CVSection = Database['public']['Tables']['cv_sections']['Row'];
type CVSectionInsert = Database['public']['Tables']['cv_sections']['Insert'];
type Education = Database['public']['Tables']['education']['Row'];
type Experience = Database['public']['Tables']['experience']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Skill = Database['public']['Tables']['skills']['Row'];

interface CVWithContent extends CV {
  sections: CVSection[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
}

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

  async getCV(cvId: string): Promise<CVWithContent> {
    try {
      // Get CV with all related content
      const { data: cv, error: cvError } = await supabase
        .from('cvs')
        .select(`
          *,
          cv_sections (*),
          education (*),
          experience (*),
          projects (*),
          skills (*)
        `)
        .eq('id', cvId)
        .single();

      if (cvError) throw cvError;
      if (!cv) throw new Error('CV not found');

      return {
        ...cv,
        sections: cv.cv_sections || [],
        education: cv.education || [],
        experience: cv.experience || [],
        projects: cv.projects || [],
        skills: cv.skills || []
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

  // Education Management
  async addEducation(cvId: string, education: Omit<Education, 'id' | 'cv_id' | 'created_at' | 'updated_at'>): Promise<Education> {
    try {
      const { data, error } = await supabase
        .from('education')
        .insert({ ...education, cv_id: cvId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateEducation(educationId: string, updates: Partial<Education>): Promise<Education> {
    try {
      const { data, error } = await supabase
        .from('education')
        .update(updates)
        .eq('id', educationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteEducation(educationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', educationId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Experience Management
  async addExperience(cvId: string, experience: Omit<Experience, 'id' | 'cv_id' | 'created_at' | 'updated_at'>): Promise<Experience> {
    try {
      const { data, error } = await supabase
        .from('experience')
        .insert({ ...experience, cv_id: cvId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateExperience(experienceId: string, updates: Partial<Experience>): Promise<Experience> {
    try {
      const { data, error } = await supabase
        .from('experience')
        .update(updates)
        .eq('id', experienceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteExperience(experienceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', experienceId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Project Management
  async addProject(cvId: string, project: Omit<Project, 'id' | 'cv_id' | 'created_at' | 'updated_at'>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, cv_id: cvId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Skills Management
  async addSkill(cvId: string, skill: Omit<Skill, 'id' | 'cv_id' | 'created_at' | 'updated_at'>): Promise<Skill> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert({ ...skill, cv_id: cvId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateSkill(skillId: string, updates: Partial<Skill>): Promise<Skill> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', skillId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteSkill(skillId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
    }
  }

  // Public CV access
  async getPublicCV(publicUrl: string): Promise<CVWithContent> {
    try {
      const { data: cv, error } = await supabase
        .from('cvs')
        .select(`
          *,
          cv_sections (*),
          education (*),
          experience (*),
          projects (*),
          skills (*)
        `)
        .eq('public_url', publicUrl)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      if (!cv) throw new Error('Public CV not found');

      return {
        ...cv,
        sections: cv.cv_sections || [],
        education: cv.education || [],
        experience: cv.experience || [],
        projects: cv.projects || [],
        skills: cv.skills || []
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