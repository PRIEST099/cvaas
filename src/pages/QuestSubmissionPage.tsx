import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  Award, 
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function QuestSubmissionPage() {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quest, setQuest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [startTime] = useState(Date.now());
  
  const [submissionData, setSubmissionData] = useState({
    content: '',
    notes: ''
  });

  useEffect(() => {
    if (questId) {
      loadQuest();
    }
  }, [questId]);

  const loadQuest = async () => {
    try {
      setIsLoading(true);
      const questData = await questService.getQuest(questId!);
      setQuest(questData);
    } catch (error) {
      console.error('Failed to load quest:', error);
      setError('Failed to load quest details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!submissionData.content.trim()) {
      setError('Please provide your solution before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const timeSpent = Math.round((Date.now() - startTime) / 1000); // in seconds

      const submission = {
        quest_id: questId!,
        submission_content: {
          solution: submissionData.content,
          notes: submissionData.notes,
          submitted_at: new Date().toISOString()
        },
        time_spent: timeSpent
      };

      await questService.submitQuest(submission);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error && !quest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Challenge</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/challenges')}>
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your solution has been submitted successfully. A recruiter will review your submission and provide feedback.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/challenges')} className="w-full">
              Browse More Challenges
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/challenges')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Challenges
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{quest?.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {quest?.difficulty}
                  </span>
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    {quest?.category}
                  </span>
                  {quest?.estimated_time && (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {quest.estimated_time} minutes
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Time elapsed: {Math.round((Date.now() - startTime) / 60000)} min
              </span>
              <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!submissionData.content.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Submit Solution
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Challenge Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quest Overview */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Challenge Overview
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{quest?.description}</p>
                
                {quest?.instructions?.overview && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
                    <p className="text-blue-800 text-sm">{quest.instructions.overview}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            {quest?.instructions?.requirements && quest.instructions.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Requirements
                  </h3>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {quest.instructions.requirements.map((requirement: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills Assessed */}
            {quest?.skills_assessed && quest.skills_assessed.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Skills Being Assessed
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {quest.skills_assessed.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evaluation Criteria */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Evaluation
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Passing Score:</span>
                    <span className="font-medium">{quest?.passing_score || 80}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Review Method:</span>
                    <span className="font-medium">Manual Review</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Your submission will be reviewed by a recruiter who will provide detailed feedback and a score.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <h3 className="font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Your Solution
                </h3>
                <p className="text-sm text-gray-600">
                  Provide your complete solution below. Be thorough and explain your approach.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}

                <Textarea
                  label="Solution"
                  value={submissionData.content}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Provide your complete solution here. Include code, explanations, reasoning, and any relevant details..."
                  rows={20}
                  className="font-mono text-sm"
                  required
                />

                <Textarea
                  label="Additional Notes (Optional)"
                  value={submissionData.notes}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes, assumptions, or explanations you'd like to include..."
                  rows={4}
                />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Before you submit:</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Review your solution for completeness and accuracy</li>
                        <li>• Ensure you've addressed all requirements</li>
                        <li>• Double-check your code for syntax errors</li>
                        <li>• Include explanations for your approach and decisions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time spent: {Math.round((Date.now() - startTime) / 60000)} minutes
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => navigate('/challenges')}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      isLoading={isSubmitting}
                      disabled={!submissionData.content.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Solution
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}