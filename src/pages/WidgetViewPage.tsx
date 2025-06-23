import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, FileText } from 'lucide-react';
import { cvService } from '../services/cvService';
import { EmbeddableCVRenderer } from '../components/cv/EmbeddableCVRenderer';
import { WidgetConfig } from '../types';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CV widget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Widget Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!cv || !widgetConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Not Found</h2>
          <p className="text-gray-600 mb-6">The requested CV widget could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <EmbeddableCVRenderer 
        cv={cv} 
        widgetConfig={widgetConfig}
        className="p-6"
      />
      
      {/* Powered by footer */}
      <div className="text-center py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Powered by{' '}
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            CVaaS
          </a>
        </p>
      </div>
    </div>
  );
}