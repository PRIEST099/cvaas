import React from 'react';
import { 
  Clock, 
  Users, 
  Award, 
  TrendingUp, 
  Code, 
  PenTool, 
  MessageSquare, 
  BarChart3,
  Target,
  Star
} from 'lucide-react';
import { MiniChallenge, ChallengeDifficulty, ChallengeCategory } from '../../types/collaboration';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface ChallengeCardProps {
  challenge: MiniChallenge;
  onStartChallenge: (challenge: MiniChallenge) => void;
  userProgress?: {
    hasAttempted: boolean;
    bestScore?: number;
    status?: string;
  };
}

export function ChallengeCard({ challenge, onStartChallenge, userProgress }: ChallengeCardProps) {
  const getCategoryIcon = (category: ChallengeCategory) => {
    switch (category) {
      case 'coding': return <Code className="h-5 w-5" />;
      case 'design': return <PenTool className="h-5 w-5" />;
      case 'writing': return <MessageSquare className="h-5 w-5" />;
      case 'analysis': return <BarChart3 className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: ChallengeDifficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatSuccessRate = (rate: number) => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getCategoryIcon(challenge.category)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{challenge.title}</h3>
              <p className="text-sm text-gray-600">{challenge.description}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </span>
            
            {userProgress?.hasAttempted && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{userProgress.bestScore}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Skills Assessed */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Assessed</h4>
          <div className="flex flex-wrap gap-2">
            {challenge.skillsAssessed.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
            {challenge.skillsAssessed.length > 4 && (
              <span className="text-xs text-gray-500">
                +{challenge.skillsAssessed.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Badge Reward */}
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-3">
            <Award className={`h-6 w-6 ${getRarityColor(challenge.badgeMetadata.rarity)}`} />
            <div>
              <h4 className="font-medium text-gray-900">{challenge.badgeMetadata.name}</h4>
              <p className="text-sm text-gray-600">{challenge.badgeMetadata.description}</p>
              <span className={`text-xs font-medium ${getRarityColor(challenge.badgeMetadata.rarity)}`}>
                {challenge.badgeMetadata.rarity.charAt(0).toUpperCase() + challenge.badgeMetadata.rarity.slice(1)} Badge
              </span>
            </div>
          </div>
        </div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {challenge.timeLimit ? `${challenge.timeLimit}m` : 'No limit'}
              </span>
            </div>
            <div className="text-xs text-gray-600">Time Limit</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm font-semibold text-gray-900">{challenge.totalAttempts}</span>
            </div>
            <div className="text-xs text-gray-600">Attempts</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {formatSuccessRate(challenge.successRate)}
              </span>
            </div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Verification Criteria Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Evaluation Criteria</h4>
          <div className="space-y-1">
            {challenge.verificationCriteria.slice(0, 2).map((criteria, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{criteria.criterion}</span>
                <span className="font-medium">{Math.round(criteria.weight * 100)}%</span>
              </div>
            ))}
            {challenge.verificationCriteria.length > 2 && (
              <div className="text-xs text-gray-500">
                +{challenge.verificationCriteria.length - 2} more criteria
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onStartChallenge(challenge)}
          className="w-full"
          disabled={!challenge.isActive}
        >
          {userProgress?.hasAttempted ? 'Retry Challenge' : 'Start Challenge'}
        </Button>

        {/* User Progress Indicator */}
        {userProgress?.hasAttempted && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your best score:</span>
              <span className="font-semibold text-gray-900">{userProgress.bestScore}/100</span>
            </div>
            {userProgress.status && (
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  userProgress.status === 'passed' ? 'bg-green-100 text-green-800' :
                  userProgress.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {userProgress.status.charAt(0).toUpperCase() + userProgress.status.slice(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}