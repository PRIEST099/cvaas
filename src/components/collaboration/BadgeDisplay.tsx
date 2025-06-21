import React, { useState } from 'react';
import { 
  Award, 
  Shield, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Star, 
  Calendar,
  CheckCircle,
  MessageCircle,
  Share2
} from 'lucide-react';
import { SkillBadge, BadgeLevel, BadgeRarity } from '../../types/collaboration';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface BadgeDisplayProps {
  badges: SkillBadge[];
  isOwner?: boolean;
  onToggleDisplay?: (badgeId: string, isDisplayed: boolean) => void;
  onEndorseBadge?: (badgeId: string) => void;
  onViewOnBlockchain?: (badge: SkillBadge) => void;
}

export function BadgeDisplay({ 
  badges, 
  isOwner = false, 
  onToggleDisplay, 
  onEndorseBadge,
  onViewOnBlockchain 
}: BadgeDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<SkillBadge | null>(null);
  const [showEndorseModal, setShowEndorseModal] = useState(false);
  const [endorsementMessage, setEndorsementMessage] = useState('');

  const getLevelColor = (level: BadgeLevel) => {
    switch (level) {
      case 'bronze': return 'from-amber-600 to-amber-800';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-blue-400 to-blue-600';
      case 'diamond': return 'from-purple-400 to-purple-600';
    }
  };

  const getRarityGlow = (rarity: BadgeRarity) => {
    switch (rarity) {
      case 'common': return 'shadow-md';
      case 'uncommon': return 'shadow-lg shadow-green-200';
      case 'rare': return 'shadow-lg shadow-blue-200';
      case 'epic': return 'shadow-xl shadow-purple-300';
      case 'legendary': return 'shadow-2xl shadow-yellow-300';
    }
  };

  const handleEndorse = async () => {
    if (!selectedBadge || !endorsementMessage.trim()) return;
    
    try {
      await onEndorseBadge?.(selectedBadge.id);
      setShowEndorseModal(false);
      setEndorsementMessage('');
      setSelectedBadge(null);
    } catch (error) {
      console.error('Failed to endorse badge:', error);
    }
  };

  const displayedBadges = badges.filter(badge => badge.isDisplayed).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedBadges.map((badge) => (
          <Card 
            key={badge.id} 
            className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${getRarityGlow(badge.rarity)}`}
            onClick={() => setSelectedBadge(badge)}
          >
            <CardContent className="p-4 text-center">
              {/* Badge Image */}
              <div className={`relative mx-auto mb-3 w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor(badge.level)} flex items-center justify-center`}>
                <Award className="h-8 w-8 text-white" />
                
                {/* Verification Badge */}
                {badge.isVerified && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                )}
                
                {/* Rarity Indicator */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className={`flex space-x-0.5 ${
                    badge.rarity === 'legendary' ? 'text-yellow-400' :
                    badge.rarity === 'epic' ? 'text-purple-400' :
                    badge.rarity === 'rare' ? 'text-blue-400' :
                    badge.rarity === 'uncommon' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {Array.from({ length: 
                      badge.rarity === 'legendary' ? 5 :
                      badge.rarity === 'epic' ? 4 :
                      badge.rarity === 'rare' ? 3 :
                      badge.rarity === 'uncommon' ? 2 : 1
                    }).map((_, i) => (
                      <Star key={i} className="h-2 w-2 fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Badge Info */}
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{badge.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{badge.skill}</p>
              
              {/* Level Badge */}
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getLevelColor(badge.level)}`}>
                {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
              </span>

              {/* Owner Controls */}
              {isOwner && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDisplay?.(badge.id, !badge.isDisplayed);
                    }}
                  >
                    {badge.isDisplayed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Badge Details</h2>
                <Button variant="ghost" onClick={() => setSelectedBadge(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Badge Header */}
              <div className="text-center">
                <div className={`mx-auto mb-4 w-24 h-24 rounded-full bg-gradient-to-br ${getLevelColor(selectedBadge.level)} flex items-center justify-center ${getRarityGlow(selectedBadge.rarity)}`}>
                  <Award className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedBadge.name}</h3>
                <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
                
                <div className="flex items-center justify-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getLevelColor(selectedBadge.level)}`}>
                    {selectedBadge.level.charAt(0).toUpperCase() + selectedBadge.level.slice(1)} Level
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)}
                  </span>
                </div>
              </div>

              {/* Badge Attributes */}
              <div>
                <h4 className="font-semibold mb-3">Badge Attributes</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedBadge.blockchainData.metadata.attributes.map((attr, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">{attr.trait_type}</div>
                      <div className="text-lg font-semibold text-gray-900">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockchain Verification */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Blockchain Verified</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Network:</span>
                    <span className="font-medium text-blue-900">{selectedBadge.blockchainData.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Token ID:</span>
                    <span className="font-medium text-blue-900">{selectedBadge.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Earned:</span>
                    <span className="font-medium text-blue-900">
                      {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => onViewOnBlockchain?.(selectedBadge)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Blockchain
                </Button>
              </div>

              {/* Endorsements */}
              {selectedBadge.endorsements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Endorsements ({selectedBadge.endorsements.length})</h4>
                  <div className="space-y-3">
                    {selectedBadge.endorsements.slice(0, 3).map((endorsement) => (
                      <div key={endorsement.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {endorsement.endorserType === 'employer' ? 'Employer' : 
                             endorsement.endorserType === 'peer' ? 'Peer' : 'Expert'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(endorsement.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{endorsement.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                {!isOwner && (
                  <Button
                    onClick={() => setShowEndorseModal(true)}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Endorse
                  </Button>
                )}
                
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Endorse Modal */}
      {showEndorseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="font-semibold">Endorse Badge</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Share your thoughts about this badge and the skills it represents.
              </p>
              
              <textarea
                value={endorsementMessage}
                onChange={(e) => setEndorsementMessage(e.target.value)}
                placeholder="Write your endorsement..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleEndorse}
                  disabled={!endorsementMessage.trim()}
                  className="flex-1"
                >
                  Submit Endorsement
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEndorseModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {displayedBadges.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No badges to display</h3>
          <p className="text-gray-600">
            {isOwner 
              ? 'Complete challenges to earn your first skill badge!'
              : 'This user hasn\'t earned any badges yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
}