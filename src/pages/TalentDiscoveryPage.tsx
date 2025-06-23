import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Plus, 
  BarChart3, 
  Settings,
  Grid,
  List,
  Bookmark
} from 'lucide-react';
import { talentService } from '../services/talentService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function TalentDiscoveryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState('grid');
  
  // Search state
  const [searchResult, setSearchResult] = useState(null);
  const [filters, setFilters] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Smart pools state
  const [smartPools, setSmartPools] = useState([]);
  const [isLoadingPools, setIsLoadingPools] = useState(false);

  useEffect(() => {
    if (user?.role === 'recruiter') {
      loadSmartPools();
      // Perform initial search
      handleSearch();
    }
  }, [user]);

  const loadSmartPools = async () => {
    if (!user?.company_name) return;
    
    try {
      setIsLoadingPools(true);
      const pools = await talentService.getSmartPools(user.id);
      setSmartPools(pools);
    } catch (error) {
      console.error('Failed to load smart pools:', error);
    } finally {
      setIsLoadingPools(false);
    }
  };

  const handleSearch = async (page = 1) => {
    try {
      setIsSearching(true);
      const result = await talentService.searchTalent(filters, page, 20);
      setSearchResult(result);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (user?.role !== 'recruiter') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">This feature is only available for recruiter accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Talent Discovery</h1>
          <p className="text-gray-600 mt-2">Find and connect with top talent anonymously</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Smart Pool
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 mb-8 border-b border-gray-200">
        {[
          { id: 'search', label: 'Search Talent', icon: Search },
          { id: 'pools', label: 'Smart Pools', icon: Bookmark },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
            {tab.id === 'search' && searchResult && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {searchResult.total}
              </span>
            )}
            {tab.id === 'pools' && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {smartPools.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Search Filters</h3>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      placeholder="Search by skills, role, or keywords..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Seniority Levels</option>
                  <option>Junior</option>
                  <option>Mid-level</option>
                  <option>Senior</option>
                  <option>Lead</option>
                </select>
                <Button onClick={() => handleSearch(1)} isLoading={isSearching}>
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : searchResult ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600 mb-4">
                Talent discovery features are coming soon. Check back later for candidate profiles.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start your talent search</h3>
              <p className="text-gray-600">Use the filters above to find candidates that match your requirements.</p>
            </div>
          )}
        </div>
      )}

      {/* Smart Pools Tab */}
      {activeTab === 'pools' && (
        <div>
          {isLoadingPools ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : smartPools.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smartPools.map((pool) => (
                <Card key={pool.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{pool.name}</h3>
                    <p className="text-gray-600 mb-4">{pool.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{pool.candidateCount} candidates</span>
                      <Button size="sm">View Pool</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Smart Pools yet</h3>
              <p className="text-gray-600 mb-4">
                Create Smart Pools to automatically track candidates that match your criteria.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Pool
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Search Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Total searches this month</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Invitation Response Rate</h3>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">0%</div>
              <div className="text-sm text-gray-600">Average response rate</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Active Smart Pools</h3>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {smartPools.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Pools actively tracking</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}