import Purchases, { CustomerInfo, PurchasesOffering } from '@revenuecat/purchases-js';
import { syndicationService } from './syndicationService';
import { getCurrentUser } from '../lib/supabase';

class RevenueCatService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize RevenueCat with your API key
      // Replace 'your_revenuecat_api_key' with your actual RevenueCat public API key
      await Purchases.configure({
        apiKey: import.meta.env.VITE_REVENUECAT_API_KEY || 'your_revenuecat_api_key'
      });

      // Set user ID if authenticated
      const user = await getCurrentUser();
      if (user) {
        await Purchases.logIn(user.id);
      }

      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      await this.initialize();
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }

  async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      await this.initialize();
      const offerings = await Purchases.getOfferings();
      return offerings.all;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return [];
    }
  }

  async purchaseProduct(productId: string): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      await this.initialize();
      
      const offerings = await this.getOfferings();
      const offering = offerings.find(o => o.identifier === 'premium_links');
      
      if (!offering) {
        throw new Error('Premium links offering not found');
      }

      const product = offering.availablePackages.find(p => p.identifier === productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const purchaseResult = await Purchases.purchasePackage(product);
      
      // Update subscription status in our database
      await this.syncSubscriptionStatus(purchaseResult.customerInfo);
      
      return {
        success: true,
        customerInfo: purchaseResult.customerInfo
      };
    } catch (error: any) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.restorePurchases();
      
      // Update subscription status in our database
      await this.syncSubscriptionStatus(customerInfo);
      
      return {
        success: true,
        customerInfo
      };
    } catch (error: any) {
      console.error('Restore purchases failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to restore purchases'
      };
    }
  }

  async checkPremiumAccess(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      if (!customerInfo) return false;
      
      // Check if user has active premium_links_access entitlement
      const premiumAccess = customerInfo.entitlements.active['premium_links_access'];
      return !!premiumAccess;
    } catch (error) {
      console.error('Failed to check premium access:', error);
      return false;
    }
  }

  private async syncSubscriptionStatus(customerInfo: CustomerInfo) {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const hasPremiumAccess = !!customerInfo.entitlements.active['premium_links_access'];
      
      // Update subscription status in our database
      await syndicationService.updatePremiumLinkSubscription(user.id, hasPremiumAccess);
      
      console.log('Subscription status synced:', hasPremiumAccess);
    } catch (error) {
      console.error('Failed to sync subscription status:', error);
    }
  }

  async logOut() {
    try {
      if (this.isInitialized) {
        await Purchases.logOut();
      }
    } catch (error) {
      console.error('Failed to log out from RevenueCat:', error);
    }
  }
}

export const revenueCatService = new RevenueCatService();