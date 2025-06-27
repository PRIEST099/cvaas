import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Clock, 
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Download,
  Tag,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Lightbulb,
  Target,
  Trash2,
  Plus
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { FeedbackItem, StructuredFeedback } from '../types';

export function QuestSubmissionReviewPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [quest, setQuest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [reviewData, setReviewData] = useState<{
    status: 'passed' | 'failed' | 'needs_revision' | 'under_review';
    score: string;
    feedback: StructuredFeedback;
  }>({
    status: 'under_review',
    score: '',
    feedback: {
      overall: '',
      strengths: [],
      improvements: [],
      specificComments: [],
      score: 0,
      recommendation: 'consider'
    }
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (submissionId) {
      loadSubmission();
    }
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      setIsLoading(true);
      // Get submissions for this recruiter (submissions to quests they created)
      const submissions = await questService.getSubmissions({ forRecruiter: true });
      const targetSubmission = submissions.find(s => s.id === submissionId);
      
      if (!targetSubmission) {
        setError('Submission not found or you do not have permission to view it');
        return;
      }

      setSubmission(targetSubmission);
      
      // Load the quest details
      const questData = await questService.getQuest(targetSubmission.quest_id);
      setQuest(questData);

      // Pre-populate review data if already reviewed
      if (targetSubmission.status !== 'submitted') {
        // Convert legacy feedback format to structured format if needed
        let structuredFeedback: StructuredFeedback;
        
        if (targetSubmission.feedback && typeof targetSubmission.feedback === 'object') {
          if (Array.isArray(targetSubmission.feedback.strengths) && 
              Array.isArray(targetSubmission.feedback.improvements)) {
            // Convert legacy format to structured format
            structuredFeedback = {
              overall: targetSubmission.feedback.overall || '',
              strengths: targetSubmission.feedback.strengths.map((content: string, index: number) => ({
                id: `strength-${index}`,
                content,
                type: 'strength'
              })),
              improvements: targetSubmission.feedback.improvements.map((content: string, index: number) => ({
                id: `improvement-${index}`,
                content,
                type: 'improvement'
              })),
              specificComments: targetSubmission.feedback.specificComments || [],
              score: targetSubmission.score || 0,
              recommendation: targetSubmission.feedback.recommendation || 'consider'
            };
          } else {
            // Already in structured format
            structuredFeedback = targetSubmission.feedback as StructuredFeedback;
          }
        } else {
          // Initialize empty structured feedback
          structuredFeedback = {
            overall: '',
            strengths: [],
            improvements: [],
            specificComments: [],
            score: targetSubmission.score || 0,
            recommendation: 'consider'
          };
        }
        
        setReviewData({
          status: targetSubmission.status,
          score: targetSubmission.score?.toString() || '',
          feedback: structuredFeedback
        });
      }
    } catch (error) {
      console.error('Failed to load submission:', error);
      setError('Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setIsSaving(true);
      setError('');

      if (!reviewData.status || reviewData.status === 'under_review') {
        setError('Please select a review status');
        return;
      }

      if (reviewData.status === 'passed' && (!reviewData.score || parseInt(reviewData.score) < (quest?.passing_score || 80))) {
        setError(`Score must be at least ${quest?.passing_score || 80}% to pass`);
        return;
      }

      // Update score in feedback object
      const updatedFeedback = {
        ...reviewData.feedback,
        score: parseInt(reviewData.score) || 0
      };

      const review = {
        status: reviewData.status,
        score: reviewData.score ? parseInt(reviewData.score) : null,
        feedback: updatedFeedback
      };

      await questService.reviewSubmission(submissionId!, review);
      navigate('/submissions');
    } catch (error: any) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setIsSaving(false);
    }
  };

  const addFeedbackItem = (type: 'strength' | 'improvement' | 'specific') => {
    const newItem: FeedbackItem = {
      id: `${type}-${Date.now()}`,
      content: '',
      type,
      category: type === 'specific' ? 'code' : undefined,
      severity: type === 'improvement' ? 'moderate' : undefined,
      impact: type === 'improvement' ? 'medium' : undefined
    };
    
    setReviewData(prev => {
      const updatedFeedback = { ...prev.feedback };
      
      if (type === 'strength') {
        updatedFeedback.strengths = [...updatedFeedback.strengths, newItem];
      } else if (type === 'improvement') {
        updatedFeedback.improvements = [...updatedFeedback.improvements, newItem];
      } else if (type === 'specific') {
        updatedFeedback.specificComments = [...updatedFeedback.specificComments, newItem];
      }
      
      return {
        ...prev,
        feedback: updatedFeedback
      };
    });
  };

  const updateFeedbackItem = (id: string, updates: Partial<FeedbackItem>) => {
    setReviewData(prev => {
      const updatedFeedback = { ...prev.feedback };
      
      // Find and update the item in the appropriate array
      ['strengths', 'improvements', 'specificComments'].forEach((key) => {
        const arrayKey = key as keyof StructuredFeedback;
        if (Array.isArray(updatedFeedback[arrayKey])) {
          updatedFeedback[arrayKey] = (updatedFeedback[arrayKey] as FeedbackItem[]).map(item => 
            item.id === id ? { ...item, ...updates } : item
          );
        }
      });
      
      return {
        ...prev,
        feedback: updatedFeedback
      };
    });
  };

  const removeFeedbackItem = (id: string) => {
    setReviewData(prev => {
      const updatedFeedback = { ...prev.feedback };
      
      // Remove the item from the appropriate array
      ['strengths', 'improvements', 'specificComments'].forEach((key) => {
        const arrayKey = key as keyof StructuredFeedback;
        if (Array.isArray(updatedFeedback[arrayKey])) {
          updatedFeedback[arrayKey] = (updatedFeedback[arrayKey] as FeedbackItem[]).filter(item => 
            item.id !== id
          );
        }
      });
      
      return {
        ...prev,
        feedback: updatedFeedback
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/submissions')}>
            Back to Submissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/submissions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Submission</h1>
            <p className="text-gray-600 mt-2">
              {quest?.title} - Attempt #{submission?.attempt_number}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            submission?.status === 'passed' ? 'bg-green-100 text-green-800' :
            submission?.status === 'failed' ? 'bg-red-100 text-red-800' :
            submission?.status === 'needs_revision' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {submission?.status === 'passed' && <CheckCircle className="h-4 w-4 mr-1" />}
            {submission?.status === 'failed' && <XCircle className="h-4 w-4 mr-1" />}
            {submission?.status === 'needs_revision' && <AlertTriangle className="h-4 w-4 mr-1" />}
            {submission?.status === 'submitted' && <Clock className="h-4 w-4 mr-1" />}
            {submission?.status === 'under_review' && <RefreshCw className="h-4 w-4 mr-1" />}
            {submission?.status?.replace('_', ' ').charAt(0).toUpperCase() + submission?.status?.slice(1).replace('_', ' ')}
          </span>
          
          <Button onClick={handleSubmitReview} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Submit Review
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 mb-8 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'feedback', label: 'Detailed Feedback', icon: MessageSquare },
          { id: 'specific', label: 'Specific Comments', icon: Target }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Submission Details */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Quest Info */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Quest Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{quest?.title}</h4>
                      <p className="text-gray-600 text-sm mb-4">{quest?.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          {quest?.difficulty}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {quest?.estimated_time}m
                        </span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Skills Assessed</h5>
                      <div className="flex flex-wrap gap-2">
                        {quest?.skills_assessed?.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Content */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Candidate Submission</h3>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {typeof submission?.submission_content === 'string' 
                        ? submission.submission_content 
                        : JSON.stringify(submission?.submission_content, null, 2)}
                    </pre>
                  </div>
                  
                  {submission?.time_spent && (
                    <div className="mt-4 text-sm text-gray-600">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Time spent: {Math.round(submission.time_spent / 60)} minutes
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Previous Feedback (if exists) */}
              {submission?.feedback && submission.status !== 'submitted' && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Previous Review</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {submission.feedback.overall && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Overall Feedback</h5>
                          <p className="text-gray-700">{submission.feedback.overall}</p>
                        </div>
                      )}
                      
                      {submission.feedback.strengths?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Strengths</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {Array.isArray(submission.feedback.strengths) 
                              ? submission.feedback.strengths.map((strength: any, index: number) => (
                                <li key={index} className="text-gray-700">
                                  {typeof strength === 'string' ? strength : strength.content}
                                </li>
                              ))
                              : null
                            }
                          </ul>
                        </div>
                      )}
                      
                      {submission.feedback.improvements?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Areas for Improvement</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {Array.isArray(submission.feedback.improvements) 
                              ? submission.feedback.improvements.map((improvement: any, index: number) => (
                                <li key={index} className="text-gray-700">
                                  {typeof improvement === 'string' ? improvement : improvement.content}
                                </li>
                              ))
                              : null
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === 'feedback' && (
            <>
              {/* Overall Feedback */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Overall Feedback</h3>
                </CardHeader>
                <CardContent>
                  <Textarea
                    label="Overall Assessment"
                    value={reviewData.feedback.overall}
                    onChange={(e) => setReviewData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback, overall: e.target.value }
                    }))}
                    placeholder="Provide an overall assessment of the submission..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                      Strengths
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => addFeedbackItem('strength')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Strength
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewData.feedback.strengths.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No strengths added yet. Click "Add Strength" to highlight positive aspects of the submission.
                      </p>
                    ) : (
                      reviewData.feedback.strengths.map((item) => (
                        <div key={item.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <Textarea
                                value={item.content}
                                onChange={(e) => updateFeedbackItem(item.id, { content: e.target.value })}
                                placeholder="Describe a strength or positive aspect..."
                                className="bg-white"
                              />
                              <div className="flex items-center mt-2 space-x-2">
                                <select
                                  value={item.relatedSkill || ''}
                                  onChange={(e) => updateFeedbackItem(item.id, { relatedSkill: e.target.value })}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="">Related skill (optional)</option>
                                  {quest?.skills_assessed?.map((skill: string, index: number) => (
                                    <option key={index} value={skill}>{skill}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFeedbackItem(item.id)}
                              className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                      Areas for Improvement
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => addFeedbackItem('improvement')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Improvement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewData.feedback.improvements.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No improvements added yet. Click "Add Improvement" to suggest areas for growth.
                      </p>
                    ) : (
                      reviewData.feedback.improvements.map((item) => (
                        <div key={item.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <Textarea
                                value={item.content}
                                onChange={(e) => updateFeedbackItem(item.id, { content: e.target.value })}
                                placeholder="Suggest an area for improvement..."
                                className="bg-white"
                              />
                              <div className="flex flex-wrap items-center mt-2 gap-2">
                                <select
                                  value={item.severity || 'moderate'}
                                  onChange={(e) => updateFeedbackItem(item.id, { severity: e.target.value as any })}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="minor">Minor issue</option>
                                  <option value="moderate">Moderate issue</option>
                                  <option value="major">Major issue</option>
                                </select>
                                
                                <select
                                  value={item.impact || 'medium'}
                                  onChange={(e) => updateFeedbackItem(item.id, { impact: e.target.value as any })}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="low">Low impact</option>
                                  <option value="medium">Medium impact</option>
                                  <option value="high">High impact</option>
                                </select>
                                
                                <select
                                  value={item.relatedSkill || ''}
                                  onChange={(e) => updateFeedbackItem(item.id, { relatedSkill: e.target.value })}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="">Related skill (optional)</option>
                                  {quest?.skills_assessed?.map((skill: string, index: number) => (
                                    <option key={index} value={skill}>{skill}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFeedbackItem(item.id)}
                              className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'specific' && (
            <>
              {/* Specific Comments */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Specific Comments
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => addFeedbackItem('specific')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Comment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!reviewData.feedback.specificComments || reviewData.feedback.specificComments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No specific comments added yet. Click "Add Comment" to provide targeted feedback on specific parts of the submission.
                      </p>
                    ) : (
                      reviewData.feedback.specificComments.map((item) => (
                        <div key={item.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <Textarea
                                value={item.content}
                                onChange={(e) => updateFeedbackItem(item.id, { content: e.target.value })}
                                placeholder="Comment on a specific part of the submission..."
                                className="bg-white"
                              />
                              <div className="flex flex-wrap items-center mt-2 gap-2">
                                <select
                                  value={item.category || 'code'}
                                  onChange={(e) => updateFeedbackItem(item.id, { category: e.target.value })}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="code">Code</option>
                                  <option value="logic">Logic</option>
                                  <option value="design">Design</option>
                                  <option value="documentation">Documentation</option>
                                  <option value="performance">Performance</option>
                                </select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFeedbackItem(item.id)}
                              className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Private Notes */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Private Notes (Not Shared with Candidate)</h3>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={reviewData.feedback.privateNotes || ''}
                    onChange={(e) => setReviewData(prev => ({
                      ...prev,
                      feedback: { ...prev.feedback, privateNotes: e.target.value }
                    }))}
                    placeholder="Add private notes for your reference (not visible to the candidate)..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Review Panel */}
        <div className="space-y-6">
          {/* Candidate Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Candidate Information</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Candidate ID: {submission?.user_id?.slice(-8)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Submitted: {new Date(submission?.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Attempt: #{submission?.attempt_number}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Submit Review</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Status
                </label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="under_review">Under Review</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="needs_revision">Needs Revision</option>
                </select>
              </div>

              <Input
                label="Score (0-100)"
                type="number"
                value={reviewData.score}
                onChange={(e) => setReviewData(prev => ({ ...prev, score: e.target.value }))}
                min="0"
                max="100"
                helperText={`Passing score: ${quest?.passing_score || 80}%`}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendation
                </label>
                <select
                  value={reviewData.feedback.recommendation}
                  onChange={(e) => setReviewData(prev => ({
                    ...prev,
                    feedback: { ...prev.feedback, recommendation: e.target.value as any }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hire">Hire - Excellent candidate</option>
                  <option value="consider">Consider - Good potential</option>
                  <option value="pass">Pass - Not a good fit</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Feedback Summary</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    reviewData.status === 'passed' ? 'bg-green-100 text-green-800' :
                    reviewData.status === 'failed' ? 'bg-red-100 text-red-800' :
                    reviewData.status === 'needs_revision' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {reviewData.status === 'passed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {reviewData.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                    {reviewData.status === 'needs_revision' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {reviewData.status === 'under_review' && <RefreshCw className="h-3 w-3 mr-1" />}
                    {reviewData.status.replace('_', ' ').charAt(0).toUpperCase() + reviewData.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">{reviewData.score || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Strengths:</span>
                    <span className="font-medium">{reviewData.feedback.strengths.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Improvements:</span>
                    <span className="font-medium">{reviewData.feedback.improvements.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Specific Comments:</span>
                    <span className="font-medium">{reviewData.feedback.specificComments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Feedback Templates</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900 mb-1">Strengths</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addFeedbackItem('strength')}
                    className="justify-start text-left"
                  >
                    <Zap className="h-3 w-3 mr-1 text-green-600" />
                    <span className="truncate">Clean code</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addFeedbackItem('strength')}
                    className="justify-start text-left"
                  >
                    <Zap className="h-3 w-3 mr-1 text-green-600" />
                    <span className="truncate">Good approach</span>
                  </Button>
                </div>

                <div className="text-sm font-medium text-gray-900 mb-1 mt-3">Improvements</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addFeedbackItem('improvement')}
                    className="justify-start text-left"
                  >
                    <Lightbulb className="h-3 w-3 mr-1 text-yellow-600" />
                    <span className="truncate">Optimize performance</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addFeedbackItem('improvement')}
                    className="justify-start text-left"
                  >
                    <Lightbulb className="h-3 w-3 mr-1 text-yellow-600" />
                    <span className="truncate">Add error handling</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}