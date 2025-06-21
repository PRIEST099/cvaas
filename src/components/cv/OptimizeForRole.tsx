import React, { useState } from 'react';
import { X, Zap, Upload, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { CV, OptimizationChange } from '../../types/cv';
import { OptimizeForRoleResponse } from '../../types/api';
import { cvService } from '../../services/cvService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface OptimizeForRoleProps {
  cv: CV;
  onClose: () => void;
  onOptimized: (cv: CV) => void;
}

export function OptimizeForRole({ cv, onClose, onOptimized }: OptimizeForRoleProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<OptimizeForRoleResponse | null>(null);
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);

  const handleOptimize = async () => {
    if (!jobDescription.trim()) return;
    
    setIsOptimizing(true);
    try {
      const result = await cvService.optimizeForRole({
        cvId: cv.id,
        jobDescription,
        preserveOriginal: true
      });
      setOptimization(result);
      setSelectedChanges(result.changes.map(c => c.sectionId));
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!optimization) return;
    
    try {
      const optimizedCV = await cvService.applyOptimization(cv.id, optimization.optimizationId);
      onOptimized(optimizedCV);
      onClose();
    } catch (error) {
      console.error('Failed to apply optimization:', error);
    }
  };

  const toggleChange = (changeId: string) => {
    setSelectedChanges(prev =>
      prev.includes(changeId)
        ? prev.filter(id => id !== changeId)
        : [...prev, changeId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Optimize for Role</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!optimization ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleOptimize}
                  isLoading={isOptimizing}
                  disabled={!jobDescription.trim()}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize CV
                </Button>
                
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload JD File
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">How it works</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Our AI will analyze the job description and suggest improvements to your CV, 
                      including keyword optimization, bullet point rewrites, and skill highlighting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Optimization Score */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Optimization Results</h3>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-2xl font-bold text-green-600">
                        {optimization.score}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{optimization.estimatedImpact}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Keywords Highlighted</h4>
                      <div className="flex flex-wrap gap-2">
                        {optimization.keywordsHighlighted.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Suggestions</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {optimization.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Changes Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold">Proposed Changes</h3>
                {optimization.changes.map((change, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium capitalize">
                            {change.sectionId.replace('_', ' ')} - {change.field}
                          </h4>
                          <p className="text-sm text-gray-600">{change.reason}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {Math.round(change.confidence * 100)}% confidence
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedChanges.includes(change.sectionId)}
                            onChange={() => toggleChange(change.sectionId)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Original
                          </label>
                          <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                            {change.original}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Optimized
                          </label>
                          <p className="text-sm text-gray-900 bg-green-50 p-2 rounded">
                            {change.optimized}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => setOptimization(null)}>
                  Try Different Job
                </Button>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedChanges.length} of {optimization.changes.length} changes selected
                  </span>
                  <Button
                    onClick={handleApplyChanges}
                    disabled={selectedChanges.length === 0}
                  >
                    Apply Selected Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}