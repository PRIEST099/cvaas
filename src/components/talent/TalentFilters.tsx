import React, { useState } from 'react';
import { Search, Filter, X, MapPin, DollarSign, Clock, Star } from 'lucide-react';
import { TalentSearchFilters, SeniorityLevel, AvailabilityStatus } from '../../types/talent';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface TalentFiltersProps {
  filters: TalentSearchFilters;
  onFiltersChange: (filters: TalentSearchFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function TalentFilters({ filters, onFiltersChange, onSearch, isLoading = false }: TalentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const seniorityLevels: { value: SeniorityLevel; label: string }[] = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'principal', label: 'Principal' },
    { value: 'executive', label: 'Executive' }
  ];

  const availabilityOptions: { value: AvailabilityStatus; label: string; color: string }[] = [
    { value: 'actively_looking', label: 'Actively Looking', color: 'bg-green-100 text-green-800' },
    { value: 'open_to_opportunities', label: 'Open to Opportunities', color: 'bg-blue-100 text-blue-800' },
    { value: 'not_looking', label: 'Not Looking', color: 'bg-gray-100 text-gray-600' }
  ];

  const addSkill = () => {
    if (skillInput.trim() && !filters.skills?.includes(skillInput.trim())) {
      onFiltersChange({
        ...filters,
        skills: [...(filters.skills || []), skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    onFiltersChange({
      ...filters,
      skills: filters.skills?.filter(s => s !== skill)
    });
  };

  const toggleSeniority = (level: SeniorityLevel) => {
    const current = filters.seniority || [];
    const updated = current.includes(level)
      ? current.filter(s => s !== level)
      : [...current, level];
    
    onFiltersChange({
      ...filters,
      seniority: updated.length > 0 ? updated : undefined
    });
  };

  const toggleAvailability = (status: AvailabilityStatus) => {
    const current = filters.availability || [];
    const updated = current.includes(status)
      ? current.filter(a => a !== status)
      : [...current, status];
    
    onFiltersChange({
      ...filters,
      availability: updated.length > 0 ? updated : undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = [
    filters.keywords,
    filters.skills?.length,
    filters.seniority?.length,
    filters.availability?.length,
    filters.location?.remoteOnly,
    filters.salaryRange?.min || filters.salaryRange?.max
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keywords
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by role, company, or keywords..."
              value={filters.keywords || ''}
              onChange={(e) => onFiltersChange({ ...filters, keywords: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Add skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1"
            />
            <Button onClick={addSkill} disabled={!skillInput.trim()}>
              Add
            </Button>
          </div>
          {filters.skills && filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Seniority Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seniority Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            {seniorityLevels.map((level) => (
              <label key={level.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.seniority?.includes(level.value) || false}
                  onChange={() => toggleSeniority(level.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <div className="space-y-2">
            {availabilityOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.availability?.includes(option.value) || false}
                  onChange={() => toggleAvailability(option.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${option.color}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.location?.remoteOnly || false}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      location: { ...filters.location, remoteOnly: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remote Only</span>
                </label>
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Salary Range (USD)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min salary"
                  value={filters.salaryRange?.min || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    salaryRange: {
                      ...filters.salaryRange,
                      min: e.target.value ? parseInt(e.target.value) : undefined,
                      currency: 'USD'
                    }
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max salary"
                  value={filters.salaryRange?.max || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    salaryRange: {
                      ...filters.salaryRange,
                      max: e.target.value ? parseInt(e.target.value) : undefined,
                      currency: 'USD'
                    }
                  })}
                />
              </div>
            </div>

            {/* Score Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline h-4 w-4 mr-1" />
                Minimum Scores
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Overall Score: {filters.scores?.overall?.min || 0}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scores?.overall?.min || 0}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      scores: {
                        ...filters.scores,
                        overall: { min: parseInt(e.target.value), max: 100 }
                      }
                    })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Technical Score: {filters.scores?.technical?.min || 0}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scores?.technical?.min || 0}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      scores: {
                        ...filters.scores,
                        technical: { min: parseInt(e.target.value), max: 100 }
                      }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Search Button */}
        <Button
          onClick={onSearch}
          isLoading={isLoading}
          className="w-full"
        >
          <Search className="h-4 w-4 mr-2" />
          Search Talent
        </Button>
      </CardContent>
    </Card>
  );
}