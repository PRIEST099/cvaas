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
  Clock
} from 'lucide-react';
import { MiniChallenge, ChallengeCategory, ChallengeDifficulty } from '../types/collaboration';
import { collaborationService } from '../services/collaborationService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ChallengeCard } from '../components/collaboration/ChallengeCard';

export function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<MiniChallenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<MiniChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChallengeDifficulty | 'all'>('all');

  const categories: { value: ChallengeCategory | 'all'; label: string; icon: any }[] = [
    { value: 'all', label: 'All Categories', icon: Target },
    { value: 'coding', label: 'Coding', icon: Code },
    { value: 'design', label: 'Design', icon: PenTool },
    { value: 'writing', label: 'Writing', icon: MessageSquare },
    { value: 'analysis', label: 'Analysis', icon: BarChart3 }
  ];

  const difficulties: { value: ChallengeDifficulty | 'all'; label: string }[] = [
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
      const challengesData = await collaborationService.getChallenges();
      setChallenges(challengesData);
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
        challenge.skillsAssessed.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
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

  const handleStartChallenge = (challenge: MiniChallenge) => {
    // TODO: Navigate to challenge interface
    console.log('Starting challenge:', challenge.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skill Challenges</h1>
          <p className="text-gray-600 mt-2">
            Complete challenges to earn blockchain-verified skill badges
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Award className="h-4 w-4 mr-2" />
            My Badges
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Leaderboard
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold">Find Challenges</h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
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
                onChange={(e) => setSelectedCategory(e.target.value as any)}
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
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
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
      <div className="flex items-center space-x-1 mb-8 border-b border-gray-200">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.value}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedCategory === category.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.label}
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
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onStartChallenge={handleStartChallenge}
              userProgress={{
                hasAttempted: Math.random() > 0.7, // Mock data
                bestScore: Math.floor(Math.random() * 40) + 60,
                status: Math.random() > 0.5 ? 'passed' : 'failed'
              }}
            />
          ))}
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
      <div className="mt-12 grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{challenges.length}</div>
            <div className="text-sm text-gray-600">Total Challenges</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1,658</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">71%</div>
            <div className="text-sm text-gray-600">Avg Success Rate</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">45m</div>
            <div className="text-sm text-gray-600">Avg Completion Time</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}