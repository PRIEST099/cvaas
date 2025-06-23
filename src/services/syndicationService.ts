import { supabase, handleSupabaseError, getCurrentUser } from '../lib/supabase';

// Basic types for syndication service
interface EphemeralLink {
  id: string;
  cvId: string;
  createdBy: string;
  accessToken: string;
  expiresAt: string;
  maxViews?: number;
  currentViews: number;
  allowDownload: boolean;
  requirePassword?: boolean;
  password?: string;
  isActive: boolean;
  accessLog: LinkAccess[];
  createdAt: string;
}

interface LinkAccess {
  id: string;
  linkId: string;
  accessedAt: string;
  ipAddress: string;
  userAgent: string;
  action: 'view' | 'download';
}

interface SyndicationCredit {
  id: string;
  ownerId: string;
  amount: number;
  type: string;
  source: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SyndicationMarketplace {
  id: string;
  sellerId: string;
  creditAmount: number;
  pricePerCredit: number;
  currency: string;
  minPurchase: number;
  maxPurchase: number;
  isActive: boolean;
  totalSold: number;
  createdAt: string;
}

interface SyndicationAnalytics {
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  currentBalance: number;
  successfulSubmissions: number;
  totalRevenue: number;
  averageQualityScore: number;
  topPerformingSubmissions: any[];
  creditHistory: any[];
  marketplaceActivity: {
    totalSales: number;
    averagePrice: number;
    topBuyers: string[];
  };
}

class SyndicationService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
        ip_addr: null, // Could be populated from request headers
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

  // Marketplace (placeholder implementation)
  async getMarketplaceListings(): Promise<SyndicationMarketplace[]> {
    await this.delay();
    // Return empty array for now - marketplace functionality can be implemented later
    return [];
  }

  async purchaseCredits(userId: string, amount: number, paymentMethod: string): Promise<SyndicationCredit> {
    await this.delay();
    // Placeholder implementation
    return {
      id: `credit_${Date.now()}`,
      ownerId: userId,
      amount,
      type: 'purchase',
      source: 'purchase',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getUserCredits(userId: string): Promise<SyndicationCredit[]> {
    await this.delay();
    // Placeholder implementation
    return [];
  }

  async getSyndicationAnalytics(userId: string): Promise<SyndicationAnalytics> {
    await this.delay();
    // Placeholder implementation
    return {
      totalCreditsEarned: 0,
      totalCreditsSpent: 0,
      currentBalance: 0,
      successfulSubmissions: 0,
      totalRevenue: 0,
      averageQualityScore: 0,
      topPerformingSubmissions: [],
      creditHistory: [],
      marketplaceActivity: {
        totalSales: 0,
        averagePrice: 0,
        topBuyers: []
      }
    };
  }
}

export const syndicationService = new SyndicationService();