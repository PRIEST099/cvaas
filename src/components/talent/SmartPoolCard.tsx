import React from 'react';
import { 
  Users, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  Clock, 
  Target,
  Play,
  Pause,
  MoreVertical
} from 'lucide-react';
import { SmartPool } from '../../types/talent';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface SmartPoolCardProps {
  pool: SmartPool;
  onRefresh: (poolId: string) => void;
  onEdit: (pool: SmartPool) => void;
  onToggleActive: (poolId: string, isActive: boolean) => void;
  onViewCandidates: (pool: SmartPool) => void;
  isRefreshing?: boolean;
}

export function SmartPoolCard({ 
  pool, 
  onRefresh, 
  onEdit, 
  onToggleActive, 
  onViewCandidates,
  isRefreshing = false 
}: SmartPoolCardProps) {
  const getRefreshFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return 'Manual';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatLastRefreshed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      !pool.isActive ? 'opacity-60' : ''
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900">{pool.name}</h3>
              {!pool.isActive && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  <Pause className="h-3 w-3 mr-1" />
                  Paused
                </span>
              )}
              {pool.autoRefresh && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Auto
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{pool.description}</p>
            
            {/* Tags */}
            {pool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {pool.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-2xl font-bold text-gray-900">{pool.candidateCount}</span>
            </div>
            <div className="text-xs text-gray-600">Candidates</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-green-500 mr-1" />
              <span className={`text-2xl font-bold ${getScoreColor(pool.averageScore)}`}>
                {pool.averageScore}
              </span>
            </div>
            <div className="text-xs text-gray-600">Avg Score</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {formatLastRefreshed(pool.lastRefreshed)}
              </span>
            </div>
            <div className="text-xs text-gray-600">Last Updated</div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {pool.filters.skills && pool.filters.skills.length > 0 && (
              <div>
                <span className="font-medium">Skills:</span> {pool.filters.skills.slice(0, 3).join(', ')}
                {pool.filters.skills.length > 3 && ` +${pool.filters.skills.length - 3} more`}
              </div>
            )}
            {pool.filters.seniority && pool.filters.seniority.length > 0 && (
              <div>
                <span className="font-medium">Seniority:</span> {pool.filters.seniority.join(', ')}
              </div>
            )}
            {pool.filters.availability && pool.filters.availability.length > 0 && (
              <div>
                <span className="font-medium">Availability:</span> {pool.filters.availability.join(', ')}
              </div>
            )}
            {pool.filters.location?.remoteOnly && (
              <div>
                <span className="font-medium">Location:</span> Remote only
              </div>
            )}
            {pool.filters.salaryRange && (
              <div>
                <span className="font-medium">Salary:</span> ${pool.filters.salaryRange.min?.toLocaleString()} - ${pool.filters.salaryRange.max?.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>
            Refresh: {getRefreshFrequencyText(pool.refreshFrequency)}
          </span>
          <span>
            Created {new Date(pool.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onViewCandidates(pool)}
            className="flex-1"
            disabled={!pool.isActive || pool.candidateCount === 0}
          >
            <Users className="h-4 w-4 mr-2" />
            View Candidates
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onRefresh(pool.id)}
            disabled={isRefreshing || !pool.isActive}
            isLoading={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onEdit(pool)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant={pool.isActive ? "outline" : "primary"}
            onClick={() => onToggleActive(pool.id, !pool.isActive)}
            size="sm"
          >
            {pool.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}