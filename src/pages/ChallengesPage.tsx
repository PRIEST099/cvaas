import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Award, 
  Code, 
  PenTool, 
  MessageSquare, 
  BarChart3,
  Target,
  TrendingUp,
  Clock,
  Users,
  Play,
  CheckCircle,
  Eye,
  RefreshCw,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function ChallengesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories', icon: Target },
    { value: 'coding', label: 'Coding', icon: Code },
    { value: 'design', label: 'Design', icon: PenTool },
    { value: 'writing', label: 'Writing', icon: MessageSquare },
    { value: 'analysis', label: 'Analysis', icon: BarChart3 }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, searchTerm, selectedCategory, selectedDifficulty]);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      const [challengesData, submissionsData] = await Promise.all([
        questService.getQuests(),
        user ? questService.getSubmissions() : Promise.resolve([])
      ]);
      setChallenges(challengesData);
      setUserSubmissions(submissionsData);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterChallenges = () => {
    let filtered = [...challenges];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (challenge.skills_assessed && challenge.skills_assessed.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === selectedDifficulty);
    }

    setFilteredChallenges(filtered);
  };

  const getUserSubmissionForQuest = (questId: string) => {
    return userSubmissions
      .filter(sub => sub.quest_id === questId)
      .sort((a, b) => b.attempt_number - a.attempt_number)[0]; // Get latest attempt
  };

  const getQuestButtonConfig = (challenge: any) => {
    if (!user) {
      return {
        text: 'Sign In to Start',
        icon: Play,
        action: () => navigate('/login'),
        disabled: false,
        variant: 'outline' as const
      };
    }

    const submission = getUserSubmissionForQuest(challenge.id);
    
    if (!submission) {
      return {
        text: 'Start Challenge',
        icon: Play,
        action: () => navigate(`/challenges/${challenge.id}/submit`),
        disabled: !challenge.is_active,
        variant: 'primary' as const
      };
    }

    switch (submission.status) {
      case 'submitted':
      case 'under_review':
        return {
          text: 'Under Review',
          icon: RefreshCw,
          action: () => {}, // No action for pending submissions
          disabled: true,
          variant: 'outline' as const
        };
      case 'passed':
        return {
          text: 'Completed',
          icon: CheckCircle,
          action: () => {}, // Could navigate to badge or results
          disabled: true,
          variant: 'outline' as const
        };
      case 'failed':
      case 'needs_revision':
        return {
          text: 'Retake Challenge',
          icon: RefreshCw,
          action: () => navigate(`/challenges/${challenge.id}/submit`),
          disabled: !challenge.is_active,
          variant: 'primary' as const
        };
      default:
        return {
          text: 'Start Challenge',
          icon: Play,
          action: () => navigate(`/challenges/${challenge.id}/submit`),
          disabled: !challenge.is_active,
          variant: 'primary' as const
        };
    }
  };

  const getSubmissionStatusBadge = (challenge: any) => {
    if (!user) return null;
    
    const submission = getUserSubmissionForQuest(challenge.id);
    if (!submission) return null;

    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Submitted' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw, text: 'Under Review' },
      passed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: `Passed (${submission.score}%)` },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Failed' },
      needs_revision: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, text: 'Needs Revision' }
    };

    const config = statusConfig[submission.status] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Skill Challenges</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Complete challenges to earn blockchain-verified skill badges and showcase your abilities
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" onClick={() => navigate('/my-badges')} className="w-full sm:w-auto">
            <Award className="h-4 w-4 mr-2" />
            My Badges
          </Button>
          <Button variant="outline" onClick={() => navigate('/leaderboard')} className="w-full sm:w-auto">
            <TrendingUp className="h-4 w-4 mr-2" />
            Leaderboard
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <h3 className="font-semibold">Find Challenges</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search challenges, skills, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1 mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.value}
              className={`flex items-center px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedCategory === category.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.label.split(' ')[0]}</span>
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {category.value === 'all' 
                  ? challenges.length 
                  : challenges.filter(c => c.category === category.value).length
                }
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
        <p className="text-gray-600 text-sm sm:text-base">
          Showing {filteredChallenges.length} of {challenges.length} challenges
        </p>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option>Newest</option>
            <option>Difficulty</option>
            <option>Success Rate</option>
            <option>Most Popular</option>
          </select>
        </div>
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredChallenges.map((challenge) => {
            const buttonConfig = getQuestButtonConfig(challenge);
            const statusBadge = getSubmissionStatusBadge(challenge);
            const ButtonIcon = buttonConfig.icon;
            
            return (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Code className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-1">{challenge.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        challenge.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      </span>
                      {statusBadge}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Skills Assessed */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Assessed</h4>
                      <div className="flex flex-wrap gap-2">
                        {(challenge.skills_assessed || []).slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {(challenge.skills_assessed || []).length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{(challenge.skills_assessed || []).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Challenge Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 text-center">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm font-semibold text-gray-900">
                            {challenge.estimated_time ? `${challenge.estimated_time}m` : 'No limit'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">Time Limit</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm font-semibold text-gray-900">{challenge.total_attempts}</span>
                        </div>
                        <div className="text-xs text-gray-600">Attempts</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm font-semibold text-gray-900">
                            {Math.round((challenge.success_rate || 0) * 100)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={buttonConfig.action}
                      className="w-full"
                      disabled={buttonConfig.disabled}
                      variant={buttonConfig.variant}
                    >
                      <ButtonIcon className="h-4 w-4 mr-2" />
                      {buttonConfig.text}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search terms to find more challenges.
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedDifficulty('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{challenges.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Challenges</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {userSubmissions.filter(s => s.status === 'passed').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Badges Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {challenges.length > 0 ? Math.round(challenges.reduce((sum, c) => sum + (c.success_rate || 0), 0) / challenges.length * 100) : 0}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Avg Success Rate</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {challenges.length > 0 ? Math.round(challenges.reduce((sum, c) => sum + (c.estimated_time || 0), 0) / challenges.length) : 0}m
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Avg Completion Time</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}