import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Star, 
  Shield, 
  Zap, 
  MessageCircle, 
  Eye,
  Award,
  TrendingUp,
  Users,
  Brain,
  Target
} from 'lucide-react';
import { TalentProfile } from '../../types/talent';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface TalentCardProps {
  profile: TalentProfile;
  onInvite: (profile: TalentProfile) => void;
  onViewDetails: (profile: TalentProfile) => void;
  showScores?: boolean;
}

export function TalentCard({ profile, onInvite, onViewDetails, showScores = true }: TalentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'actively_looking': return 'bg-green-100 text-green-800';
      case 'open_to_opportunities': return 'bg-blue-100 text-blue-800';
      case 'not_looking': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'actively_looking': return 'Actively Looking';
      case 'open_to_opportunities': return 'Open to Opportunities';
      case 'not_looking': return 'Not Looking';
      default: return 'Unavailable';
    }
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'entry': return 'bg-gray-100 text-gray-700';
      case 'junior': return 'bg-blue-100 text-blue-700';
      case 'mid': return 'bg-purple-100 text-purple-700';
      case 'senior': return 'bg-orange-100 text-orange-700';
      case 'lead': return 'bg-red-100 text-red-700';
      case 'principal': return 'bg-indigo-100 text-indigo-700';
      case 'executive': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatSalaryRange = (range: { min: number; max: number; currency: string }) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: range.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${formatter.format(range.min)} - ${formatter.format(range.max)}`;
  };

  const topSkills = profile.skills
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, 6);

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isHovered ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{profile.title}</h3>
              {profile.verificationStatus === 'verified' && (
                <Shield className="h-4 w-4 text-blue-500" />
              )}
              {profile.verificationStatus === 'premium' && (
                <Award className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeniorityColor(profile.seniority)}`}>
                {profile.seniority.charAt(0).toUpperCase() + profile.seniority.slice(1)} Level
              </span>
              
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{profile.location.city}, {profile.location.state}</span>
                {profile.location.isRemote && (
                  <span className="ml-1 text-green-600">(Remote)</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(profile.availability)}`}>
                <Clock className="h-3 w-3 mr-1" />
                {getAvailabilityText(profile.availability)}
              </span>
              
              <span className="text-sm text-gray-600">
                Active {new Date(profile.lastActive).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {showScores && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(profile.scores.overall)}`}>
                {profile.scores.overall}
              </div>
              <div className="text-xs text-gray-500">Fit Score</div>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Skills</h4>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  skill.isVerified 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {skill.name}
                {skill.isVerified && <Zap className="h-3 w-3 ml-1" />}
                <span className="ml-1 text-xs opacity-75">
                  {skill.proficiency}%
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Experience Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {profile.experience.reduce((total, exp) => total + exp.duration, 0)} months total experience
            </span>
            <span className="text-gray-600">
              {profile.preferences.salaryRange && formatSalaryRange(profile.preferences.salaryRange)}
            </span>
          </div>
        </div>

        {/* Score Breakdown */}
        {showScores && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center">
                <Brain className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-xs text-gray-600">Technical</span>
                <span className={`text-sm font-semibold ${getScoreColor(profile.scores.technical)}`}>
                  {profile.scores.technical}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-4 w-4 text-green-500 mb-1" />
                <span className="text-xs text-gray-600">Cultural</span>
                <span className={`text-sm font-semibold ${getScoreColor(profile.scores.cultural)}`}>
                  {profile.scores.cultural}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle className="h-4 w-4 text-purple-500 mb-1" />
                <span className="text-xs text-gray-600">Communication</span>
                <span className={`text-sm font-semibold ${getScoreColor(profile.scores.communication)}`}>
                  {profile.scores.communication}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => onInvite(profile)}
            className="flex-1"
            disabled={profile.availability === 'unavailable'}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Invite
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onViewDetails(profile)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>

        {/* Profile Completeness Indicator */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Profile Completeness</span>
            <span>{profile.profileCompleteness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${profile.profileCompleteness}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}