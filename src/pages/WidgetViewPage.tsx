import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, FileText, ExternalLink, Sparkles } from 'lucide-react';
import { cvService } from '../services/cvService';
import { EmbeddableCVRenderer } from '../components/cv/EmbeddableCVRenderer';
import { WidgetConfig } from '../types';
import { Button } from '../components/ui/Button';

export function WidgetViewPage() {
  const { cvId } = useParams<{ cvId: string }>();
  const [searchParams] = useSearchParams();
  const [cv, setCV] = useState<any>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cvId) {
      loadCVAndConfig();
    }
  }, [cvId]);

  const loadCVAndConfig = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load CV data
      const cvData = await cvService.getCV(cvId!);
      setCV(cvData);

      // Parse widget configuration from URL params
      const configParam = searchParams.get('config');
      if (configParam) {
        try {
          const decodedConfig = JSON.parse(decodeURIComponent(configParam));
          setWidgetConfig(decodedConfig);
        } catch (configError) {
          console.warn('Failed to parse widget config, using defaults:', configError);
          setWidgetConfig({
            theme: 'light',
            size: 'medium',
            sections: ['personal_info', 'summary', 'experience', 'education', 'skills'],
            showPhoto: true,
            showContact: true,
            customCSS: '',
            autoUpdate: true
          });
        }
      } else {
        // Default configuration
        setWidgetConfig({
          theme: 'light',
          size: 'medium',
          sections: ['personal_info', 'summary', 'experience', 'education', 'skills'],
          showPhoto: true,
          showContact: true,
          customCSS: '',
          autoUpdate: true
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load CV');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading CV widget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Widget Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!cv || !widgetConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Not Found</h2>
          <p className="text-gray-600 mb-6">The requested CV widget could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-6">
        <EmbeddableCVRenderer 
          cv={cv} 
          widgetConfig={widgetConfig}
          className="bg-white rounded-xl shadow-lg"
        />
      </div>
      
      {/* Enhanced CTA footer */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="h-5 w-5 mr-2" />
            <span className="font-semibold">Powered by CVaaS</span>
          </div>
          <p className="text-blue-100 text-sm mb-4">
            Create your own professional CV with dynamic widgets and real-time updates
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="sm"
              variant="outline" 
              className="bg-white text-blue-600 hover:bg-blue-50 border-white"
              onClick={() => window.open('/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Create Your CV
            </Button>
            <Button 
              size="sm"
              variant="ghost" 
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => window.open('/register?role=recruiter', '_blank')}
            >
              For Recruiters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}