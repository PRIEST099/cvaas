import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  TrendingUp,
  Users,
  Target,
  Star,
  ArrowLeft,
  Filter,
  Calendar,
  Zap
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function LeaderboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');

  const timeframes = [
    { value: 'all-time', label: 'All Time' },
    { value: 'this-month', label: 'This Month' },
    { value: 'this-week', label: 'This Week' }
  ];

  const categories = [
    { value: 'overall', label: 'Overall' },
    { value: 'coding', label: 'Coding' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'analysis', label: 'Analysis' }
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe, category]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const leaderboardData = await questService.getLeaderboard(timeframe, category);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-orange-500" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCurrentUserRank = () => {
    if (!user) return null;
    const userEntry = leaderboard.find(entry => entry.userId === user.id);
    return userEntry ? leaderboard.indexOf(userEntry) + 1 : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userRank = getCurrentUserRank();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/challenges')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-gray-600 mt-2">
              See how you rank against other skilled professionals
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold">Leaderboard Filters</h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timeframes.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Rank Card */}
      {user && userRank && (
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(userRank)}`}>
                  {getRankIcon(userRank)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Your Current Rank</h3>
                  <p className="text-gray-600">
                    You're ranked #{userRank} out of {leaderboard.length} participants
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">#{userRank}</div>
                <div className="text-sm text-gray-600">Your Position</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Top Performers</h2>
          <div className="flex items-end justify-center space-x-4 mb-8">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-white rounded-lg p-6 mb-4 h-32 flex flex-col justify-end">
                <Medal className="h-8 w-8 mx-auto mb-2" />
                <div className="font-bold">2nd</div>
              </div>
              <div className="font-semibold">{leaderboard[1]?.displayName || 'Anonymous'}</div>
              <div className="text-sm text-gray-600">{leaderboard[1]?.totalScore} points</div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg p-6 mb-4 h-40 flex flex-col justify-end">
                <Crown className="h-10 w-10 mx-auto mb-2" />
                <div className="font-bold text-lg">1st</div>
              </div>
              <div className="font-semibold">{leaderboard[0]?.displayName || 'Anonymous'}</div>
              <div className="text-sm text-gray-600">{leaderboard[0]?.totalScore} points</div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg p-6 mb-4 h-28 flex flex-col justify-end">
                <Award className="h-8 w-8 mx-auto mb-2" />
                <div className="font-bold">3rd</div>
              </div>
              <div className="font-semibold">{leaderboard[2]?.displayName || 'Anonymous'}</div>
              <div className="text-sm text-gray-600">{leaderboard[2]?.totalScore} points</div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      {leaderboard.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Full Rankings</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = user && entry.userId === user.id;
                
                return (
                  <div 
                    key={entry.userId} 
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isCurrentUser 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadgeColor(rank)}`}>
                        {rank <= 3 ? getRankIcon(rank) : <span className="font-bold">#{rank}</span>}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">
                            {entry.displayName || 'Anonymous User'}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Trophy className="h-4 w-4 mr-1" />
                            {entry.totalQuestsPassed} quests passed
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            {entry.totalBadges} badges
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {Math.round(entry.averageScore)}% avg score
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{entry.totalScore}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Trophy className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 mb-4">No rankings yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Complete challenges to appear on the leaderboard and compete with other professionals.
          </p>
          <Button onClick={() => navigate('/challenges')}>
            <Target className="h-4 w-4 mr-2" />
            Start Competing
          </Button>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-12 grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{leaderboard.length}</div>
            <div className="text-sm text-gray-600">Total Participants</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {leaderboard.reduce((sum, entry) => sum + entry.totalQuestsPassed, 0)}
            </div>
            <div className="text-sm text-gray-600">Quests Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {leaderboard.reduce((sum, entry) => sum + entry.totalBadges, 0)}
            </div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {leaderboard.length > 0 ? 
                Math.round(leaderboard.reduce((sum, entry) => sum + entry.averageScore, 0) / leaderboard.length) : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Success Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}