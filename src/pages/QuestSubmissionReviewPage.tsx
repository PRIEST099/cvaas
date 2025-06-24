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
  Download
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function QuestSubmissionReviewPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [quest, setQuest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [reviewData, setReviewData] = useState({
    status: 'under_review' as 'passed' | 'failed' | 'needs_revision' | 'under_review',
    score: '',
    feedback: {
      overall: '',
      strengths: [],
      improvements: [],
      specific_comments: []
    }
  });

  useEffect(() => {
    if (submissionId) {
      loadSubmission();
    }
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      setIsLoading(true);
      // Get all submissions and find the specific one
      const submissions = await questService.getSubmissions();
      const targetSubmission = submissions.find(s => s.id === submissionId);
      
      if (!targetSubmission) {
        setError('Submission not found');
        return;
      }

      setSubmission(targetSubmission);
      
      // Load the quest details
      const questData = await questService.getQuest(targetSubmission.quest_id);
      setQuest(questData);

      // Pre-populate review data if already reviewed
      if (targetSubmission.status !== 'submitted') {
        setReviewData({
          status: targetSubmission.status,
          score: targetSubmission.score?.toString() || '',
          feedback: targetSubmission.feedback || {
            overall: '',
            strengths: [],
            improvements: [],
            specific_comments: []
          }
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

      const review = {
        status: reviewData.status,
        score: reviewData.score ? parseInt(reviewData.score) : null,
        feedback: reviewData.feedback
      };

      await questService.reviewSubmission(submissionId!, review);
      navigate('/submissions');
    } catch (error: any) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setIsSaving(false);
    }
  };

  const addStrength = () => {
    setReviewData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        strengths: [...prev.feedback.strengths, '']
      }
    }));
  };

  const updateStrength = (index: number, value: string) => {
    setReviewData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        strengths: prev.feedback.strengths.map((s, i) => i === index ? value : s)
      }
    }));
  };

  const removeStrength = (index: number) => {
    setReviewData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        strengths: prev.feedback.strengths.filter((_, i) => i !== index)
      }
    }));
  };

  const addImprovement = () => {
    setReviewData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        improvements: [...prev.feedback.improvements, '']
      }
    }));
  };

  const updateImprovement = (index: number, value: string) => {
    setReviewData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        improvements: prev.feedback.improvements.map((s, i) => i === index ? value : s)
      }
    }));
  };

  const removeImprovement = (index: number) => {
    setReviewData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        improvements: prev.feedback.improvements.filter((_, i) => i !== index)
      }
    }));
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Submission Details */}
        <div className="lg:col-span-2 space-y-6">
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
                        {submission.feedback.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-gray-700">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {submission.feedback.improvements?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Areas for Improvement</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {submission.feedback.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="text-gray-700">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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

              <Textarea
                label="Overall Feedback"
                value={reviewData.feedback.overall}
                onChange={(e) => setReviewData(prev => ({
                  ...prev,
                  feedback: { ...prev.feedback, overall: e.target.value }
                }))}
                placeholder="Provide overall feedback on the submission..."
                rows={4}
              />

              {/* Strengths */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Strengths
                  </label>
                  <Button size="sm" variant="outline" onClick={addStrength}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {reviewData.feedback.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={strength}
                        onChange={(e) => updateStrength(index, e.target.value)}
                        placeholder="What did the candidate do well?"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStrength(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Areas for Improvement
                  </label>
                  <Button size="sm" variant="outline" onClick={addImprovement}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {reviewData.feedback.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={improvement}
                        onChange={(e) => updateImprovement(index, e.target.value)}
                        placeholder="What could be improved?"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImprovement(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}