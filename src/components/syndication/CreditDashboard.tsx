import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Plus, 
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  Award,
  RefreshCw
} from 'lucide-react';
import { SyndicationCredit, CreditTransaction, SyndicationAnalytics } from '../../types/syndication';
import { syndicationService } from '../../services/syndicationService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

export function CreditDashboard() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<SyndicationCredit[]>([]);
  const [analytics, setAnalytics] = useState<SyndicationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(100);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [creditsData, analyticsData] = await Promise.all([
        syndicationService.getUserCredits(user!.id),
        syndicationService.getSyndicationAnalytics(user!.id)
      ]);
      setCredits(creditsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    try {
      await syndicationService.purchaseCredits(user!.id, purchaseAmount, 'stripe');
      setShowPurchaseModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to purchase credits:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your syndication credits and earnings</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowPurchaseModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buy Credits
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.currentBalance || 0}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">{analytics?.totalCreditsEarned || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful Submissions</p>
                <p className="text-2xl font-bold text-purple-600">{analytics?.successfulSubmissions || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-orange-600">${analytics?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Recent Transactions</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.creditHistory.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {transaction.type === 'earned' ? (
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Submissions */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Top Performing Submissions</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topPerformingSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-sm">Candidate #{submission.candidateId.slice(-6)}</p>
                      <p className="text-xs text-gray-500">
                        {submission.submissionType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{submission.qualityScore}</span>
                    </div>
                    <p className="text-xs text-gray-500">{submission.creditsUsed} credits</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Credits Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="font-semibold">Purchase Credits</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Credits
                </label>
                <Input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
                  min="10"
                  max="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Total: ${(purchaseAmount * 1.0).toFixed(2)} USD
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Credit Packages</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>10-99 credits:</span>
                    <span>$1.00 each</span>
                  </div>
                  <div className="flex justify-between">
                    <span>100-499 credits:</span>
                    <span>$0.95 each</span>
                  </div>
                  <div className="flex justify-between">
                    <span>500+ credits:</span>
                    <span>$0.90 each</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handlePurchaseCredits} className="flex-1">
                  Purchase Credits
                </Button>
                <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}