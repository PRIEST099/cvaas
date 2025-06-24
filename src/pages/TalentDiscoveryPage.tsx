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
  Bookmark,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  Calendar,
  Building,
  Eye,
  Send,
  Target
} from 'lucide-react';
import { talentService } from '../services/talentService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function TalentDiscoveryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  
  // Search state
  const [searchResult, setSearchResult] = useState<any>(null);
  const [filters, setFilters] = useState({
    keywords: '',
    skills: [],
    experience: '',
    location: '',
    education: '',
    salary: '',
    availability: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Smart pools state
  const [smartPools, setSmartPools] = useState([]);
  const [isLoadingPools, setIsLoadingPools] = useState(false);
  const [newPool, setNewPool] = useState({
    name: '',
    description: '',
    filters: {}
  });

  useEffect(() => {
    if (user?.role === 'recruiter') {
      loadSmartPools();
      // Perform initial search
      handleSearch();
    }
  }, [user]);

  const loadSmartPools = async () => {
    if (!user?.id) return;
    
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

  const handleCreatePool = async () => {
    try {
      await talentService.createSmartPool({
        name: newPool.name,
        description: newPool.description,
        filters: filters // Use current search filters
      });
      setShowCreatePoolModal(false);
      setNewPool({ name: '', description: '', filters: {} });
      loadSmartPools();
    } catch (error) {
      console.error('Failed to create smart pool:', error);
    }
  };

  const handleViewProfile = (profile: any) => {
    navigate(`/talent/cv/${profile.cv_id}`);
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
          <Button onClick={() => setShowCreatePoolModal(true)}>
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
              <h3 className="font-semibold">Advanced Search Filters</h3>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Skills & Keywords */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Skills & Keywords</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by skills, role, or keywords..."
                      value={filters.keywords}
                      onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  <Input 
                    placeholder="Required skills (comma separated)" 
                    value={filters.skills.join(', ')}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                {/* Experience & Education */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Experience & Education</h4>
                  <select 
                    value={filters.experience}
                    onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any experience level</option>
                    <option value="entry">Entry level (0-2 years)</option>
                    <option value="mid">Mid-level (3-5 years)</option>
                    <option value="senior">Senior (6-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                  </select>
                  <Input 
                    placeholder="Education level or degree"
                    value={filters.education}
                    onChange={(e) => setFilters(prev => ({ ...prev, education: e.target.value }))}
                  />
                </div>

                {/* Location & Availability */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Location & Availability</h4>
                  <Input 
                    placeholder="Location (city, state, country)" 
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                  <select 
                    value={filters.availability}
                    onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any availability</option>
                    <option value="immediate">Immediately available</option>
                    <option value="2weeks">Available in 2 weeks</option>
                    <option value="1month">Available in 1 month</option>
                    <option value="3months">Available in 3+ months</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Only show verified profiles</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Include passive candidates</span>
                  </label>
                </div>
                <Button onClick={() => handleSearch(1)} isLoading={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Talent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : searchResult && searchResult.profiles.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Found {searchResult.total} candidates
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {searchResult.profiles.map((profile: any) => (
                  <Card key={profile.cv_id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {profile.display_name.charAt(profile.display_name.length - 1)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{profile.display_name}</h3>
                            <p className="text-sm text-gray-600">{profile.cv_title}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {profile.metadata?.recruiterViews || 0} views
                        </span>
                      </div>

                      {/* Skills Preview */}
                      {profile.skills && profile.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.slice(0, 4).map((skill: any, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {skill.name}
                              </span>
                            ))}
                            {profile.skills.length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{profile.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Experience Preview */}
                      {profile.experience && profile.experience.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-600">
                            <Building className="h-4 w-4 inline mr-1" />
                            {profile.experience[0].position} at {profile.experience[0].company}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Updated {new Date(profile.updated_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4 mr-1" />
                            Invite
                          </Button>
                          <Button size="sm" onClick={() => handleViewProfile(profile)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {searchResult.total > 20 && (
                <div className="flex items-center justify-center space-x-2">
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
            </div>
          ) : searchResult ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria to find more candidates.
              </p>
              <Button onClick={() => setFilters({
                keywords: '',
                skills: [],
                experience: '',
                location: '',
                education: '',
                salary: '',
                availability: ''
              })}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start your talent search</h3>
              <p className="text-gray-600">Use the advanced filters above to find candidates that match your requirements.</p>
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
              {smartPools.map((pool: any) => (
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
              <Button onClick={() => setShowCreatePoolModal(true)}>
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

      {/* Create Smart Pool Modal */}
      {showCreatePoolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <h3 className="font-semibold text-lg">Create Smart Pool</h3>
              <p className="text-blue-100 text-sm">Save your current search as a smart pool</p>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Input
                label="Pool Name"
                value={newPool.name}
                onChange={(e) => setNewPool(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Senior React Developers"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newPool.description}
                  onChange={(e) => setNewPool(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the type of candidates you're looking for..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <strong>Current filters will be saved:</strong>
                <ul className="mt-2 space-y-1">
                  {filters.keywords && <li>• Keywords: {filters.keywords}</li>}
                  {filters.skills.length > 0 && <li>• Skills: {filters.skills.join(', ')}</li>}
                  {filters.experience && <li>• Experience: {filters.experience}</li>}
                  {filters.location && <li>• Location: {filters.location}</li>}
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleCreatePool}
                  className="flex-1"
                  disabled={!newPool.name.trim()}
                >
                  Create Pool
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePoolModal(false)}>
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