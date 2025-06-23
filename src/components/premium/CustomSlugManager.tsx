import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  RefreshCw,
  Crown,
  Copy,
  ExternalLink
} from 'lucide-react';
import { syndicationService } from '../../services/syndicationService';
import { CustomSlugSuggestion } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface CustomSlugManagerProps {
  onSlugSelected: (slug: string) => void;
  onCancel: () => void;
}

export function CustomSlugManager({ onSlugSelected, onCancel }: CustomSlugManagerProps) {
  const { user } = useAuth();
  const [customSlug, setCustomSlug] = useState('');
  const [suggestions, setSuggestions] = useState<CustomSlugSuggestion[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{
    slug: string;
    available: boolean;
  } | null>(null);

  useEffect(() => {
    if (user?.first_name) {
      generateSuggestions(user.first_name);
    }
  }, [user]);

  const generateSuggestions = async (baseName: string) => {
    try {
      setIsGeneratingSuggestions(true);
      const suggestionsData = await syndicationService.generateCustomSlugSuggestions(baseName);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug.trim()) {
      setSlugAvailability(null);
      return;
    }

    try {
      setIsCheckingAvailability(true);
      const isAvailable = await syndicationService.isCustomSlugAvailable(slug);
      setSlugAvailability({ slug, available: isAvailable });
    } catch (error) {
      console.error('Failed to check slug availability:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSlugChange = (value: string) => {
    // Clean the slug: lowercase, remove special characters, replace spaces with hyphens
    const cleanSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
    
    setCustomSlug(cleanSlug);
    
    // Debounce availability check
    if (cleanSlug.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkSlugAvailability(cleanSlug);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSlugAvailability(null);
    }
  };

  const handleSelectSlug = (slug: string) => {
    onSlugSelected(slug);
  };

  const copySlugUrl = (slug: string) => {
    const url = `${window.location.origin}/cv/${slug}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">Custom Link Slug</h3>
              <p className="text-purple-100 text-sm">Create a memorable URL for your CV</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white hover:bg-opacity-20">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Custom Slug Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Slug
          </label>
          <div className="relative">
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                cvaas.com/cv/
              </span>
              <Input
                value={customSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="your-name"
                className="rounded-l-none"
                maxLength={30}
              />
            </div>
            
            {/* Availability Status */}
            <div className="mt-2 flex items-center space-x-2">
              {isCheckingAvailability && (
                <div className="flex items-center text-gray-500 text-sm">
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Checking availability...
                </div>
              )}
              
              {slugAvailability && !isCheckingAvailability && (
                <div className={`flex items-center text-sm ${
                  slugAvailability.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {slugAvailability.available ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Available!
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Not available
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            Use only letters, numbers, and hyphens. Maximum 30 characters.
          </p>
        </div>

        {/* Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Suggested Slugs
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => user?.first_name && generateSuggestions(user.first_name)}
              disabled={isGeneratingSuggestions}
            >
              {isGeneratingSuggestions ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="grid gap-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    cvaas.com/cv/{suggestion.slug}
                  </span>
                  {suggestion.available && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Available
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copySlugUrl(suggestion.slug)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectSlug(suggestion.slug)}
                    disabled={!suggestion.available}
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {suggestions.length === 0 && !isGeneratingSuggestions && (
            <div className="text-center py-6 text-gray-500">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No suggestions available. Try entering a custom slug above.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={() => customSlug && handleSelectSlug(customSlug)}
            disabled={!customSlug || !slugAvailability?.available}
            className="flex-1"
          >
            Use Custom Slug
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}