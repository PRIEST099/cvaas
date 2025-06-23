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
  Code,
  User,
  Award,
  Building,
  Star,
  FileText
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
  const [cv, setCV] = useState<any>(null);
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
      
      if (cvData.sections && cvData.sections.length > 0) {
        setActiveSection(cvData.sections[0].id);
      }
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
      await cvService.updateCV(cv.id, {
        title: cv.title,
        metadata: cv.metadata
      });
      
      for (const section of cv.sections) {
        await cvService.updateCVSection(section.id, {
          content: section.content,
          is_visible: section.is_visible,
          title: section.title
        });
      }
    } catch (error) {
      console.error('Failed to save CV:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionUpdate = (sectionId: string, updates: any) => {
    if (!cv) return;
    
    setCV((prev: any) => ({
      ...prev,
      sections: prev.sections.map((section: any) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
      updated_at: new Date().toISOString()
    }));
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'personal_info': return <User className="h-4 w-4" />;
      case 'summary': return <FileText className="h-4 w-4" />;
      case 'experience': return <Building className="h-4 w-4" />;
      case 'education': return <Award className="h-4 w-4" />;
      case 'skills': return <Star className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getSectionProgress = (section: any) => {
    if (!section.content) return 0;
    
    switch (section.section_type) {
      case 'personal_info':
        const personalFields = ['fullName', 'email', 'phone', 'location'];
        const filledPersonal = personalFields.filter(field => section.content[field]?.trim()).length;
        return Math.round((filledPersonal / personalFields.length) * 100);
      
      case 'summary':
        return section.content.summary?.trim() ? 100 : 0;
      
      case 'experience':
        return (section.content.experiences?.length || 0) > 0 ? 100 : 0;
      
      case 'education':
        return (section.content.education?.length || 0) > 0 ? 100 : 0;
      
      case 'skills':
        return (section.content.skillCategories?.length || 0) > 0 ? 100 : 0;
      
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your CV...</p>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">CV Not Found</h2>
          <p className="text-gray-600 mb-6">The CV you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/cvs')}>Back to CVs</Button>
        </div>
      </div>
    );
  }

  const activeSection_data = cv.sections?.find((s: any) => s.id === activeSection);
  const overallProgress = cv.sections ? 
    Math.round(cv.sections.reduce((sum: number, section: any) => sum + getSectionProgress(section), 0) / cv.sections.length) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{cv.title}</h1>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  cv.status === 'published' ? 'bg-green-100 text-green-800' :
                  cv.status === 'optimizing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {cv.status}
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span>Progress:</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <span>{overallProgress}%</span>
                </div>
              </div>
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
                disabled={isSaving}
                className="relative"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">CV Sections</h3>
                  <Button size="sm" variant="ghost" onClick={() => console.log('Add section coming soon')}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {cv.sections && cv.sections.map((section: any) => {
                  const progress = getSectionProgress(section);
                  return (
                    <button
                      key={section.id}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getSectionIcon(section.section_type)}
                          <span className="font-medium">{section.title}</span>
                        </div>
                        {section.ai_optimized && (
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              progress === 100 ? 'bg-green-500' : 
                              progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                    </button>
                  );
                })}
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
              section={activeSection_data}
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