import React, { useState } from 'react';
import { 
  Palette, 
  Upload, 
  Globe, 
  Settings, 
  Users,
  BarChart3,
  Shield,
  Code,
  Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

export function WhiteLabelDashboard() {
  const [branding, setBranding] = useState({
    companyName: 'Your Company',
    logo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B',
    accentColor: '#0EA5E9',
    customDomain: '',
    favicon: '',
    customCSS: ''
  });

  const [features, setFeatures] = useState({
    cvBuilder: true,
    questSystem: true,
    talentDiscovery: true,
    collaboration: true,
    analytics: true,
    api: false,
    sso: false,
    whiteLabel: true
  });

  const handleColorChange = (colorType: string, color: string) => {
    setBranding(prev => ({ ...prev, [colorType]: color }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const generateCustomization = () => {
    const customization = {
      branding,
      features,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(customization, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'white-label-config.json';
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">White Label Configuration</h1>
          <p className="text-gray-600 mt-2">Customize the platform with your branding and features</p>
        </div>
        <Button onClick={generateCustomization}>
          <Download className="h-4 w-4 mr-2" />
          Export Config
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Branding Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Brand Identity
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  value={branding.companyName}
                  onChange={(e) => setBranding(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Upload
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload your logo (SVG, PNG, JPG)</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={branding.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={branding.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain
                </label>
                <Input
                  value={branding.customDomain}
                  onChange={(e) => setBranding(prev => ({ ...prev, customDomain: e.target.value }))}
                  placeholder="hiring.yourcompany.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={branding.customCSS}
                  onChange={(e) => setBranding(prev => ({ ...prev, customCSS: e.target.value }))}
                  placeholder="/* Custom styles */
.header { background: linear-gradient(...); }"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Feature Configuration
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {getFeatureDescription(feature)}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => handleFeatureToggle(feature)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Analytics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Live Preview</h3>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-6 min-h-96"
                style={{ 
                  backgroundColor: branding.primaryColor + '10',
                  borderColor: branding.primaryColor + '30'
                }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded"
                    style={{ backgroundColor: branding.primaryColor }}
                  ></div>
                  <h2 className="text-xl font-bold" style={{ color: branding.primaryColor }}>
                    {branding.companyName}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: branding.secondaryColor + '20' }}
                  >
                    <h3 className="font-medium mb-2">Dashboard</h3>
                    <p className="text-sm text-gray-600">
                      Your customized hiring platform dashboard
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      className="p-3 rounded-lg text-white font-medium"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      Create CV
                    </button>
                    <button 
                      className="p-3 rounded-lg border font-medium"
                      style={{ 
                        borderColor: branding.primaryColor,
                        color: branding.primaryColor
                      }}
                    >
                      Browse Talent
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Usage Analytics
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">2,847</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-gray-600">CVs Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">89</div>
                  <div className="text-sm text-gray-600">Quests Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">23</div>
                  <div className="text-sm text-gray-600">Successful Hires</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center">
                <Code className="h-5 w-5 mr-2" />
                API Integration
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Endpoint
                </label>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                  https://api.{branding.customDomain || 'yourcompany.com'}/v1
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <Input
                  placeholder="https://yourapp.com/webhooks/cvaas"
                  className="font-mono text-sm"
                />
              </div>

              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Generate API Keys
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    cvBuilder: 'Dynamic CV creation and editing tools',
    questSystem: 'Skill-based challenges and assessments',
    talentDiscovery: 'Anonymous candidate browsing and matching',
    collaboration: 'Peer review and feedback systems',
    analytics: 'Detailed performance and usage analytics',
    api: 'REST API access for integrations',
    sso: 'Single Sign-On with your identity provider',
    whiteLabel: 'Remove CVaaS branding completely'
  };
  return descriptions[feature] || 'Feature configuration';
}