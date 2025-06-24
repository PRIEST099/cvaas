import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Code, 
  Copy, 
  Eye, 
  Settings, 
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Download
} from 'lucide-react';
import { cvService } from '../services/cvService';
import { EmbeddableCVRenderer } from '../components/cv/EmbeddableCVRenderer';
import { WidgetConfig } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function WidgetPage() {
  const { cvId } = useParams<{ cvId: string }>();
  const [cv, setCV] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    theme: 'light',
    size: 'medium',
    sections: ['personal_info', 'summary', 'experience', 'education', 'skills'],
    showPhoto: true,
    showContact: false,
    customCSS: '',
    autoUpdate: true
  });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [embedCode, setEmbedCode] = useState('');

  useEffect(() => {
    if (cvId) {
      loadCV();
    }
  }, [cvId]);

  useEffect(() => {
    generateEmbedCode();
  }, [widgetConfig, cvId]);

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

  const generateEmbedCode = () => {
    if (!cvId) return;
    
    const config = encodeURIComponent(JSON.stringify(widgetConfig));
    const code = `<iframe 
  src="${window.location.origin}/widget/cv/${cvId}?config=${config}"
  width="100%" 
  height="${getWidgetHeight()}"
  frameborder="0"
  scrolling="auto"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`;
    setEmbedCode(code);
  };

  const getWidgetHeight = () => {
    switch (widgetConfig.size) {
      case 'small': return '400px';
      case 'medium': return '600px';
      case 'large': return '800px';
      default: return '600px';
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
  };

  const toggleSection = (sectionId: string) => {
    setWidgetConfig(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(s => s !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const getDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-sm';
      case 'tablet': return 'max-w-md';
      case 'desktop': return 'max-w-2xl';
      default: return 'max-w-2xl';
    }
  };

  const availableSections = [
    { id: 'personal_info', label: 'Personal Information' },
    { id: 'summary', label: 'Professional Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' }
  ];

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
          <p className="text-gray-600">The requested CV could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Widget Configuration</h2>
        <p className="text-gray-600">
          Create embeddable widgets for your CV with real-time updates and customizable styling.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Widget Configuration
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <button
                      key={theme}
                      className={`p-2 text-sm rounded-lg border ${
                        widgetConfig.theme === theme
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setWidgetConfig(prev => ({ ...prev, theme: theme as any }))}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      className={`p-2 text-sm rounded-lg border ${
                        widgetConfig.size === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setWidgetConfig(prev => ({ ...prev, size: size as any }))}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sections to Display
                </label>
                <div className="space-y-2">
                  {availableSections.map((section) => (
                    <label key={section.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={widgetConfig.sections.includes(section.id)}
                        onChange={() => toggleSection(section.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={widgetConfig.showPhoto}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, showPhoto: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show profile photo</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={widgetConfig.showContact}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, showContact: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show contact information</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={widgetConfig.autoUpdate}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, autoUpdate: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-update when CV changes</span>
                </label>
              </div>

              {/* Custom CSS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS (<i>coming soon!</i>)
                </label>
                <textarea
                  value={widgetConfig.customCSS}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, customCSS: e.target.value }))}
                  placeholder=".cv-widget { border-radius: 12px; }"
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Embed Code (Only works for public CVs)
              </h3>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={copyEmbedCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Copy this code and paste it into your website's HTML.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Live Preview
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className={`${getDeviceClass()} transition-all duration-300`}>
                  <div 
                    className="border rounded-lg overflow-hidden shadow-lg"
                    style={{ height: getWidgetHeight() }}
                  >
                    <div className="h-full overflow-y-auto">
                      <EmbeddableCVRenderer 
                        cv={cv} 
                        widgetConfig={widgetConfig}
                        className="p-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget Analytics */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Widget Analytics</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Total Embeds</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Widget Views</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Analytics will be available once your widget is embedded on websites.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}