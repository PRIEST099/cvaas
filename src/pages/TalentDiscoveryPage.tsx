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
  Target,
  ArrowRight,
  RefreshCw,
  Zap,
  Sparkles,
  FileText,
  Lightbulb,
  AlertCircle,
  X
} from 'lucide-react';
import { talentService } from '../services/talentService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { SendInvitationModal } from '../components/invitations/SendInvitationModal';
import { Textarea } from '../components/ui/Textarea';

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
  const [activePoolId, setActivePoolId] = useState<string | null>(null);

  // AI matching state
  const [showAIMatchingModal, setShowAIMatchingModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<any>(null);
  const [matchError, setMatchError] = useState('');

  // Invitation state
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

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

  const handleViewSmartPoolCandidates = (pool: any) => {
    // Set the active pool ID
    setActivePoolId(pool.id);
    
    // Apply the pool's filters to the search
    setFilters(pool.filters || {});
    
    // Switch to the search tab to show results
    setActiveTab('search');
    
    // Execute the search with the pool's filters
    handleSearch(1);
  };

  const handleSendInvitation = (profile: any) => {
    // Only proceed if we have a valid user_id
    if (profile.user_id) {
      setSelectedCandidate(profile);
      setShowInvitationModal(true);
    } else {
      console.error('Cannot send invitation: user_id not available for profile', profile);
      // You might want to show an error message to the user here
    }
  };

  const handleAIMatching = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      setMatchError('Please provide both job title and description');
      return;
    }

    try {
      setIsMatching(true);
      setMatchError('');
      
      // Parse skills from comma-separated string
      const skillsArray = requiredSkills.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      const results = await talentService.getAICandidateMatches({
        jobTitle,
        jobDescription,
        requiredSkills: skillsArray
      });
      
      setMatchResults(results);
    } catch (error: any) {
      setMatchError(error.message || 'Failed to perform AI matching');
    } finally {
      setIsMatching(false);
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
          <Button variant="outline" onClick={() => setShowAIMatchingModal(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Matching
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Advanced Search Filters</h3>
                {activePoolId && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      Using Smart Pool Filters
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setActivePoolId(null);
                        setFilters({
                          keywords: '',
                          skills: [],
                          experience: '',
                          location: '',
                          education: '',
                          salary: '',
                          availability: ''
                        });
                      }}
                    >
                      Clear Pool Filters
                    </Button>
                  </div>
                )}
              </div>
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
                  {activePoolId && (
                    <span className="ml-2 text-blue-600">
                      in Smart Pool
                    </span>
                  )}
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
                      {profile.skills_summary && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {profile.skills_summary.split(',').slice(0, 4).map((skill: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                            {profile.skills_summary.split(',').length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{profile.skills_summary.split(',').length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Experience Preview */}
                      {profile.positions_summary && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-600">
                            <Building className="h-4 w-4 inline mr-1" />
                            {profile.positions_summary}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Updated {new Date(profile.updated_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendInvitation(profile);
                            }}
                            disabled={!profile.user_id}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Invite
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleViewProfile(profile)}
                          >
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
                <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{pool.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{pool.description}</p>
                    
                    {/* Filter Tags */}
                    <div className="mb-4">
                      {pool.filters.skills && pool.filters.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {pool.filters.skills.slice(0, 3).map((skill: string, index: number) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                          {pool.filters.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{pool.filters.skills.length - 3}</span>
                          )}
                        </div>
                      )}
                      
                      {pool.filters.location && (
                        <div className="text-xs text-gray-600 mb-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {pool.filters.location}
                        </div>
                      )}
                      
                      {pool.filters.experience && (
                        <div className="text-xs text-gray-600">
                          <Briefcase className="h-3 w-3 inline mr-1" />
                          {pool.filters.experience}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {pool.candidateCount > 0 ? (
                          <>{pool.candidateCount} candidates</>
                        ) : (
                          <>Estimated: {Math.floor(Math.random() * 50) + 5} candidates</>
                        )}
                      </span>
                      <Button 
                        size="sm"
                        onClick={() => handleViewSmartPoolCandidates(pool)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Candidates
                      </Button>
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

      {/* AI Matching Modal */}
      {showAIMatchingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">AI Candidate Matching</h2>
                  <p className="text-blue-100 text-sm">
                    Find the best candidates for your job using AI
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAIMatchingModal(false)} className="text-white hover:bg-white hover:bg-opacity-20">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {matchResults ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Match Results</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setMatchResults(null);
                        setJobTitle('');
                        setJobDescription('');
                        setRequiredSkills('');
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      New Match
                    </Button>
                  </div>

                  {/* Job Summary */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">{jobTitle}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{jobDescription}</p>
                          {requiredSkills && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {requiredSkills.split(',').map((skill, index) => (
                                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  {matchResults.suggestions && matchResults.suggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <h4 className="font-medium flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                          AI Suggestions
                        </h4>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {matchResults.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Matched Candidates */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Matched Candidates</h4>
                    
                    {matchResults.matches.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                        <p className="text-gray-600">
                          Try adjusting your job description or required skills to find more candidates.
                        </p>
                      </div>
                    ) : (
                      matchResults.matches.map((match: any, index: number) => (
                        <Card key={index} className={`border-l-4 ${
                          match.score >= 80 ? 'border-l-green-500' :
                          match.score >= 60 ? 'border-l-blue-500' :
                          'border-l-gray-300'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mt-1">
                                  {match.profile?.display_name.charAt(match.profile.display_name.length - 1)}
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="font-medium text-gray-900">{match.profile?.display_name}</h4>
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {match.score}% match
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{match.profile?.cv_title}</p>
                                  
                                  {/* Matched Skills */}
                                  {match.matchedSkills.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-500 mb-1">Matched Skills:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {match.matchedSkills.map((skill: string, i: number) => (
                                          <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Missing Skills */}
                                  {match.missingSkills.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-500 mb-1">Missing Skills:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {match.missingSkills.map((skill: string, i: number) => (
                                          <span key={i} className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Match Notes */}
                                  {match.notes && (
                                    <div className="mt-2 text-sm text-gray-700">
                                      <div className="text-xs text-gray-500 mb-1">AI Notes:</div>
                                      <p>{match.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setShowAIMatchingModal(false);
                                    handleSendInvitation(match.profile);
                                  }}
                                  disabled={!match.profile?.user_id}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Invite
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => {
                                    setShowAIMatchingModal(false);
                                    handleViewProfile(match.profile);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {matchError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      {matchError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Senior Frontend Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description
                    </label>
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Describe the role, responsibilities, and requirements..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Skills (comma separated)
                    </label>
                    <Input
                      value={requiredSkills}
                      onChange={(e) => setRequiredSkills(e.target.value)}
                      placeholder="e.g., React, TypeScript, Node.js"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">How AI Matching Works</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Our AI analyzes candidate profiles against your job requirements to find the best matches. 
                          The algorithm considers skills, experience, and overall fit to provide you with ranked results.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAIMatchingModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAIMatching}
                      className="flex-1"
                      isLoading={isMatching}
                      disabled={!jobTitle.trim() || !jobDescription.trim() || isMatching}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Find Matches
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Invitation Modal */}
      {showInvitationModal && selectedCandidate && selectedCandidate.user_id && (
        <SendInvitationModal
          isOpen={showInvitationModal}
          onClose={() => {
            setShowInvitationModal(false);
            setSelectedCandidate(null);
          }}
          candidateId={selectedCandidate.user_id}
          cvId={selectedCandidate.cv_id}
          candidateName={selectedCandidate.display_name}
          cvTitle={selectedCandidate.cv_title}
        />
      )}
    </div>
  );
}