import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Share2, Download, MoreVertical, Sparkles, Code, X, Trash2, AlertTriangle, Globe } from 'lucide-react';
import { cvService } from '../services/cvService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { EphemeralLinksManager } from '../components/privacy/EphemeralLinksManager';

export function CVListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cvs, setCVs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEphemeralLinks, setShowEphemeralLinks] = useState(false);
  const [selectedCvForLinks, setSelectedCvForLinks] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [isUnpublishing, setIsUnpublishing] = useState<string | null>(null);
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<any>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.title = 'CVaaS | My CVs';
    if (user) {
      loadCVs();
    }
  }, [user]);

  const loadCVs = async () => {
    try {
      setIsLoading(true);
      const cvsData = await cvService.getCVs();
      setCVs(cvsData);
    } catch (error) {
      console.error('Failed to load CVs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewCV = async () => {
    try {
      const newCV = await cvService.createCV({
        title: 'Untitled CV',
        is_public: false,
        template_id: 'modern-1',
        status: 'draft',
        metadata: {
          totalViews: 0,
          uniqueViews: 0,
          downloadCount: 0,
          shareCount: 0,
          recruiterViews: 0,
          topReferrers: [],
          keywordMatches: []
        }
      });
      
      navigate(`/cvs/${newCV.id}/edit`);
    } catch (error) {
      console.error('Failed to create CV:', error);
    }
  };

  const handleViewCV = (cv: any) => {
    if (cv.public_url) {
      window.open(`/cv/public/${cv.public_url}`, '_blank');
    } else {
      setSelectedCvForLinks(cv);
      setShowEphemeralLinks(true);
    }
  };

  const handleShareCV = (cv: any) => {
    setSelectedCvForLinks(cv);
    setShowEphemeralLinks(true);
  };

  const handleWidgetCV = (cv: any) => {
    navigate(`/cvs/${cv.id}/widget`);
  };

  const handlePublishCV = async (cv: any) => {
    try {
      setIsPublishing(cv.id);
      const updatedCV = await cvService.publishCV(cv.id);
      
      // Update the CV in the local state
      setCVs(prevCVs => prevCVs.map(c => c.id === cv.id ? updatedCV : c));
    } catch (error) {
      console.error('Failed to publish CV:', error);
    } finally {
      setIsPublishing(null);
    }
  };

  const handleUnpublishCV = async (cv: any) => {
    try {
      setIsUnpublishing(cv.id);
      const updatedCV = await cvService.unpublishCV(cv.id);
      
      // Update the CV in the local state
      setCVs(prevCVs => prevCVs.map(c => c.id === cv.id ? updatedCV : c));
    } catch (error) {
      console.error('Failed to unpublish CV:', error);
    } finally {
      setIsUnpublishing(null);
    }
  };

  // Delete confirmation functions
  const openDeleteModal = (cv: any) => {
    setCvToDelete(cv);
    setDeleteConfirmationText('');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCvToDelete(null);
    setDeleteConfirmationText('');
    setIsDeleting(false);
  };

  const handleDeleteCV = async () => {
    if (!cvToDelete || deleteConfirmationText !== cvToDelete.title) {
      return;
    }

    try {
      setIsDeleting(true);
      await cvService.deleteCV(cvToDelete.id);
      
      // Remove the deleted CV from the local state
      setCVs(prev => prev.filter(cv => cv.id !== cvToDelete.id));
      
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete CV:', error);
      setIsDeleting(false);
    }
  };

  const isDeleteConfirmationValid = deleteConfirmationText === cvToDelete?.title;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My CVs</h1>
          <p className="text-gray-600 mt-2">Create and manage your professional CVs</p>
        </div>
        
        <Button onClick={createNewCV} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create New CV
        </Button>
      </div>

      {cvs.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-blue-100 rounded-full p-6 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Create Your First CV</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Build a professional CV with our AI-powered tools. Get started with templates, 
              skills radar, and role optimization features.
            </p>
            <Button size="lg" onClick={createNewCV} className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First CV
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {cvs.map((cv) => {
            const publicViews = cv.metadata?.totalViews || cv.metadata?.views || 0;
            const recruiterViews = cv.metadata?.recruiterViews || 0;
            const totalViews = publicViews + recruiterViews;
            const downloads = cv.metadata?.downloadCount || cv.metadata?.downloads || 0;
            const shares = cv.metadata?.shareCount || cv.metadata?.shares || 0;
            const isPublished = cv.status === 'published' && cv.is_public;

            return (
              <Card key={cv.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{cv.title}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          cv.status === 'published' ? 'bg-green-100 text-green-800' :
                          cv.status === 'optimizing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cv.status}
                        </span>
                        <span className="text-xs text-gray-500">v{cv.version}</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Button variant="ghost" size="sm" className="p-1 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-4 sm:mb-6">
                    <div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{totalViews}</div>
                      <div className="text-xs text-gray-500">
                        Views
                        {recruiterViews > 0 && (
                          <div className="text-xs text-blue-600">({recruiterViews} recruiter)</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{downloads}</div>
                      <div className="text-xs text-gray-500">Downloads</div>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{shares}</div>
                      <div className="text-xs text-gray-500">Shares</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/cvs/${cv.id}/edit`)}
                    >
                      Edit CV
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 p-2"
                        onClick={() => handleViewCV(cv)}
                        title="View CV"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 p-2"
                        onClick={() => handleShareCV(cv)}
                        title="Share CV"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 p-2"
                        onClick={() => handleWidgetCV(cv)}
                        title="CV Widget"
                      >
                        <Code className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteModal(cv)}
                        title="Delete CV"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Publish/Unpublish Button */}
                    {cv.status !== 'optimizing' && (
                      <Button
                        variant={isPublished ? "outline" : "primary"}
                        size="sm"
                        className={isPublished ? "border-green-300 text-green-700 hover:bg-green-50" : ""}
                        onClick={() => isPublished ? handleUnpublishCV(cv) : handlePublishCV(cv)}
                        disabled={isPublishing === cv.id || isUnpublishing === cv.id}
                      >
                        {isPublishing === cv.id ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            Publishing...
                          </>
                        ) : isUnpublishing === cv.id ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-500 border-t-transparent rounded-full"></div>
                            Unpublishing...
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-2" />
                            {isPublished ? "Unpublish CV" : "Publish CV"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {cv.public_url && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <span className="text-xs text-green-700 flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          Public CV
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs self-start sm:self-auto"
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/cv/public/${cv.public_url}`)}
                          >
                            Copy Link
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(`/cv/public/${cv.public_url}`, '_blank')}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && cvToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="bg-red-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Delete CV</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700">
                  You are about to permanently delete the CV <strong>"{cvToDelete.title}"</strong>. 
                  This will remove all associated data including sections, experience, education, and skills.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This action is irreversible. All data will be permanently lost.
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To confirm deletion, type the CV title exactly as shown:
                  </label>
                  <div className="mb-2 p-2 bg-gray-100 rounded border text-sm font-mono">
                    {cvToDelete.title}
                  </div>
                  <Input
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="Type the CV title here"
                    className={`${
                      deleteConfirmationText && !isDeleteConfirmationValid 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : isDeleteConfirmationValid 
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                        : ''
                    }`}
                    autoFocus
                  />
                  {deleteConfirmationText && !isDeleteConfirmationValid && (
                    <p className="text-red-600 text-xs mt-1">
                      The text doesn't match the CV title
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteCV}
                  disabled={!isDeleteConfirmationValid || isDeleting}
                  isLoading={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Deleting...' : 'Delete CV'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ephemeral Links Modal */}
      {showEphemeralLinks && selectedCvForLinks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold">Share {selectedCvForLinks.title}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEphemeralLinks(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <EphemeralLinksManager cvId={selectedCvForLinks.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}