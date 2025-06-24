import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Star, 
  Trophy, 
  Calendar, 
  Target,
  Sparkles,
  Medal,
  Crown,
  Gem,
  ArrowLeft,
  Eye,
  Share2,
  Download
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function MyBadgesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (user) {
      loadBadges();
    }
  }, [user]);

  const loadBadges = async () => {
    try {
      setIsLoading(true);
      const badgesData = await questService.getUserBadges();
      setBadges(badgesData);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'diamond': return <Gem className="h-6 w-6" />;
      case 'platinum': return <Crown className="h-6 w-6" />;
      case 'gold': return <Trophy className="h-6 w-6" />;
      case 'silver': return <Medal className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  const getBadgeLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'diamond': return 'from-cyan-400 to-blue-500';
      case 'platinum': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-200 to-gray-400';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-purple-600 bg-purple-100';
      case 'epic': return 'text-indigo-600 bg-indigo-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const groupBadgesBySkill = (badges: any[]) => {
    return badges.reduce((groups, badge) => {
      const skill = badge.skill || 'General';
      if (!groups[skill]) {
        groups[skill] = [];
      }
      groups[skill].push(badge);
      return groups;
    }, {});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const badgesBySkill = groupBadgesBySkill(badges.filter(b => b.is_displayed));
  const totalBadges = badges.length;
  const verifiedBadges = badges.filter(b => b.is_verified).length;
  const skillsCount = Object.keys(badgesBySkill).length;

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
            <h1 className="text-3xl font-bold text-gray-900">My Skill Badges</h1>
            <p className="text-gray-600 mt-2">
              Showcase your verified skills and achievements
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Badges
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{totalBadges}</div>
            <div className="text-sm text-gray-600">Total Badges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{verifiedBadges}</div>
            <div className="text-sm text-gray-600">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{skillsCount}</div>
            <div className="text-sm text-gray-600">Skills</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {badges.filter(b => b.level === 'gold' || b.level === 'platinum' || b.level === 'diamond').length}
            </div>
            <div className="text-sm text-gray-600">Premium Badges</div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Display */}
      {totalBadges > 0 ? (
        <div className="space-y-8">
          {Object.entries(badgesBySkill).map(([skill, skillBadges]: [string, any]) => (
            <div key={skill}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                {skill}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {skillBadges.length}
                </span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {skillBadges.map((badge: any) => (
                  <Card 
                    key={badge.id} 
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getBadgeLevelColor(badge.level)} flex items-center justify-center text-white shadow-lg`}>
                        {getBadgeLevelIcon(badge.level)}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2">{badge.name}</h3>
                      
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {badge.level}
                        </span>
                      </div>
                      
                      {badge.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {badge.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </div>
                        {badge.is_verified && (
                          <div className="flex items-center text-green-600">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Verified
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Award className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 mb-4">No badges earned yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Complete skill challenges to earn verified badges that showcase your abilities to potential employers.
          </p>
          <Button onClick={() => navigate('/challenges')}>
            <Target className="h-4 w-4 mr-2" />
            Browse Challenges
          </Button>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className={`bg-gradient-to-br ${getBadgeLevelColor(selectedBadge.level)} text-white rounded-t-lg`}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  {getBadgeLevelIcon(selectedBadge.level)}
                </div>
                <h3 className="font-bold text-xl">{selectedBadge.name}</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                    {selectedBadge.level}
                  </span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                    {selectedBadge.rarity}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedBadge.description || 'No description available'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skill</h4>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {selectedBadge.skill}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Earned</h4>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(selectedBadge.earned_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                {selectedBadge.blockchain_data?.score && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Achievement Score</h4>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${selectedBadge.blockchain_data.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{selectedBadge.blockchain_data.score}%</span>
                    </div>
                  </div>
                )}
                
                {selectedBadge.is_verified && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-green-800">
                      <Sparkles className="h-4 w-4 mr-2" />
                      <span className="font-medium">Blockchain Verified</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      This badge is cryptographically verified and stored on the blockchain.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-6">
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Badge
                </Button>
                <Button onClick={() => setSelectedBadge(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}