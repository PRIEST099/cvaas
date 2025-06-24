import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2,
  Users,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Pause
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function RecruiterQuestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [filteredQuests, setFilteredQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deletingQuestId, setDeletingQuestId] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'coding', label: 'Coding' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'communication', label: 'Communication' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    if (user) {
      loadQuests();
    }
  }, [user]);

  useEffect(() => {
    filterQuests();
  }, [quests, searchTerm, selectedCategory, selectedStatus]);

  const loadQuests = async () => {
    try {
      setIsLoading(true);
      const questsData = await questService.getQuests(user?.id);
      setQuests(questsData);
    } catch (error) {
      console.error('Failed to load quests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuests = () => {
    let filtered = [...quests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quest =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quest.skills_assessed && quest.skills_assessed.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quest => quest.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(quest => 
        selectedStatus === 'active' ? quest.is_active : !quest.is_active
      );
    }

    setFilteredQuests(filtered);
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingQuestId(questId);
      await questService.deleteQuest(questId);
      setQuests(prev => prev.filter(q => q.id !== questId));
    } catch (error) {
      console.error('Failed to delete quest:', error);
    } finally {
      setDeletingQuestId(null);
    }
  };

  const toggleQuestStatus = async (questId: string, currentStatus: boolean) => {
    try {
      await questService.updateQuest(questId, { is_active: !currentStatus });
      setQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, is_active: !currentStatus } : q
      ));
    } catch (error) {
      console.error('Failed to update quest status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    total: quests.length,
    active: quests.filter(q => q.is_active).length,
    totalSubmissions: quests.reduce((sum, q) => sum + q.total_attempts, 0),
    avgSuccessRate: quests.length > 0 ? 
      Math.round(quests.reduce((sum, q) => sum + (q.success_rate || 0), 0) / quests.length * 100) : 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Quests</h1>
          <p className="text-gray-600 mt-2">Create and manage skill-based challenges for candidates</p>
        </div>
        
        <Button onClick={() => navigate('/challenges/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Quest
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Quests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Quests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.avgSuccessRate}%</div>
            <div className="text-sm text-gray-600">Avg Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold">Filter Quests</h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search quests, skills, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Quests List */}
      {filteredQuests.length > 0 ? (
        <div className="space-y-4">
          {filteredQuests.map((quest) => (
            <Card key={quest.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{quest.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        quest.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {quest.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        quest.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        quest.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        quest.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quest.category.charAt(0).toUpperCase() + quest.category.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{quest.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {quest.estimated_time ? `${quest.estimated_time}m` : 'No limit'}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {quest.total_attempts} attempts
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {Math.round((quest.success_rate || 0) * 100)}% success rate
                      </div>
                      <div className="text-xs text-gray-400">
                        Created {new Date(quest.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {quest.skills_assessed && quest.skills_assessed.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quest.skills_assessed.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {quest.skills_assessed.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{quest.skills_assessed.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/submissions?questId=${quest.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Submissions
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/challenges/${quest.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuestStatus(quest.id, quest.is_active)}
                    >
                      {quest.is_active ? (
                        <Pause className="h-4 w-4 text-orange-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuest(quest.id)}
                      disabled={deletingQuestId === quest.id}
                    >
                      {deletingQuestId === quest.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {quests.length === 0 ? (
            <>
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quests yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first quest to start evaluating candidates with skill-based challenges.
              </p>
              <Button onClick={() => navigate('/challenges/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quest
              </Button>
            </>
          ) : (
            <>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quests found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more quests.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}>
                Clear Filters
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}