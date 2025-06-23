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
  Shield
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
      setLinks(linksData.filter(link => link.cvId === cvId));
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
      
      setLinks(prev => [...prev, link]);
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

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/cv/ephemeral/${token}`;
    navigator.clipboard.writeText(url);
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
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* Links List */}
      <div className="space-y-4">
        {links.map((link) => (
          <Card key={link.id} className={`${!link.isActive || new Date() > new Date(link.expiresAt) ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <LinkIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-900">
                      Link #{link.id.slice(-6)}
                    </span>
                    {link.requirePassword && (
                      <Lock className="h-4 w-4 text-yellow-500" />
                    )}
                    {!link.isActive && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {formatTimeRemaining(link.expiresAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
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
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.accessToken)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/cv/ephemeral/${link.accessToken}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="font-semibold">Create Ephemeral Link</h3>
            </CardHeader>
            <CardContent className="space-y-4">
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
              </div>

              <div className="space-y-3">
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
                </div>
              )}

              <div className="flex space-x-3">
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
        <div className="text-center py-8">
          <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ephemeral links</h3>
          <p className="text-gray-600 mb-4">
            Create secure, time-limited links to share your CV with specific people.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Your First Link
          </Button>
        </div>
      )}
    </div>
  );
}