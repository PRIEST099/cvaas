import React, { useState } from 'react';
import { CreditDashboard } from '../components/syndication/CreditDashboard';
import { MarketplacePage } from '../components/syndication/MarketplacePage';
import { 
  CreditCard, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  BarChart3
} from 'lucide-react';

export function SyndicationPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace' | 'analytics'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Credit Dashboard', icon: CreditCard },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 mb-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <CreditDashboard />}
      {activeTab === 'marketplace' && <MarketplacePage />}
      {activeTab === 'analytics' && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
          <p className="text-gray-600">
            Detailed syndication analytics and insights coming soon.
          </p>
        </div>
      )}
    </div>
  );
}