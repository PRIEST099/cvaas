import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IndividualDashboard } from '../components/dashboard/IndividualDashboard';
import { BusinessDashboard } from '../components/dashboard/BusinessDashboard';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user.role === 'candidate' ? (
        <IndividualDashboard />
      ) : (
        <BusinessDashboard />
      )}
    </div>
  );
}