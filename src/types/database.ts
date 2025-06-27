type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'candidate' | 'recruiter'
          first_name: string | null
          last_name: string | null
          company_name: string | null
          profile_image_url: string | null
          is_verified: boolean
          is_premium_link_subscriber: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'candidate' | 'recruiter'
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          profile_image_url?: string | null
          is_verified?: boolean
          is_premium_link_subscriber?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'candidate' | 'recruiter'
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          profile_image_url?: string | null
          is_verified?: boolean
          is_premium_link_subscriber?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cvs: {
        Row: {
          id: string
          user_id: string
          title: string
          is_public: boolean
          public_url: string | null
          template_id: string
          version: number
          parent_id: string | null
          status: 'draft' | 'published' | 'archived' | 'optimizing'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          is_public?: boolean
          public_url?: string | null
          template_id?: string
          version?: number
          parent_id?: string | null
          status?: 'draft' | 'published' | 'archived' | 'optimizing'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          is_public?: boolean
          public_url?: string | null
          template_id?: string
          version?: number
          parent_id?: string | null
          status?: 'draft' | 'published' | 'archived' | 'optimizing'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      cv_sections: {
        Row: {
          id: string
          cv_id: string
          section_type: string
          title: string
          content: Json
          display_order: number
          is_visible: boolean
          ai_optimized: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          section_type: string
          title: string
          content?: Json
          display_order?: number
          is_visible?: boolean
          ai_optimized?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          section_type?: string
          title?: string
          content?: Json
          display_order?: number
          is_visible?: boolean
          ai_optimized?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      education: {
        Row: {
          id: string
          cv_id: string
          institution: string
          degree: string
          field_of_study: string | null
          start_date: string | null
          end_date: string | null
          is_current: boolean
          gpa: number | null
          honors: string[] | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          institution: string
          degree: string
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          gpa?: number | null
          honors?: string[] | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          institution?: string
          degree?: string
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          gpa?: number | null
          honors?: string[] | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      experience: {
        Row: {
          id: string
          cv_id: string
          company: string
          position: string
          location: string | null
          start_date: string | null
          end_date: string | null
          is_current: boolean
          description: string | null
          achievements: string[] | null
          skills_used: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          company: string
          position: string
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          achievements?: string[] | null
          skills_used?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          company?: string
          position?: string
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          achievements?: string[] | null
          skills_used?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          cv_id: string
          title: string
          description: string | null
          technologies: string[] | null
          start_date: string | null
          end_date: string | null
          is_ongoing: boolean
          project_url: string | null
          github_url: string | null
          achievements: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          title: string
          description?: string | null
          technologies?: string[] | null
          start_date?: string | null
          end_date?: string | null
          is_ongoing?: boolean
          project_url?: string | null
          github_url?: string | null
          achievements?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          title?: string
          description?: string | null
          technologies?: string[] | null
          start_date?: string | null
          end_date?: string | null
          is_ongoing?: boolean
          project_url?: string | null
          github_url?: string | null
          achievements?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          cv_id: string
          name: string
          category: string | null
          proficiency_level: number | null
          years_experience: number | null
          is_verified: boolean
          verification_source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          name: string
          category?: string | null
          proficiency_level?: number | null
          years_experience?: number | null
          is_verified?: boolean
          verification_source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          name?: string
          category?: string | null
          proficiency_level?: number | null
          years_experience?: number | null
          is_verified?: boolean
          verification_source?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          created_by: string
          title: string
          description: string
          category: 'coding' | 'design' | 'writing' | 'analysis' | 'leadership' | 'communication'
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          estimated_time: number | null
          instructions: Json
          resources: Json
          skills_assessed: string[] | null
          verification_criteria: Json
          passing_score: number
          badge_metadata: Json
          is_active: boolean
          total_attempts: number
          success_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by: string
          title: string
          description: string
          category: 'coding' | 'design' | 'writing' | 'analysis' | 'leadership' | 'communication'
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          estimated_time?: number | null
          instructions?: Json
          resources?: Json
          skills_assessed?: string[] | null
          verification_criteria?: Json
          passing_score?: number
          badge_metadata?: Json
          is_active?: boolean
          total_attempts?: number
          success_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string
          title?: string
          description?: string
          category?: 'coding' | 'design' | 'writing' | 'analysis' | 'leadership' | 'communication'
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          estimated_time?: number | null
          instructions?: Json
          resources?: Json
          skills_assessed?: string[] | null
          verification_criteria?: Json
          passing_score?: number
          badge_metadata?: Json
          is_active?: boolean
          total_attempts?: number
          success_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      quest_submissions: {
        Row: {
          id: string
          quest_id: string
          user_id: string
          submission_content: Json
          status: 'submitted' | 'under_review' | 'passed' | 'failed' | 'needs_revision'
          score: number | null
          feedback: Json
          time_spent: number | null
          attempt_number: number
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          quest_id: string
          user_id: string
          submission_content: Json
          status?: 'submitted' | 'under_review' | 'passed' | 'failed' | 'needs_revision'
          score?: number | null
          feedback?: Json
          time_spent?: number | null
          attempt_number?: number
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          quest_id?: string
          user_id?: string
          submission_content?: Json
          status?: 'submitted' | 'under_review' | 'passed' | 'failed' | 'needs_revision'
          score?: number | null
          feedback?: Json
          time_spent?: number | null
          attempt_number?: number
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          quest_id: string | null
          name: string
          description: string | null
          image_url: string | null
          skill: string
          level: string
          rarity: string
          blockchain_data: Json
          is_verified: boolean
          is_displayed: boolean
          display_order: number
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quest_id?: string | null
          name: string
          description?: string | null
          image_url?: string | null
          skill: string
          level?: string
          rarity?: string
          blockchain_data?: Json
          is_verified?: boolean
          is_displayed?: boolean
          display_order?: number
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quest_id?: string | null
          name?: string
          description?: string | null
          image_url?: string | null
          skill?: string
          level?: string
          rarity?: string
          blockchain_data?: Json
          is_verified?: boolean
          is_displayed?: boolean
          display_order?: number
          earned_at?: string
        }
      }
      cv_comments: {
        Row: {
          id: string
          cv_id: string
          section_id: string | null
          author_id: string
          content: string
          comment_type: 'suggestion' | 'question' | 'praise' | 'concern' | 'grammar' | 'formatting'
          priority: 'low' | 'medium' | 'high' | 'critical'
          target_element: Json
          position: Json
          tags: string[] | null
          is_resolved: boolean
          resolved_by: string | null
          resolved_at: string | null
          upvotes: number
          downvotes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          section_id?: string | null
          author_id: string
          content: string
          comment_type?: 'suggestion' | 'question' | 'praise' | 'concern' | 'grammar' | 'formatting'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          target_element?: Json
          position?: Json
          tags?: string[] | null
          is_resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          section_id?: string | null
          author_id?: string
          content?: string
          comment_type?: 'suggestion' | 'question' | 'praise' | 'concern' | 'grammar' | 'formatting'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          target_element?: Json
          position?: Json
          tags?: string[] | null
          is_resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
      }
      comment_replies: {
        Row: {
          id: string
          comment_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          author_id?: string
          content?: string
          created_at?: string
        }
      }
      ephemeral_links: {
        Row: {
          id: string
          cv_id: string
          created_by: string
          access_token: string
          custom_slug: string | null
          expires_at: string
          max_views: number | null
          current_views: number
          allow_download: boolean
          require_password: boolean
          password_hash: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          created_by: string
          access_token: string
          custom_slug?: string | null
          expires_at: string
          max_views?: number | null
          current_views?: number
          allow_download?: boolean
          require_password?: boolean
          password_hash?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          created_by?: string
          access_token?: string
          custom_slug?: string | null
          expires_at?: string
          max_views?: number | null
          current_views?: number
          allow_download?: boolean
          require_password?: boolean
          password_hash?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      link_access_log: {
        Row: {
          id: string
          link_id: string
          accessed_at: string
          ip_address: string | null
          user_agent: string | null
          location: Json
          action: string
        }
        Insert: {
          id?: string
          link_id: string
          accessed_at?: string
          ip_address?: string | null
          user_agent?: string | null
          location?: Json
          action?: string
        }
        Update: {
          id?: string
          link_id?: string
          accessed_at?: string
          ip_address?: string | null
          user_agent?: string | null
          location?: Json
          action?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      access_ephemeral_link: {
        Args: {
          token: string
          password_input?: string
          ip_addr?: string
          user_agent_input?: string
        }
        Returns: Json
      }
      access_ephemeral_link_by_slug: {
        Args: {
          slug: string
          password_input?: string
          ip_addr?: string
          user_agent_input?: string
        }
        Returns: Json
      }
      is_custom_slug_available: {
        Args: {
          slug: string
        }
        Returns: boolean
      }
      generate_custom_slug_suggestions: {
        Args: {
          base_name: string
          user_id: string
        }
        Returns: Json
      }
      log_ephemeral_download: {
        Args: {
          token: string
          ip_addr?: string
          user_agent_input?: string
        }
        Returns: boolean
      }
      log_ephemeral_download_by_slug: {
        Args: {
          slug: string
          ip_addr?: string
          user_agent_input?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'candidate' | 'recruiter'
      cv_status: 'draft' | 'published' | 'archived' | 'optimizing'
      quest_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      quest_category: 'coding' | 'design' | 'writing' | 'analysis' | 'leadership' | 'communication'
      submission_status: 'submitted' | 'under_review' | 'passed' | 'failed' | 'needs_revision'
      comment_type: 'suggestion' | 'question' | 'praise' | 'concern' | 'grammar' | 'formatting'
      comment_priority: 'low' | 'medium' | 'high' | 'critical'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}