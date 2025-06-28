import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabase';
import { Database } from '../types/database';
import { aiService } from './aiService';
import { generatePublicSlug } from '../lib/utils';

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

interface OptimizationResult {
  optimizedContent: any;
  suggestions: string[];
  confidence: number;
}

interface CVOptimizationResult {
  optimizedSections: Record<string, any>;
  suggestions: string[];
  confidence: number;
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
        .maybeSingle();

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
          metadata: {
            totalViews: 0,
            uniqueViews: 0,
            downloadCount: 0,
            shareCount: 0,
            recruiterViews: 0,
            topReferrers: [],
            keywordMatches: [],
            ...cvData.metadata
          },
          ...cvData
        })
        .select()
        .maybeSingle();

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
        },
        {
          cv_id: data.id,
          section_type: 'projects',
          title: 'Projects',
          display_order: 5
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
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async publishCV(cvId: string): Promise<CV> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');
      
      // Generate a unique public URL slug
      const publicSlug = generatePublicSlug();
      
      // Update the CV status to published and set the public URL
      const { data, error } = await supabase
        .from('cvs')
        .update({
          status: 'published',
          is_public: true,
          public_url: publicSlug
        })
        .eq('id', cvId)
        .eq('user_id', user.id) // Ensure the user owns this CV
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('CV not found or you do not have permission to publish it');
      
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async unpublishCV(cvId: string): Promise<CV> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');
      
      // Update the CV status to draft and remove the public URL
      const { data, error } = await supabase
        .from('cvs')
        .update({
          status: 'draft',
          is_public: false,
          public_url: null
        })
        .eq('id', cvId)
        .eq('user_id', user.id) // Ensure the user owns this CV
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('CV not found or you do not have permission to unpublish it');
      
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

  // Increment recruiter view count
  async incrementCVRecruiterView(cvId: string): Promise<boolean> {
    try {
      // Get current CV metadata
      const { data: cv, error: fetchError } = await supabase
        .from('cvs')
        .select('metadata')
        .eq('id', cvId)
        .single();

      if (fetchError) throw fetchError;

      const currentMetadata = cv.metadata || {};
      const currentRecruiterViews = currentMetadata.recruiterViews || 0;

      // Update recruiter views
      const { error: updateError } = await supabase
        .from('cvs')
        .update({
          metadata: {
            ...currentMetadata,
            recruiterViews: currentRecruiterViews + 1
          }
        })
        .eq('id', cvId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Failed to increment recruiter view:', error);
      return false;
    }
  }

  // CV Sections
  async updateCVSection(sectionId: string, updates: Partial<CVSection>): Promise<CVSection> {
    try {
      // If we're updating content and there's no original_content stored, preserve the current content
      if (updates.content) {
        const { data: currentSection } = await supabase
          .from('cv_sections')
          .select('content, original_content')
          .eq('id', sectionId)
          .single();

        if (currentSection && !currentSection.original_content) {
          updates.original_content = currentSection.content;
        }
      }

      const { data, error } = await supabase
        .from('cv_sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  // AI Optimization Methods
  async optimizeCV(cvId: string, jobDescription?: string): Promise<CVOptimizationResult> {
    try {
      // Get the full CV with all sections
      const cv = await this.getCV(cvId);
      
      // Update CV status to optimizing
      await this.updateCV(cvId, { status: 'optimizing' });
      
      // Call AI service to optimize the entire CV
      const result = await aiService.optimizeCVContent({
        cvData: cv,
        context: jobDescription
      });
      
      // Apply optimized content to each section
      const optimizedSectionIds: Record<string, any> = {};
      
      for (const sectionType in result.optimizedSections) {
        const section = cv.sections.find(s => s.section_type === sectionType);
        if (section) {
          // Store original content if not already stored
          const originalContent = section.original_content || section.content;
          
          // Update the section with optimized content
          const updatedSection = await this.updateCVSection(section.id, {
            content: result.optimizedSections[sectionType],
            ai_optimized: true,
            original_content: originalContent
          });
          
          optimizedSectionIds[section.id] = updatedSection.content;
        }
      }
      
      // Update CV status back to previous state
      await this.updateCV(cvId, {
        status: cv.status === 'optimizing' ? 'draft' : cv.status
      });
      
      return {
        optimizedSections: result.optimizedSections,
        suggestions: result.suggestions || [],
        confidence: result.confidence || 0.8
      };
    } catch (error) {
      // Ensure CV status is reset even if optimization fails
      try {
        const { data: currentCV } = await supabase
          .from('cvs')
          .select('status')
          .eq('id', cvId)
          .single();
          
        if (currentCV && currentCV.status === 'optimizing') {
          await this.updateCV(cvId, { status: 'draft' });
        }
      } catch (statusError) {
        console.error('Failed to reset CV status:', statusError);
      }
      
      handleSupabaseError(error);
      throw error;
    }
  }

  async optimizeCVSection(sectionId: string, jobDescription?: string): Promise<OptimizationResult> {
    try {
      // Get current section data
      const { data: section, error: fetchError } = await supabase
        .from('cv_sections')
        .select('*')
        .eq('id', sectionId)
        .single();

      if (fetchError) throw fetchError;
      if (!section) throw new Error('Section not found');

      // Extract text content based on section type
      const textToOptimize = this.extractTextFromSectionContent(section.content, section.section_type);
      
      if (!textToOptimize.trim()) {
        throw new Error('No content to optimize in this section');
      }

      // Call AI service for optimization
      const optimizationResponse = await aiService.optimizeText({
        text: textToOptimize,
        context: jobDescription,
        sectionType: section.section_type
      });

      // Create optimized content structure
      const optimizedContent = this.createOptimizedSectionContent(
        section.content,
        optimizationResponse.optimizedText,
        section.section_type
      );

      // Store original content if not already stored
      const updateData: any = {
        content: optimizedContent,
        ai_optimized: true
      };

      if (!section.original_content) {
        updateData.original_content = section.content;
      }

      // Update the section with optimized content
      const { error: updateError } = await supabase
        .from('cv_sections')
        .update(updateData)
        .eq('id', sectionId);

      if (updateError) throw updateError;

      return {
        optimizedContent,
        suggestions: optimizationResponse.suggestions || [],
        confidence: optimizationResponse.confidence || 0.8
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async rollbackCVSection(sectionId: string): Promise<CVSection> {
    try {
      // Get current section data
      const { data: section, error: fetchError } = await supabase
        .from('cv_sections')
        .select('*')
        .eq('id', sectionId)
        .single();

      if (fetchError) throw fetchError;
      if (!section) throw new Error('Section not found');
      if (!section.original_content) throw new Error('No original content to rollback to');

      // Rollback to original content
      const { data, error } = await supabase
        .from('cv_sections')
        .update({
          content: section.original_content,
          ai_optimized: false,
          original_content: null
        })
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

  // Helper methods for AI optimization
  private extractTextFromSectionContent(content: any, sectionType: string): string {
    if (!content) return '';

    switch (sectionType) {
      case 'summary':
        return content.summary || '';
      
      case 'experience':
        if (content.experiences && Array.isArray(content.experiences)) {
          return content.experiences
            .map((exp: any) => exp.description || '')
            .filter(Boolean)
            .join('\n\n');
        }
        return '';
      
      case 'personal_info':
        return content.title || content.summary || '';
      
      case 'projects':
        if (content.projects && Array.isArray(content.projects)) {
          return content.projects
            .map((proj: any) => proj.description || '')
            .filter(Boolean)
            .join('\n\n');
        }
        return '';
      
      case 'skills':
        if (content.skillCategories && Array.isArray(content.skillCategories)) {
          return content.skillCategories
            .map((cat: any) => cat.skills?.map((skill: any) => skill.name).join(', ') || '')
            .filter(Boolean)
            .join('\n');
        }
        return '';
      
      default:
        // For other section types, try to extract any text content
        if (typeof content === 'string') return content;
        if (content.description) return content.description;
        if (content.content) return content.content;
        return JSON.stringify(content);
    }
  }

  private createOptimizedSectionContent(originalContent: any, optimizedText: string, sectionType: string): any {
    if (!originalContent) return { optimizedText };

    const optimized = { ...originalContent };

    switch (sectionType) {
      case 'summary':
        optimized.summary = optimizedText;
        break;
      
      case 'experience':
        if (optimized.experiences && Array.isArray(optimized.experiences)) {
          // For now, apply optimization to the first experience entry
          // In a more sophisticated implementation, you might want to optimize each experience separately
          if (optimized.experiences.length > 0) {
            optimized.experiences[0].description = optimizedText;
          }
        }
        break;
      
      case 'personal_info':
        optimized.title = optimizedText;
        break;
      
      case 'projects':
        if (optimized.projects && Array.isArray(optimized.projects)) {
          // Apply optimization to the first project entry
          if (optimized.projects.length > 0) {
            optimized.projects[0].description = optimizedText;
          }
        }
        break;
      
      case 'skills':
        // For skills, the optimization might return a restructured list
        // This is a simplified approach - you might want to parse the optimized text more intelligently
        optimized.optimizedDescription = optimizedText;
        break;
      
      default:
        optimized.optimizedContent = optimizedText;
    }

    return optimized;
  }

  // Education Management
  async addEducation(cvId: string, education: Omit<Education, 'id' | 'cv_id' | 'created_at' | 'updated_at'>): Promise<Education> {
    try {
      const { data, error } = await supabase
        .from('education')
        .insert({ ...education, cv_id: cvId })
        .select()
        .maybeSingle();
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
        .maybeSingle();

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
        .maybeSingle();

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
        .maybeSingle();

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
        .maybeSingle();

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
        .maybeSingle();

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
        .maybeSingle();

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
        .maybeSingle();

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
        .maybeSingle();

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