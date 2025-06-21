import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Share2, Download, MoreVertical, Sparkles, GitBranch } from 'lucide-react';
import { CV } from '../types/cv';
import { cvService } from '../services/cvService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function CVListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cvs, setCVs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCVs();
    }
  }, [user]);

  const loadCVs = async () => {
    try {
      setIsLoading(true);
      const cvsData = await cvService.getCVs(user!.id);
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
        userId: user!.id,
        title: 'Untitled CV',
        isPublic: false,
        templateId: 'modern-1',
        version: 1,
        status: 'draft',
        sections: [
          {
            id: 'personal_info',
            type: 'personal_info',
            title: 'Personal Information',
            content: {},
            order: 0,
            isVisible: true,
            aiOptimized: false
          },
          {
            id: 'summary',
            type: 'summary',
            title: 'Professional Summary',
            content: {},
            order: 1,
            isVisible: true,
            aiOptimized: false
          },
          {
            id: 'experience',
            type: 'experience',
            title: 'Experience',
            content: { experiences: [] },
            order: 2,
            isVisible: true,
            aiOptimized: false
          }
        ],
        aiOptimizations: [],
        skillsRadar: {
          id: `skills_${Date.now()}`,
          lastScanned: new Date().toISOString(),
          sources: [],
          detectedSkills: [],
          manualSkills: [],
          skillCategories: []
        },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My CVs</h1>
          <p className="text-gray-600 mt-2">Create and manage your professional CVs</p>
        </div>
        
        <Button onClick={createNewCV}>
          <Plus className="h-4 w-4 mr-2" />
          Create New CV
        </Button>
      </div>

      {cvs.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your First CV</h2>
            <p className="text-gray-600 mb-8">
              Build a professional CV with our AI-powered tools. Get started with templates, 
              skills radar, and role optimization features.
            </p>
            <Button size="lg" onClick={createNewCV}>
              <Plus className="h-5 w-5 mr-2" />
              Create Your First CV
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <Card key={cv.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{cv.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        cv.status === 'published' ? 'bg-green-100 text-green-800' :
                        cv.status === 'optimizing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cv.status}
                      </span>
                      {cv.aiOptimizations.length > 0 && (
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-500">v{cv.version}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{cv.metadata.totalViews}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{cv.metadata.downloadCount}</div>
                    <div className="text-xs text-gray-500">Downloads</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{cv.metadata.shareCount}</div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/cvs/${cv.id}/edit`)}
                  >
                    Edit
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <GitBranch className="h-4 w-4" />
                  </Button>
                </div>
                
                {cv.publicUrl && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700">Public CV</span>
                      <Button variant="ghost" size="sm" className="text-xs">
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