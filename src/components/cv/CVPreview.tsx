import React from 'react';
import { X, Download, Share2, ExternalLink } from 'lucide-react';
import { CV } from '../../types/cv';
import { Button } from '../ui/Button';

interface CVPreviewProps {
  cv: CV;
  onClose: () => void;
}

export function CVPreview({ cv, onClose }: CVPreviewProps) {
  const handleDownload = () => {
    // Implementation for PDF download
    console.log('Downloading CV as PDF...');
  };

  const handleShare = () => {
    // Implementation for sharing
    console.log('Sharing CV...');
  };

  const renderSection = (section: any) => {
    if (!section.isVisible) return null;

    switch (section.type) {
      case 'personal_info':
        return (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {section.content.fullName}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-gray-600">
              {section.content.email && <span>{section.content.email}</span>}
              {section.content.phone && <span>{section.content.phone}</span>}
              {section.content.location && <span>{section.content.location}</span>}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {section.content.linkedin && (
                <a href={section.content.linkedin} className="text-blue-600 hover:underline">
                  LinkedIn
                </a>
              )}
              {section.content.website && (
                <a href={section.content.website} className="text-blue-600 hover:underline">
                  Website
                </a>
              )}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{section.content.summary}</p>
          </div>
        );

      case 'experience':
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-1">
              Experience
            </h2>
            <div className="space-y-6">
              {(section.content.experiences || []).map((exp: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-blue-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">CV Preview</h2>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            {cv.publicUrl && (
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Public
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50">
          <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-lg">
            {cv.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section.id}>
                  {renderSection(section)}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}