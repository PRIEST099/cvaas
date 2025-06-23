import React from 'react';
import { useParams } from 'react-router-dom';
import { Code, Monitor, Smartphone, Tablet } from 'lucide-react';

export function WidgetPage() {
  const { cvId } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CV Widget</h1>
        <p className="text-gray-600 mb-8">
          Embeddable CV widgets are coming soon. Share your CV on websites 
          with live updates and customizable styling.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 bg-gray-50 rounded-lg">
            <Monitor className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Desktop Widget</h3>
            <p className="text-sm text-gray-600">Full-featured CV display</p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <Tablet className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Tablet Optimized</h3>
            <p className="text-sm text-gray-600">Responsive tablet layout</p>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <Smartphone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Mobile Ready</h3>
            <p className="text-sm text-gray-600">Mobile-first design</p>
          </div>
        </div>
      </div>
    </div>
  );
}