import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Check, 
  X, 
  Sparkles, 
  Link as LinkIcon,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';
import { revenueCatService } from '../../services/revenueCatService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export function PremiumUpgradeModal({ isOpen, onClose, onUpgradeSuccess }: PremiumUpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOfferings();
    }
  }, [isOpen]);

  const loadOfferings = async () => {
    try {
      setIsLoading(true);
      const offeringsData = await revenueCatService.getOfferings();
      setOfferings(offeringsData);
    } catch (error) {
      console.error('Failed to load offerings:', error);
      setError('Failed to load subscription options');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await revenueCatService.purchaseProduct(productId);
      
      if (result.success) {
        onUpgradeSuccess();
        onClose();
      } else {
        setError(result.error || 'Purchase failed');
      }
    } catch (error: any) {
      setError(error.message || 'Purchase failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await revenueCatService.restorePurchases();
      
      if (result.success) {
        const hasPremium = await revenueCatService.checkPremiumAccess();
        if (hasPremium) {
          onUpgradeSuccess();
          onClose();
        } else {
          setError('No active subscriptions found');
        }
      } else {
        setError(result.error || 'Failed to restore purchases');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to restore purchases');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const premiumFeatures = [
    {
      icon: LinkIcon,
      title: 'Custom Memorable Links',
      description: 'Create easy-to-remember URLs like "yourname.cvaas.com/cv"'
    },
    {
      icon: Sparkles,
      title: 'Unlimited Ephemeral Links',
      description: 'Create as many secure sharing links as you need'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed insights on link performance and viewer engagement'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Get help faster with premium customer support'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <Crown className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Upgrade to Premium</h2>
            <p className="text-purple-100 text-lg">
              Unlock custom links and advanced features for just $2/month
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Features List */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Premium Features</h3>
            <div className="grid gap-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl text-center">
              <div className="text-4xl font-bold mb-2">$2</div>
              <div className="text-purple-100 mb-4">per month</div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Check className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => handlePurchase('premium_links_monthly')}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-4"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Upgrade to Premium
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleRestorePurchases}
              disabled={isLoading}
              className="w-full"
            >
              Restore Purchases
            </Button>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              By subscribing, you agree to our{' '}
              <a href="/terms" className="text-purple-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>.
              Subscription automatically renews unless cancelled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}