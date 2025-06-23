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
  AlertTriangle
} from 'lucide-react';
import { EphemeralLink } from '../../types';
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
    password: ''
  });

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
        expiresIn: newLink.expiresIn,
        maxViews: newLink.maxViews,
        allowDownload: newLink.allowDownload,
        requirePassword: newLink.requirePassword,
        password: newLink.requirePassword ? newLink.password : undefined
      });
      
      // Add new link to the beginning of the array (most recent first)
      setLinks(prev => [link, ...prev]);
      setShowCreateModal(false);
      setNewLink({
        expiresIn: 24,
        maxViews: undefined,
        allowDownload: false,
        requirePassword: false,
        password: ''
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

  const copyToClipboard = async (token: string) => {
    const url = `${window.location.origin}/cv/ephemeral/${token}`;
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
    return new Date() > new Date(expiresAt);
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
          
          return (
            <Card key={link.id} className={`transition-all duration-300 ${isInactive ? 'opacity-70 bg-gray-50' : 'hover:shadow-lg'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <LinkIcon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        Link #{link.id.slice(-6)}
                      </span>
                      {link.requirePassword && (
                        <Lock className="h-4 w-4 text-yellow-500" />
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
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className={`text-gray-600 ${isLinkExpired(link.expiresAt) ? 'text-red-600 font-medium' : ''}`}>
                          {formatTimeRemaining(link.expiresAt)}
                        </span>
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
                      onClick={() => copyToClipboard(link.accessToken)}
                      disabled={isInactive}
                      className={copiedToken === link.accessToken ? 'bg-green-50 border-green-200 text-green-700' : ''}
                    >
                      {copiedToken === link.accessToken ? (
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
                      onClick={() => window.open(`/cv/ephemeral/${link.accessToken}`, '_blank')}
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
                  disabled={newLink.requirePassword && !newLink.password.trim()}
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