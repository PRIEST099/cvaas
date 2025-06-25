import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Share2, Download, MoreVertical, Sparkles, GitBranch } from 'lucide-react';
import { cvService } from '../services/cvService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function CVListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cvs, setCVs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          topReferrers: [],
          keywordMatches: []
        }
      });
      
      navigate(`/cvs/${newCV.id}/edit`);
    } catch (error) {
      console.error('Failed to create CV:', error);
    }
  };

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
          {cvs.map((cv) => (
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
                  
                  <Button variant="ghost" size="sm" className="p-1 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-4 sm:mb-6">
                  <div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">{cv.metadata?.totalViews || 0}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">{cv.metadata?.downloadCount || 0}</div>
                    <div className="text-xs text-gray-500">Downloads</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">{cv.metadata?.shareCount || 0}</div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    size="sm"
                    className="w-full sm:flex-1"
                    onClick={() => navigate(`/cvs/${cv.id}/edit`)}
                  >
                    Edit
                  </Button>
                  
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none p-2">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none p-2">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none p-2">
                      <GitBranch className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {cv.public_url && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <span className="text-xs text-green-700">Public CV</span>
                      <Button variant="ghost" size="sm" className="text-xs self-start sm:self-auto">
                        Copy Link
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}