import React, { useState, useEffect } from 'react';
import { X, GitBranch, Plus, Eye, BarChart3, Copy, Trash2 } from 'lucide-react';
import { CV, CVVersion } from '../../types/cv';
import { cvService } from '../../services/cvService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface VersionControlProps {
  cv: CV;
  onClose: () => void;
  onVersionSelected: (version: CVVersion) => void;
}

export function VersionControl({ cv, onClose, onVersionSelected }: VersionControlProps) {
  const [versions, setVersions] = useState<CVVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVersion, setNewVersion] = useState({
    title: '',
    description: '',
    templateId: cv.templateId
  });

  useEffect(() => {
    loadVersions();
  }, [cv.id]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const versionsData = await cvService.getCVVersions(cv.id);
      setVersions(versionsData);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createVersion = async () => {
    if (!newVersion.title.trim()) return;
    
    try {
      const result = await cvService.createVersion({
        cvId: cv.id,
        title: newVersion.title,
        description: newVersion.description,
        templateId: newVersion.templateId,
        changes: ['Manual version creation']
      });
      
      await loadVersions();
      setShowCreateForm(false);
      setNewVersion({ title: '', description: '', templateId: cv.templateId });
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  const getPerformanceColor = (responseRate: number) => {
    if (responseRate >= 15) return 'text-green-600';
    if (responseRate >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <GitBranch className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Version Control</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">CV Versions</h3>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Version
            </Button>
          </div>

          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <h4 className="font-medium">Create New Version</h4>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Version Title"
                  value={newVersion.title}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Software Engineer Focus, Marketing Role Optimized"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newVersion.description}
                    onChange={(e) => setNewVersion(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what makes this version different..."
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button onClick={createVersion} disabled={!newVersion.title.trim()}>
                    Create Version
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Version */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-blue-900">{cv.title}</h4>
                        <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">
                          CURRENT
                        </span>
                        <span className="text-sm text-blue-700">v{cv.version}</span>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Views</span>
                          <p className="text-blue-900 font-semibold">{cv.metadata.totalViews}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Downloads</span>
                          <p className="text-blue-900 font-semibold">{cv.metadata.downloadCount}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Shares</span>
                          <p className="text-blue-900 font-semibold">{cv.metadata.shareCount}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Last Updated</span>
                          <p className="text-blue-900 font-semibold">{formatDate(cv.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Version History */}
              {versions.map((version) => (
                <Card key={version.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{version.title}</h4>
                          <span className="text-sm text-gray-500">v{version.version}</span>
                          <span className="text-sm text-gray-500">
                            Created {formatDate(version.createdAt)}
                          </span>
                        </div>
                        
                        {version.description && (
                          <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                        )}
                        
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Views</span>
                            <p className="font-semibold">{version.performance.views}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Downloads</span>
                            <p className="font-semibold">{version.performance.downloads}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Applications</span>
                            <p className="font-semibold">{version.performance.applications}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Response Rate</span>
                            <p className={`font-semibold ${getPerformanceColor(version.performance.responseRate)}`}>
                              {version.performance.responseRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onVersionSelected(version)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {versions.length === 0 && (
                <div className="text-center py-12">
                  <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No versions yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create different versions of your CV to A/B test what works best for different roles.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Your First Version
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}