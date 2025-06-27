import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, ArrowLeft, CheckCircle, AlertCircle, Lightbulb, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { aiService } from '../../services/aiService';
import { cvService } from '../../services/cvService';
import { NeuralNetworkAnimation } from '../ui/NeuralNetworkAnimation';

interface CVOptimizerModalProps {
  cv: any;
  onClose: () => void;
  onApply: (optimizedSections: Record<string, any>) => void;
  isOptimizing?: boolean;
}

export function CVOptimizerModal({
  cv,
  onClose,
  onApply,
  isOptimizing: externalIsOptimizing = false
}: CVOptimizerModalProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [optimizedSections, setOptimizedSections] = useState<Record<string, any> | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const configStatus = aiService.getConfigurationStatus();

  // We've removed the auto-optimization on mount
  // Now optimization will only happen when the user explicitly clicks the button

  const handleOptimize = async () => {
    if (!configStatus.configured) {
      setError(configStatus.message);
      return;
    }

    setIsOptimizing(true);
    setError('');

    try {
      const result = await aiService.optimizeCVContent({
        cvData: cv,
        context: jobDescription // This can be empty, the AI will use general context
      });

      setOptimizedSections(result.optimizedCV.sections.reduce((acc: Record<string, any>, section: any) => {
        if (section.ai_optimized) {
          acc[section.section_type] = section.content;
        }
        return acc;
      }, {}));
      
      setSuggestions(result.suggestions || []);
      setConfidence(result.confidence || 0.8);
      setShowComparison(true);
    } catch (err: any) {
      setError(err.message || 'Failed to optimize content');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleReoptimize = () => {
    setOptimizedSections(null);
    setShowComparison(false);
    handleOptimize();
  };

  const handleApply = () => {
    if (optimizedSections) {
      onApply(optimizedSections);
    }
  };

  const getOriginalSectionContent = (sectionType: string): string => {
    const section = cv.sections.find((s: any) => s.section_type === sectionType);
    if (!section) return 'No content available';

    switch (sectionType) {
      case 'personal_info':
        return section.content?.title || 'No title available';
      case 'summary':
        return section.content?.summary || 'No summary available';
      case 'experience':
        if (section.content?.experiences && section.content.experiences.length > 0) {
          return section.content.experiences[0].description || 'No description available';
        }
        return 'No experience description available';
      case 'projects':
        if (section.content?.projects && section.content.projects.length > 0) {
          return section.content.projects[0].description || 'No description available';
        }
        return 'No project description available';
      default:
        return JSON.stringify(section.content, null, 2);
    }
  };

  const getOptimizedSectionContent = (sectionType: string): string => {
    if (!optimizedSections || !optimizedSections[sectionType]) {
      return 'No optimized content available';
    }

    switch (sectionType) {
      case 'personal_info':
        return optimizedSections[sectionType]?.title || 'No optimized title available';
      case 'summary':
        return optimizedSections[sectionType]?.summary || 'No optimized summary available';
      case 'experience':
        if (optimizedSections[sectionType]?.experiences && optimizedSections[sectionType].experiences.length > 0) {
          return optimizedSections[sectionType].experiences[0].description || 'No optimized description available';
        }
        return 'No optimized experience description available';
      case 'projects':
        if (optimizedSections[sectionType]?.projects && optimizedSections[sectionType].projects.length > 0) {
          return optimizedSections[sectionType].projects[0].description || 'No optimized description available';
        }
        return 'No optimized project description available';
      default:
        return JSON.stringify(optimizedSections[sectionType], null, 2);
    }
  };

  const getSectionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      personal_info: 'Professional Title',
      summary: 'Professional Summary',
      experience: 'Work Experience',
      projects: 'Projects',
      skills: 'Skills',
      education: 'Education'
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI CV Optimizer</h2>
              <p className="text-blue-100 text-sm">
                Optimize your entire CV with AI
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Configuration Error */}
          {!configStatus.configured && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">AI Service Not Configured</h4>
                  <p className="text-yellow-700 text-sm mt-1">{configStatus.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Job Description Input */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  Optimization Context (Optional)
                </h3>
              </CardHeader>
              <CardContent>
                <Textarea
                  label="Job Description or Target Role"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a job description or describe the role you're targeting to get more relevant optimization..."
                  rows={3}
                  helperText="Providing context helps the AI tailor the optimization to specific requirements"
                />
                <div className="mt-4 flex space-x-3">
                  <Button 
                    onClick={handleOptimize} 
                    disabled={isOptimizing || externalIsOptimizing || !configStatus.configured}
                    isLoading={isOptimizing || externalIsOptimizing}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {optimizedSections ? 'Re-optimize' : 'Optimize CV'}
                  </Button>
                  {optimizedSections && (
                    <Button variant="outline" onClick={handleReoptimize} disabled={isOptimizing || externalIsOptimizing}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">Optimization Failed</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Content Comparison */}
          {showComparison && optimizedSections && (
            <div className="space-y-6">
              {/* Confidence Score */}
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Optimization Complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-700">Confidence:</span>
                  <div className="w-20 bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-green-800">{Math.round(confidence * 100)}%</span>
                </div>
              </div>

              {/* Section-by-section comparison */}
              <div className="space-y-6">
                {['personal_info', 'summary', 'experience', 'projects'].map((sectionType) => {
                  if (!optimizedSections[sectionType]) return null;
                  
                  return (
                    <Card key={sectionType}>
                      <CardHeader>
                        <h4 className="font-semibold text-gray-700">{getSectionTypeLabel(sectionType)}</h4>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Original Content</h5>
                            <div className="bg-gray-50 p-4 rounded-lg min-h-32">
                              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                                {getOriginalSectionContent(sectionType)}
                              </pre>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-700 mb-2">AI-Optimized Content</h5>
                            <div className="bg-blue-50 p-4 rounded-lg min-h-32 border-2 border-blue-200">
                              <pre className="whitespace-pre-wrap text-sm text-blue-900 font-sans">
                                {getOptimizedSectionContent(sectionType)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <h4 className="font-semibold flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                      AI Suggestions
                    </h4>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  {/* Rollback functionality would be added here in a future update */}
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleApply} disabled={isOptimizing || externalIsOptimizing}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Optimization
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State with Neural Network Animation */}
          {(isOptimizing || externalIsOptimizing) && (
            <NeuralNetworkAnimation />
          )}

          {/* Initial State */}
          {!isOptimizing && !externalIsOptimizing && !optimizedSections && !error && configStatus.configured && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to Optimize Your CV</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Enter a job description above for targeted optimization, or click "Optimize CV" to enhance your CV with general improvements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}