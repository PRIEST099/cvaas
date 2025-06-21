import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Copy, 
  Eye, 
  Settings, 
  Palette,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { CV } from '../../types/cv';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface LiveCVWidgetProps {
  cv: CV;
}

export function LiveCVWidget({ cv }: LiveCVWidgetProps) {
  const [widgetConfig, setWidgetConfig] = useState({
    theme: 'light' as 'light' | 'dark' | 'auto',
    size: 'medium' as 'small' | 'medium' | 'large',
    sections: ['summary', 'experience', 'skills'] as string[],
    showPhoto: true,
    showContact: false,
    customCSS: '',
    autoUpdate: true
  });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [embedCode, setEmbedCode] = useState('');

  useEffect(() => {
    generateEmbedCode();
  }, [widgetConfig, cv.id]);

  const generateEmbedCode = () => {
    const config = encodeURIComponent(JSON.stringify(widgetConfig));
    const code = `<iframe 
  src="${window.location.origin}/widget/cv/${cv.id}?config=${config}"
  width="100%" 
  height="${getWidgetHeight()}"
  frameborder="0"
  scrolling="no"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`;
    setEmbedCode(code);
  };

  const getWidgetHeight = () => {
    switch (widgetConfig.size) {
      case 'small': return '300px';
      case 'medium': return '500px';
      case 'large': return '700px';
      default: return '500px';
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    // Show toast notification in real app
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Live CV Widget</h2>
        <p className="text-gray-600">
          Embed your CV on websites with real-time updates and customizable styling.
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
                  {cv.sections.map((section) => (
                    <label key={section.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={widgetConfig.sections.includes(section.id)}
                        onChange={() => toggleSection(section.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{section.title}</span>
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
                  Custom CSS (Optional)
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
                Embed Code
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
                    className={`border rounded-lg overflow-hidden ${
                      widgetConfig.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
                    }`}
                    style={{ height: getWidgetHeight() }}
                  >
                    {/* Widget Preview Content */}
                    <div className="p-6 space-y-4">
                      {widgetConfig.showPhoto && (
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {cv.sections.find(s => s.type === 'personal_info')?.content?.fullName || 'John Doe'}
                            </h3>
                            <p className="text-gray-600">Software Engineer</p>
                          </div>
                        </div>
                      )}

                      {widgetConfig.sections.includes('summary') && (
                        <div>
                          <h4 className="font-medium mb-2">Summary</h4>
                          <p className="text-sm text-gray-600">
                            {cv.sections.find(s => s.type === 'summary')?.content?.summary || 
                             'Experienced professional with expertise in modern technologies...'}
                          </p>
                        </div>
                      )}

                      {widgetConfig.sections.includes('skills') && (
                        <div>
                          <h4 className="font-medium mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {['JavaScript', 'React', 'Node.js', 'Python'].map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {widgetConfig.showContact && (
                        <div>
                          <h4 className="font-medium mb-2">Contact</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>john.doe@email.com</p>
                            <p>+1 (555) 123-4567</p>
                            <p>San Francisco, CA</p>
                          </div>
                        </div>
                      )}
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
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-gray-600">Click-throughs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}