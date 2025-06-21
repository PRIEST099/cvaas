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
import { TalentProfile, TalentSearchFilters, TalentSearchResult, SmartPool } from '../types/talent';
import { talentService } from '../services/talentService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { TalentCard } from '../components/talent/TalentCard';
import { TalentFilters } from '../components/talent/TalentFilters';
import { SmartPoolCard } from '../components/talent/SmartPoolCard';

export function TalentDiscoveryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'pools' | 'analytics'>('search');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Search state
  const [searchResult, setSearchResult] = useState<TalentSearchResult | null>(null);
  const [filters, setFilters] = useState<TalentSearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Smart pools state
  const [smartPools, setSmartPools] = useState<SmartPool[]>([]);
  const [isLoadingPools, setIsLoadingPools] = useState(false);
  const [refreshingPoolId, setRefreshingPoolId] = useState<string | null>(null);
  
  // Selected candidates for bulk actions
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  useEffect(() => {
    if (user?.accountType === 'business') {
      loadSmartPools();
      // Perform initial search
      handleSearch();
    }
  }, [user]);

  const loadSmartPools = async () => {
    if (!user?.companyId) return;
    
    try {
      setIsLoadingPools(true);
      const pools = await talentService.getSmartPools(user.companyId);
      setSmartPools(pools);
    } catch (error) {
      console.error('Failed to load smart pools:', error);
    } finally {
      setIsLoadingPools(false);
    }
  };

  const handleSearch = async (page: number = 1) => {
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

  const handleInviteCandidate = (profile: TalentProfile) => {
    // TODO: Open invitation modal
    console.log('Inviting candidate:', profile.anonymousId);
  };

  const handleViewCandidateDetails = (profile: TalentProfile) => {
    // TODO: Open candidate details modal
    console.log('Viewing candidate details:', profile.anonymousId);
  };

  const handleRefreshPool = async (poolId: string) => {
    try {
      setRefreshingPoolId(poolId);
      const updatedPool = await talentService.refreshSmartPool(poolId);
      setSmartPools(prev => prev.map(pool => 
        pool.id === poolId ? updatedPool : pool
      ));
    } catch (error) {
      console.error('Failed to refresh pool:', error);
    } finally {
      setRefreshingPoolId(null);
    }
  };

  const handleEditPool = (pool: SmartPool) => {
    // TODO: Open pool edit modal
    console.log('Editing pool:', pool.id);
  };

  const handleTogglePoolActive = async (poolId: string, isActive: boolean) => {
    try {
      const updatedPool = await talentService.updateSmartPool(poolId, { isActive });
      setSmartPools(prev => prev.map(pool => 
        pool.id === poolId ? updatedPool : pool
      ));
    } catch (error) {
      console.error('Failed to toggle pool status:', error);
    }
  };

  const handleViewPoolCandidates = (pool: SmartPool) => {
    setFilters(pool.filters);
    setActiveTab('search');
    handleSearch();
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  if (user?.accountType !== 'business') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">This feature is only available for business accounts.</p>
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
            onClick={() => setActiveTab(tab.id as any)}
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
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <TalentFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={() => handleSearch(1)}
              isLoading={isSearching}
            />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            {searchResult && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">
                    {searchResult.total} candidates found
                  </h2>
                  {selectedCandidates.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedCandidates.length} selected
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedCandidates.length > 0 && (
                    <Button size="sm">
                      Bulk Invite ({selectedCandidates.length})
                    </Button>
                  )}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Results Grid */}
            {searchResult && !isSearching && (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'
                }`}>
                  {searchResult.profiles.map((profile) => (
                    <div key={profile.id} className="relative">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(profile.id)}
                        onChange={() => toggleCandidateSelection(profile.id)}
                        className="absolute top-4 left-4 z-10 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <TalentCard
                        profile={profile}
                        onInvite={handleInviteCandidate}
                        onViewDetails={handleViewCandidateDetails}
                        showScores={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {searchResult.total > 20 && (
                  <div className="flex items-center justify-center mt-8 space-x-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handleSearch(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil(searchResult.total / 20)}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage >= Math.ceil(searchResult.total / 20)}
                      onClick={() => handleSearch(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {searchResult && searchResult.profiles.length === 0 && !isSearching && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria to find more candidates.
                </p>
                <Button onClick={() => setFilters({})}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
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
                <SmartPoolCard
                  key={pool.id}
                  pool={pool}
                  onRefresh={handleRefreshPool}
                  onEdit={handleEditPool}
                  onToggleActive={handleTogglePoolActive}
                  onViewCandidates={handleViewPoolCandidates}
                  isRefreshing={refreshingPoolId === pool.id}
                />
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
              <div className="text-2xl font-bold text-blue-600 mb-2">156</div>
              <div className="text-sm text-gray-600">Total searches this month</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Invitation Response Rate</h3>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">67%</div>
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