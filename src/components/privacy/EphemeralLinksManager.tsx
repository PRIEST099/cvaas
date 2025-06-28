import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  Clock, 
  Eye, 
  Download, 
  Lock, 
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  AlertTriangle,
  Infinity,
  Check,
  X
} from 'lucide-react';
import { EphemeralLink, CustomSlugSuggestion } from '../../types';
import { syndicationService } from '../../services/syndicationService';
import { hashSha256Base64 } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface EphemeralLinksManagerProps {
  cvId: string;
}

export function EphemeralLinksManager({ cvId }: EphemeralLinksManagerProps) {
  const { user } = useAuth();
  const [links, setLinks] = useState<EphemeralLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({
    expiresIn: 24,
    maxViews: undefined as number | undefined,
    allowDownload: false,
    requirePassword: false,
    password: '',
    noExpiry: false,
    useCustomSlug: false,
    customSlug: '',
    isCheckingSlug: false,
    isSlugAvailable: false
  });
  const [slugSuggestions, setSlugSuggestions] = useState<CustomSlugSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  useEffect(() => {
    loadLinks();
  }, [cvId]);

  const loadLinks = async () => {
    try {
      setIsLoading(true);
      const linksData = await syndicationService.getEphemeralLinks(user!.id);
      // Filter by CV ID and sort by creation date (most recent first)
      const filteredAndSortedLinks = linksData
        .filter(link => link.cvId === cvId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLinks(filteredAndSortedLinks);
    } catch (error) {
      console.error('Failed to load ephemeral links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async () => {
    try {
      const link = await syndicationService.createEphemeralLink(cvId, {
        expiresIn: newLink.noExpiry ? Number.MAX_SAFE_INTEGER : newLink.expiresIn,
        maxViews: newLink.maxViews,
        allowDownload: newLink.allowDownload,
        requirePassword: newLink.requirePassword,
        password: newLink.requirePassword ? newLink.password : undefined,
        customSlug: newLink.useCustomSlug ? newLink.customSlug : undefined
      });
      
      // Add new link to the beginning of the array (most recent first)
      setLinks(prev => [link, ...prev]);
      setShowCreateModal(false);
      setNewLink({
        expiresIn: 24,
        maxViews: undefined,
        allowDownload: false,
        requirePassword: false,
        password: '',
        noExpiry: false,
        useCustomSlug: false,
        customSlug: '',
        isCheckingSlug: false,
        isSlugAvailable: false
      });
    } catch (error) {
      console.error('Failed to create ephemeral link:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      setDeletingLinkId(linkId);
      await syndicationService.deleteEphemeralLink(linkId);
      // Remove the deleted link from the state
      setLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (error) {
      console.error('Failed to delete ephemeral link:', error);
    } finally {
      setDeletingLinkId(null);
    }
  };

  const copyToClipboard = async (token: string, isCustomSlug: boolean = false) => {
    let url;
    if (isCustomSlug) {
      url = `${window.location.origin}/cv/ephemeral/${token}`;
    } else {
      url = `${window.location.origin}/cv/ephemeral/${token}`;
    }
    
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    // Check if this is a "no expiry" link (more than 50 years in the future)
    const fiftyYearsFromNow = new Date();
    fiftyYearsFromNow.setFullYear(fiftyYearsFromNow.getFullYear() + 50);
    
    if (expires > fiftyYearsFromNow) {
      return 'No expiry';
    }
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const isLinkExpired = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    
    // Check if this is a "no expiry" link
    const fiftyYearsFromNow = new Date();
    fiftyYearsFromNow.setFullYear(fiftyYearsFromNow.getFullYear() + 50);
    
    if (expires > fiftyYearsFromNow) {
      return false; // Never expires
    }
    
    return now > expires;
  };

  const isLinkViewLimitReached = (link: EphemeralLink) => {
    return link.maxViews && link.currentViews >= link.maxViews;
  };

  const getLinkStatus = (link: EphemeralLink) => {
    if (!link.isActive) return { status: 'inactive', color: 'gray' };
    if (isLinkExpired(link.expiresAt)) return { status: 'expired', color: 'red' };
    if (isLinkViewLimitReached(link)) return { status: 'limit reached', color: 'orange' };
    return { status: 'active', color: 'green' };
  };

  const handleNoExpiryChange = (checked: boolean) => {
    setNewLink(prev => ({
      ...prev,
      noExpiry: checked,
      expiresIn: checked ? Number.MAX_SAFE_INTEGER : 24
    }));
  };

  const handleCustomSlugChange = async (value: string) => {
    const slug = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    setNewLink(prev => ({
      ...prev,
      customSlug: slug,
      isCheckingSlug: true,
      isSlugAvailable: false
    }));
    
    if (slug.length >= 3) {
      try {
        const isAvailable = await syndicationService.isCustomSlugAvailable(slug);
        setNewLink(prev => ({
          ...prev,
          isCheckingSlug: false,
          isSlugAvailable: isAvailable
        }));
      } catch (error) {
        console.error('Failed to check slug availability:', error);
        setNewLink(prev => ({
          ...prev,
          isCheckingSlug: false,
          isSlugAvailable: false
        }));
      }
    } else {
      setNewLink(prev => ({
        ...prev,
        isCheckingSlug: false,
        isSlugAvailable: false
      }));
    }
  };

  const generateSlugSuggestions = async () => {
    try {
      setIsGeneratingSuggestions(true);
      const suggestions = await syndicationService.generateCustomSlugSuggestions(user?.first_name || 'cv');
      setSlugSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate slug suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: CustomSlugSuggestion) => {
    if (suggestion.available) {
      setNewLink(prev => ({
        ...prev,
        customSlug: suggestion.slug,
        isSlugAvailable: true
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ephemeral Links</h3>
          <p className="text-sm text-gray-600">Create time-limited, secure links to share your CV</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* Links List */}
      <div className="space-y-4">
        {links.map((link) => {
          const linkStatus = getLinkStatus(link);
          const isInactive = linkStatus.status !== 'active';
          const timeRemaining = formatTimeRemaining(link.expiresAt);
          const isNoExpiry = timeRemaining === 'No expiry';
          const isCustomSlug = !!link.customSlug;
          
          return (
            <Card key={link.id} className={`transition-all duration-300 ${isInactive ? 'opacity-70 bg-gray-50' : 'hover:shadow-lg'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <LinkIcon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {isCustomSlug ? (
                          <span className="flex items-center">
                            <span className="text-blue-600">{link.customSlug}</span>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Custom</span>
                          </span>
                        ) : (
                          `Link #${link.id.slice(-6)}`
                        )}
                      </span>
                      {link.requirePassword && (
                        <Lock className="h-4 w-4 text-yellow-500" />
                      )}
                      {isNoExpiry && (
                        <Infinity className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        linkStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                        linkStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                        linkStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {linkStatus.status === 'expired' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {linkStatus.status.charAt(0).toUpperCase() + linkStatus.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center space-x-1">
                        {isNoExpiry ? (
                          <>
                            <Infinity className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 font-medium">No expiry</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className={`text-gray-600 ${isLinkExpired(link.expiresAt) ? 'text-red-600 font-medium' : ''}`}>
                              {timeRemaining}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className={`text-gray-600 ${isLinkViewLimitReached(link) ? 'text-orange-600 font-medium' : ''}`}>
                          {link.currentViews}{link.maxViews ? `/${link.maxViews}` : ''} views
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {link.allowDownload ? 'Download allowed' : 'View only'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {link.requirePassword ? 'Password protected' : 'Public access'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Created {new Date(link.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(isCustomSlug ? link.customSlug! : link.accessToken, isCustomSlug)}
                      disabled={isInactive}
                      className={copiedToken === (isCustomSlug ? link.customSlug : link.accessToken) ? 'bg-green-50 border-green-200 text-green-700' : ''}
                    >
                      {copiedToken === (isCustomSlug ? link.customSlug : link.accessToken) ? (
                        <>
                          <span className="text-xs">Copied!</span>
                        </>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/cv/ephemeral/${isCustomSlug ? link.customSlug : link.accessToken}`, '_blank')}
                      disabled={isInactive}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteLink(link.id)}
                      disabled={deletingLinkId === link.id}
                    >
                      {deletingLinkId === link.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <h3 className="font-semibold text-lg">Create Ephemeral Link</h3>
              <p className="text-blue-100 text-sm">Configure secure sharing options</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Custom Slug Option */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newLink.useCustomSlug}
                    onChange={(e) => setNewLink(prev => ({ 
                      ...prev, 
                      useCustomSlug: e.target.checked,
                      customSlug: e.target.checked ? prev.customSlug : ''
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use a custom link name</span>
                </label>
                
                {newLink.useCustomSlug && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        label="Custom Link Name"
                        value={newLink.customSlug}
                        onChange={(e) => handleCustomSlugChange(e.target.value)}
                        placeholder="e.g., my-resume"
                        className={`${
                          newLink.customSlug && !newLink.isCheckingSlug ? 
                            newLink.isSlugAvailable ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
                            'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : ''
                        }`}
                      />
                      {newLink.customSlug && !newLink.isCheckingSlug && (
                        <div className="absolute right-2 top-8">
                          {newLink.isSlugAvailable ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                      {newLink.isCheckingSlug && (
                        <div className="absolute right-2 top-8">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    
                    {newLink.customSlug && !newLink.isSlugAvailable && !newLink.isCheckingSlug && (
                      <p className="text-xs text-red-600">This link name is already taken. Please try another one.</p>
                    )}
                    
                    {newLink.customSlug && newLink.customSlug.length < 3 && (
                      <p className="text-xs text-gray-500">Custom link names must be at least 3 characters long.</p>
                    )}
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {isGeneratingSuggestions ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : slugSuggestions.length > 0 ? (
                          slugSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => selectSuggestion(suggestion)}
                              disabled={!suggestion.available}
                              className={`text-xs px-2 py-1 rounded-full ${
                                suggestion.available ? 
                                  'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer' : 
                                  'bg-gray-100 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {suggestion.slug}
                            </button>
                          ))
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={generateSlugSuggestions}
                            className="text-xs"
                          >
                            Generate suggestions
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                      <p>Your custom link will look like:</p>
                      <p className="font-mono mt-1 text-blue-700">
                        {window.location.origin}/cv/ephemeral/{newLink.customSlug || 'your-custom-name'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* No Expiry Checkbox */}
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newLink.noExpiry}
                    onChange={(e) => handleNoExpiryChange(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <Infinity className="h-4 w-4 mr-1 text-green-500" />
                    No expiry date
                  </span>
                </label>
                
                {!newLink.noExpiry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expires in (hours)
                    </label>
                    <Input
                      type="number"
                      value={newLink.expiresIn}
                      onChange={(e) => setNewLink(prev => ({ ...prev, expiresIn: parseInt(e.target.value) }))}
                      min="1"
                      max="168"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum: 168 hours (7 days)</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum views (optional)
                </label>
                <Input
                  type="number"
                  value={newLink.maxViews || ''}
                  onChange={(e) => setNewLink(prev => ({ 
                    ...prev, 
                    maxViews: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Unlimited"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited views</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newLink.allowDownload}
                    onChange={(e) => setNewLink(prev => ({ ...prev, allowDownload: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow PDF download</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newLink.requirePassword}
                    onChange={(e) => setNewLink(prev => ({ ...prev, requirePassword: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require password</span>
                </label>
              </div>

              {newLink.requirePassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={newLink.password}
                    onChange={(e) => setNewLink(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose a strong password</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleCreateLink}
                  className="flex-1"
                  disabled={
                    (newLink.requirePassword && !newLink.password.trim()) || 
                    (newLink.useCustomSlug && (!newLink.customSlug || !newLink.isSlugAvailable))
                  }
                >
                  Create Link
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {links.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <LinkIcon className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ephemeral links</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create secure, time-limited links to share your CV with specific people. 
            Perfect for job applications and networking.
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Link
          </Button>
        </div>
      )}
    </div>
  );
}