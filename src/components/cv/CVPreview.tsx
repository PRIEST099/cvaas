import React from 'react';
import { X, Download, Share2, ExternalLink, MapPin, Mail, Phone, Globe, Linkedin, Github, Calendar, Building, Award, Star } from 'lucide-react';
import { Button } from '../ui/Button';

interface CVPreviewProps {
  cv: any;
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
    if (!section.is_visible) return null;

    switch (section.section_type) {
      case 'personal_info':
        return (
          <div className="text-center mb-8 pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {section.content.fullName || 'Your Name'}
            </h1>
            {section.content.title && (
              <h2 className="text-xl text-blue-600 font-medium mb-4">
                {section.content.title}
              </h2>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 text-gray-600 mb-4">
              {section.content.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{section.content.email}</span>
                </div>
              )}
              {section.content.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{section.content.phone}</span>
                </div>
              )}
              {section.content.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{section.content.location}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {section.content.linkedin && (
                <a href={section.content.linkedin} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              )}
              {section.content.website && (
                <a href={section.content.website} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              )}
              {section.content.github && (
                <a href={section.content.github} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              )}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-blue-600 mr-3"></div>
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {section.content.summary || 'Your professional summary will appear here...'}
            </p>
          </div>
        );

      case 'experience':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-blue-600 mr-3"></div>
              Professional Experience
            </h2>
            <div className="space-y-6">
              {(section.content.experiences || []).map((exp: any, index: number) => (
                <div key={index} className="relative pl-6 border-l-2 border-gray-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{exp.position || 'Position Title'}</h3>
                      <div className="flex items-center text-blue-600 font-medium mb-1">
                        <Building className="h-4 w-4 mr-2" />
                        {exp.company || 'Company Name'}
                      </div>
                      {exp.location && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {exp.location}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mt-2 md:mt-0">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' - '}
                        {exp.isCurrent ? 'Present' : 
                         (exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
                        }
                      </span>
                    </div>
                  </div>
                  
                  {exp.description && (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-blue-600 mr-3"></div>
              Education
            </h2>
            <div className="space-y-4">
              {(section.content.education || []).map((edu: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </h3>
                      <div className="flex items-center text-blue-600 font-medium mb-2">
                        <Award className="h-4 w-4 mr-2" />
                        {edu.institution}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {edu.gpa && (
                          <span>GPA: {edu.gpa}</span>
                        )}
                        {edu.honors && (
                          <span>{edu.honors}</span>
                        )}
                      </div>
                    </div>
                    {edu.graduationYear && (
                      <div className="text-gray-500 text-sm mt-2 md:mt-0">
                        Class of {edu.graduationYear}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-blue-600 mr-3"></div>
              Skills & Expertise
            </h2>
            <div className="space-y-6">
              {(section.content.skillCategories || []).map((category: any, index: number) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-blue-600" />
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(category.skills || []).map((skill: any, skillIndex: number) => (
                      <div key={skillIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${
                                  level <= (skill.level || 3) ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 min-w-12">
                            {['', 'Basic', 'Good', 'Strong', 'Expert', 'Master'][skill.level || 3]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">CV Preview</h2>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            {cv.public_url && (
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
          <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
            {cv.sections
              ?.sort((a: any, b: any) => a.display_order - b.display_order)
              .map((section: any) => (
                <div key={section.id}>
                  {renderSection(section)}
                </div>
              ))}
            
            {(!cv.sections || cv.sections.length === 0) && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Award className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-600">Start adding sections to see your CV preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}