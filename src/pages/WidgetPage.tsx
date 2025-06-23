import React from 'react';
import { useParams } from 'react-router-dom';
import { LiveCVWidget } from '../components/widgets/LiveCVWidget';
import { cvService } from '../services/cvService';
import { useState, useEffect } from 'react';

export function WidgetPage() {
  const { cvId } = useParams();
  const [cv, setCV] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LiveCVWidget cv={cv} />
    </div>
  );
}