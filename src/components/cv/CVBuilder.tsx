import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Eye, 
  Share2, 
  RefreshCw,
  Plus,
  Settings,
  Link as LinkIcon,
  Code,
  User,
  Award,
  Building,
  Star,
  FileText,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { cvService } from '../../services/cvService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { CVSectionEditor } from './CVSectionEditor';
import { CVPreview } from './CVPreview';
import { EphemeralLinksManager } from '../privacy/EphemeralLinksManager';
import { CVOptimizerModal } from './CVOptimizerModal';

export function CVBuilder() {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  const [cv, setCV] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('personal_info');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEphemeralLinks, setShowEphemeralLinks] = useState(false);
  const [cvTitle, setCvTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);

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
      setCvTitle(cvData.title);
      
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
      
      // Update CV title if changed
      if (cvTitle !== cv.title) {
        await cvService.updateCV(cv.id, {
          title: cvTitle,
          metadata: cv.metadata
        });
        setCV(prev => ({ ...prev, title: cvTitle }));
      }
      
      // Save all sections
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

  const handleOptimizeCV = async () => {
    setShowOptimizerModal(true);
  };

  const handleApplyOptimization = async (optimizedSections: Record<string, any>) => {
    if (!cv) return;
    
    try {
      setIsOptimizing(true);
      
      // Update CV status to optimizing
      await cvService.updateCV(cv.id, {
        status: 'optimizing'
      });
      
      // Update local state
      setCV(prev => ({
        ...prev,
        status: 'optimizing'
      }));
      
      // Apply optimized content to each section
      for (const sectionType in optimizedSections) {
        const section = cv.sections.find((s: any) => s.section_type === sectionType);
        if (section) {
          // Update the section in the database
          await cvService.updateCVSection(section.id, {
            content: optimizedSections[sectionType],
            ai_optimized: true
          });
          
          // Update the section in local state
          handleSectionUpdate(section.id, {
            content: optimizedSections[sectionType],
            ai_optimized: true
          });
        }
      }
      
      // Update CV status back to previous state
      await cvService.updateCV(cv.id, {
        status: cv.status === 'optimizing' ? 'draft' : cv.status
      });
      
      // Update local state
      setCV(prev => ({
        ...prev,
        status: prev.status === 'optimizing' ? 'draft' : prev.status
      }));
      
      setShowOptimizerModal(false);
    } catch (error) {
      console.error('Failed to apply optimization:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'personal_info': return <User className="h-4 w-4" />;
      case 'summary': return <FileText className="h-4 w-4" />;
      case 'experience': return <Building className="h-4 w-4" />;
      case 'education': return <Award className="h-4 w-4" />;
      case 'skills': return <Star className="h-4 w-4" />;
      case 'projects': return <Star className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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
      
      case 'projects':
        return (section.content.projects?.length || 0) > 0 ? 100 : 0;
      
      default:
        return 0;
    }
  };

  // Navigation functions for sections
  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false); // Close mobile sidebar when navigating
  };

  const getCurrentSectionIndex = () => {
    if (!cv?.sections) return -1;
    return cv.sections.findIndex((section: any) => section.id === activeSection);
  };

  const navigateToNextSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex >= 0 && currentIndex < cv.sections.length - 1) {
      navigateToSection(cv.sections[currentIndex + 1].id);
    }
  };

  const navigateToPreviousSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex > 0) {
      navigateToSection(cv.sections[currentIndex - 1].id);
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
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              {/* Mobile sidebar toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <Input
                value={cvTitle}
                onChange={(e) => setCvTitle(e.target.value)}
                className="text-lg sm:text-xl font-semibold border-none bg-transparent px-0 focus:ring-0 focus:border-none min-w-0 flex-1"
                placeholder="CV Title"
              />
              
              <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  cv.status === 'published' ? 'bg-green-100 text-green-800' :
                  cv.status === 'optimizing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {cv.status}
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span className="hidden md:inline">Progress:</span>
                  <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <span>{overallProgress}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* AI Optimize Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimizeCV}
                disabled={isOptimizing}
                className="hidden sm:flex bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:bg-blue-100"
              >
                {isOptimizing ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin text-blue-600" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1 text-blue-600" />
                )}
                <span className="text-blue-700">
                  {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEphemeralLinks(true)}
                className="hidden sm:flex"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Share</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/cvs/${cv.id}/widget`)}
                className="hidden sm:flex"
              >
                <Code className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Widget</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="relative"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 sm:mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
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
                      onClick={() => navigateToSection(section.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getSectionIcon(section.section_type)}
                          <span className="font-medium text-sm">{section.title}</span>
                        </div>
                        {section.ai_optimized && (
                          <Sparkles className="h-3 w-3 text-yellow-500" />
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
          </div>

          {/* Mobile Sidebar */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
              <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[80vw] bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">CV Sections</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4 space-y-2 overflow-y-auto">
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
                        onClick={() => navigateToSection(section.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSectionIcon(section.section_type)}
                            <span className="font-medium">{section.title}</span>
                          </div>
                          {section.ai_optimized && (
                            <Sparkles className="h-3 w-3 text-yellow-500" />
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
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Section Editor */}
          <div className="lg:col-span-3">
            <CVSectionEditor
              section={activeSection_data}
              sections={cv.sections}
              currentSectionIndex={getCurrentSectionIndex()}
              onUpdate={(updates) => handleSectionUpdate(activeSection, updates)}
              onNavigateToSection={navigateToSection}
              onNavigateNext={navigateToNextSection}
              onNavigatePrevious={navigateToPreviousSection}
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
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold">Secure Sharing</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEphemeralLinks(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <EphemeralLinksManager cvId={cv.id} />
            </div>
          </div>
        </div>
      )}

      {/* CV Optimizer Modal */}
      {showOptimizerModal && (
        <CVOptimizerModal
          cv={cv}
          onClose={() => setShowOptimizerModal(false)}
          onApply={handleApplyOptimization}
          isOptimizing={isOptimizing}
        />
      )}
    </div>
  );
}