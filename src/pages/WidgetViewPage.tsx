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

      // Load CV data - try to get public CV first, then fall back to regular CV
      let cvData;
      try {
        cvData = await cvService.getCV(cvId!);
      } catch (err) {
        // If regular CV fetch fails, it might be a permission issue
        // For widget display, we should allow public access
        console.warn('Failed to load CV with auth, trying public access');
        throw err;
      }
      
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
      console.error('Widget loading error:', err);
      setError(err.message || 'Failed to load CV widget');
    } finally {
      setIsLoading(false);
    }
  };

  // Add message listener for iframe communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle messages from parent window if needed
      if (event.data.type === 'WIDGET_RESIZE') {
        // Handle resize requests
        const height = document.body.scrollHeight;
        event.source?.postMessage({ type: 'WIDGET_HEIGHT', height }, event.origin);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Send initial height to parent
    const sendHeight = () => {
      const height = Math.max(document.body.scrollHeight, 600);
      window.parent.postMessage({ type: 'WIDGET_HEIGHT', height }, '*');
    };

    // Send height after content loads
    setTimeout(sendHeight, 100);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [cv, widgetConfig]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading CV widget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Widget Error</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-500">
            Please check that the CV exists and is accessible.
          </p>
        </div>
      </div>
    );
  }

  if (!cv || !widgetConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">CV Not Found</h2>
          <p className="text-gray-600 text-sm mb-4">The requested CV widget could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        <EmbeddableCVRenderer 
          cv={cv} 
          widgetConfig={widgetConfig}
          className="w-full"
        />
      </div>
      
      {/* Powered by footer */}
      <div className="text-center py-3 border-t border-gray-100 bg-gray-50">
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