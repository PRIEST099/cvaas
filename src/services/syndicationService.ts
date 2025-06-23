import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabase';
import { hashSha256Base64 } from '../lib/utils';
import { EphemeralLink, LinkAccess, CustomSlugSuggestion } from '../types';

class SyndicationService {
  // Ephemeral Links
  async getEphemeralLinks(userId: string): Promise<EphemeralLink[]> {
    try {
      const { data, error } = await supabase
        .from('ephemeral_links')
        .select(`
          *,
          link_access_log (*)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(link => ({
        id: link.id,
        cvId: link.cv_id,
        createdBy: link.created_by,
        accessToken: link.access_token,
        customSlug: link.custom_slug,
        expiresAt: link.expires_at,
        maxViews: link.max_views,
        currentViews: link.current_views,
        allowDownload: link.allow_download,
        requirePassword: link.require_password,
        isActive: link.is_active,
        accessLog: (link.link_access_log || []).map((log: any) => ({
          id: log.id,
          linkId: log.link_id,
          accessedAt: log.accessed_at,
          ipAddress: log.ip_address || '',
          userAgent: log.user_agent || '',
          action: log.action || 'view'
        })),
        createdAt: link.created_at
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  async createEphemeralLink(cvId: string, options: {
    expiresIn: number;
    maxViews?: number;
    allowDownload?: boolean;
    requirePassword?: boolean;
    password?: string;
    customSlug?: string;
  }): Promise<EphemeralLink> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');

      const expiresAt = new Date();
      
      // Check if this is a "no expiry" link
      if (options.expiresIn === Number.MAX_SAFE_INTEGER) {
        // Set expiry to 100 years in the future for "no expiry" links
        expiresAt.setFullYear(expiresAt.getFullYear() + 100);
      } else {
        // Normal expiry calculation
        expiresAt.setHours(expiresAt.getHours() + options.expiresIn);
      }
      
      const accessToken = `ephemeral_${Math.random().toString(36).substring(2)}_${Date.now()}`;

      // Hash password using SHA256 if provided
      let passwordHash = null;
      if (options.requirePassword && options.password) {
        passwordHash = await hashSha256Base64(options.password);
      }

      // Validate custom slug if provided
      if (options.customSlug) {
        const isAvailable = await this.isCustomSlugAvailable(options.customSlug);
        if (!isAvailable) {
          throw new Error('Custom slug is already taken');
        }
      }

      const { data, error } = await supabase
        .from('ephemeral_links')
        .insert({
          cv_id: cvId,
          created_by: user.id,
          access_token: accessToken,
          custom_slug: options.customSlug || null,
          expires_at: expiresAt.toISOString(),
          max_views: options.maxViews,
          current_views: 0,
          allow_download: options.allowDownload || false,
          require_password: options.requirePassword || false,
          password_hash: passwordHash,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        cvId: data.cv_id,
        createdBy: data.created_by,
        accessToken: data.access_token,
        customSlug: data.custom_slug,
        expiresAt: data.expires_at,
        maxViews: data.max_views,
        currentViews: data.current_views,
        allowDownload: data.allow_download,
        requirePassword: data.require_password,
        isActive: data.is_active,
        accessLog: [],
        createdAt: data.created_at
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteEphemeralLink(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ephemeral_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async accessEphemeralLink(accessToken: string, password?: string): Promise<{
    success: boolean;
    cv?: any;
    link?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('access_ephemeral_link', {
        token: accessToken,
        password_input: password,
        ip_addr: null,
        user_agent_input: navigator.userAgent
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to access ephemeral link:', error);
      return {
        success: false,
        error: 'Failed to access link'
      };
    }
  }

  async accessEphemeralLinkBySlug(customSlug: string, password?: string): Promise<{
    success: boolean;
    cv?: any;
    link?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('access_ephemeral_link_by_slug', {
        slug: customSlug,
        password_input: password,
        ip_addr: null,
        user_agent_input: navigator.userAgent
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to access ephemeral link by slug:', error);
      return {
        success: false,
        error: 'Failed to access link'
      };
    }
  }

  async logEphemeralDownload(accessToken: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('log_ephemeral_download', {
        token: accessToken,
        ip_addr: null,
        user_agent_input: navigator.userAgent
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Failed to log download:', error);
      return false;
    }
  }

  async logEphemeralDownloadBySlug(customSlug: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('log_ephemeral_download_by_slug', {
        slug: customSlug,
        ip_addr: null,
        user_agent_input: navigator.userAgent
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Failed to log download by slug:', error);
      return false;
    }
  }

  // Custom Slug Management
  async isCustomSlugAvailable(slug: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_custom_slug_available', {
        slug: slug
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Failed to check slug availability:', error);
      return false;
    }
  }

  async generateCustomSlugSuggestions(baseName: string): Promise<CustomSlugSuggestion[]> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase.rpc('generate_custom_slug_suggestions', {
        base_name: baseName,
        user_id: user.id
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to generate slug suggestions:', error);
      return [];
    }
  }

  // Premium Features
  async checkPremiumLinkAccess(): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('users')
        .select('is_premium_link_subscriber')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data?.is_premium_link_subscriber || false;
    } catch (error) {
      console.error('Failed to check premium access:', error);
      return false;
    }
  }

  async updatePremiumLinkSubscription(userId: string, isSubscribed: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_premium_link_subscriber: isSubscribed })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }
}

export const syndicationService = new SyndicationService();