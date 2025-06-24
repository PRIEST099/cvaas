import React from 'react';
import { CreditCard, ShoppingCart, BarChart3, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function SyndicationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <CreditCard className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Syndication Network</h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Advanced talent syndication features are coming soon. Connect with other recruiters 
          and share candidate recommendations through our credit-based network.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Credit System</h3>
              <p className="text-sm text-gray-600">Earn and spend credits for candidate referrals and successful placements</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardContent className="p-6 text-center">
              <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Marketplace</h3>
              <p className="text-sm text-gray-600">Buy and sell credits with other recruiters in a secure marketplace</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Track your syndication performance and revenue streams</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Coming</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Recruiter Network</h4>
                  <p className="text-sm text-gray-600">Connect with verified recruiters and build your professional network</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Revenue Sharing</h4>
                  <p className="text-sm text-gray-600">Earn commissions from successful candidate placements and referrals</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Credit Exchange</h4>
                  <p className="text-sm text-gray-600">Trade credits for premium features, candidate access, and marketplace items</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Early Access</h4>
              <p className="text-sm text-gray-600 mb-4">
                Be among the first to access our syndication network when it launches. 
                Early adopters will receive bonus credits and exclusive features.
              </p>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">Coming Q2 2025</div>
                <div className="text-xs text-gray-500">Beta access available soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}