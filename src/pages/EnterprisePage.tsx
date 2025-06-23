import React from 'react';
import { Building, Users, Settings, BarChart3 } from 'lucide-react';

export function EnterprisePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enterprise Solutions</h1>
        <p className="text-gray-600 mb-8">
          White-label solutions and enterprise features are coming soon. 
          Scale your hiring operations with our comprehensive platform.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-gray-50 rounded-lg">
            <Building className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">White Label</h3>
            <p className="text-sm text-gray-600">Custom branding and domain</p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Team Management</h3>
            <p className="text-sm text-gray-600">Multi-user access controls</p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <Settings className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">API Access</h3>
            <p className="text-sm text-gray-600">Integrate with your systems</p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-sm text-gray-600">Detailed reporting and insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}