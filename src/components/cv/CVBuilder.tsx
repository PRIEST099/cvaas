import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  Share2, 
  Zap, 
  GitBranch, 
  BarChart3, 
  Sparkles,
  RefreshCw,
  Plus,
  Settings,
  Link as LinkIcon,
  Code
} from 'lucide-react';
import { cvService } from '../../services/cvService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { CVSectionEditor } from './CVSectionEditor';
import { CVPreview } from './CVPreview';
import { EphemeralLinksManager } from '../privacy/EphemeralLinksManager';

export function CVBuilder() {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  const [cv, setCV] = useState(null);
  const [activeSection, setActiveSection] = useState('personal_info');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEphemeralLinks, setShowEphemeralLinks] = useState(false);

  useEffect(() => {
    if (cvId) {
      loadCV();
    }
  }, [cvId]);

  const loadCV = async () => {
    try {
      setIsLoading(true);
      const cvData = await cvService.getCV(cvId!);
      setCV(cvData);
    } catch (error) {
      console.error('Failed to load CV:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!cv) return;
    
    try {
      setIsSaving(true);
      await cvService.updateCV(cv.id, cv);
    } catch (error) {
      console.error('Failed to save CV:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionUpdate = (sectionId: string, updates: any) => {
    if (!cv) return;
    
    setCV(prev => ({
      ...prev!,
      sections: prev!.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
      updated_at: new Date().toISOString()
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">CV Not Found</h2>
          <Button onClick={() => navigate('/cvs')}>Back to CVs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{cv.title}</h1>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                cv.status === 'published' ? 'bg-green-100 text-green-800' :
                cv.status === 'optimizing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {cv.status}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEphemeralLinks(true)}
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                Share Links
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/cvs/${cv.id}/widget`)}
              >
                <Code className="h-4 w-4 mr-1" />
                Widget
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Skills radar coming soon')}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Skills Radar
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Optimization coming soon')}
              >
                <Zap className="h-4 w-4 mr-1" />
                Optimize
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Version control coming soon')}
              >
                <GitBranch className="h-4 w-4 mr-1" />
                Versions
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              
              <Button
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Sections</h3>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {cv.sections && cv.sections.map((section) => (
                  <button
                    key={section.id}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{section.title}</span>
                      {section.ai_optimized && (
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => console.log('Add section coming soon')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <h3 className="font-semibold">Performance</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-semibold">{cv.metadata?.totalViews || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Downloads</span>
                  <span className="font-semibold">{cv.metadata?.downloadCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shares</span>
                  <span className="font-semibold">{cv.metadata?.shareCount || 0}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Section Editor */}
          <div className="lg:col-span-3">
            <CVSectionEditor
              section={cv.sections?.find(s => s.id === activeSection)!}
              onUpdate={(updates) => handleSectionUpdate(activeSection, updates)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPreview && (
        <CVPreview
          cv={cv}
          onClose={() => setShowPreview(false)}
        />
      )}
      
      {showEphemeralLinks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Secure Sharing</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEphemeralLinks(false)}>
                ×
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <EphemeralLinksManager cvId={cv.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}