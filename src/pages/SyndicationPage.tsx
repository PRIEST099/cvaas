import React from 'react';
import { CreditCard, ShoppingCart, BarChart3 } from 'lucide-react';

export function SyndicationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Syndication Network</h1>
        <p className="text-gray-600 mb-8">
          Advanced talent syndication features are coming soon. Connect with other recruiters 
          and share candidate recommendations through our credit-based network.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 bg-gray-50 rounded-lg">
            <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Credit System</h3>
            <p className="text-sm text-gray-600">Earn and spend credits for candidate referrals</p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Marketplace</h3>
            <p className="text-sm text-gray-600">Buy and sell credits with other recruiters</p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">Track your syndication performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}