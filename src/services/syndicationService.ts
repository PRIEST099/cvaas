import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabase';
import { EphemeralLink, LinkAccess } from '../types';

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
  }): Promise<EphemeralLink> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + options.expiresIn);
      
      const accessToken = `ephemeral_${Math.random().toString(36).substring(2)}_${Date.now()}`;

      const { data, error } = await supabase
        .from('ephemeral_links')
        .insert({
          cv_id: cvId,
          created_by: user.id,
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
          max_views: options.maxViews,
          current_views: 0,
          allow_download: options.allowDownload || false,
          require_password: options.requirePassword || false,
          password_hash: options.password ? btoa(options.password) : null,
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
}

export const syndicationService = new SyndicationService();