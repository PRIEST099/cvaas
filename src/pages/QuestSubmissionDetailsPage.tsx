import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Target,
  Star,
  BookOpen
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function QuestSubmissionDetailsPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [quest, setQuest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (submissionId && user) {
      loadSubmissionDetails();
    }
  }, [submissionId, user]);

  const loadSubmissionDetails = async () => {
    try {
      setIsLoading(true);
      // Get user's submissions and find the specific one
      const submissions = await questService.getSubmissions({ userId: user?.id });
      const targetSubmission = submissions.find(s => s.id === submissionId);
      
      if (!targetSubmission) {
        setError('Submission not found or you do not have permission to view it');
        return;
      }

      setSubmission(targetSubmission);
      
      // Load the quest details
      const questData = await questService.getQuest(targetSubmission.quest_id);
      setQuest(questData);
    } catch (error) {
      console.error('Failed to load submission details:', error);
      setError('Failed to load submission details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'needs_revision': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'under_review': return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_revision': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Submission not found'}</p>
          <Button onClick={() => navigate('/challenges')}>
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/challenges')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submission Details</h1>
            <p className="text-gray-600 mt-2">
              {quest?.title} - Attempt #{submission?.attempt_number}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission?.status)}`}>
            {getStatusIcon(submission?.status)}
            <span className="ml-2">
              {submission?.status?.replace('_', ' ').charAt(0).toUpperCase() + submission?.status?.slice(1).replace('_', ' ')}
            </span>
          </span>
          
          {submission?.score && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Award className="h-4 w-4 mr-1" />
              Score: {submission.score}%
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quest Information */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Quest Information
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{quest?.title}</h4>
                  <p className="text-gray-600 text-sm">{quest?.description}</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Difficulty: </span>
                    <span className="font-medium ml-1 capitalize">{quest?.difficulty}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Category: </span>
                    <span className="font-medium ml-1 capitalize">{quest?.category}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Est. Time: </span>
                    <span className="font-medium ml-1">{quest?.estimated_time || 'No limit'}m</span>
                  </div>
                </div>

                {quest?.skills_assessed && quest.skills_assessed.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Skills Assessed</h5>
                    <div className="flex flex-wrap gap-2">
                      {quest.skills_assessed.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Your Submission */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Your Submission</h3>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {typeof submission?.submission_content === 'string' 
                    ? submission.submission_content 
                    : submission?.submission_content?.solution || JSON.stringify(submission?.submission_content, null, 2)}
                </pre>
              </div>
              
              {submission?.submission_content?.notes && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Additional Notes</h5>
                  <p className="text-gray-700 text-sm">{submission.submission_content.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          {submission?.feedback && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Reviewer Feedback</h3>
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
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Strengths
                      </h5>
                      <ul className="list-disc list-inside space-y-1">
                        {submission.feedback.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-gray-700">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {submission.feedback.improvements?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                        Areas for Improvement
                      </h5>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Submission Summary */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Submission Summary</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission?.status)}`}>
                    {getStatusIcon(submission?.status)}
                    <span className="ml-1">
                      {submission?.status?.replace('_', ' ').charAt(0).toUpperCase() + submission?.status?.slice(1).replace('_', ' ')}
                    </span>
                  </span>
                </div>
                
                {submission?.score && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="font-medium">{submission.score}%</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Attempt</span>
                  <span className="font-medium">#{submission?.attempt_number}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Submitted</span>
                  <span className="font-medium text-sm">
                    {new Date(submission?.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                
                {submission?.time_spent && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Spent</span>
                    <span className="font-medium">{Math.round(submission.time_spent / 60)}m</span>
                  </div>
                )}
                
                {submission?.reviewed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reviewed</span>
                    <span className="font-medium text-sm">
                      {new Date(submission.reviewed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quest Requirements */}
          {quest?.passing_score && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Quest Requirements</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Passing Score</span>
                    <span className="font-medium">{quest.passing_score}%</span>
                  </div>
                  
                  {submission?.score && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Your Score</span>
                        <span className={`font-medium ${
                          submission.score >= quest.passing_score ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submission.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            submission.score >= quest.passing_score ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(submission.score, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/challenges')}
                >
                  Browse More Challenges
                </Button>
                
                {(submission?.status === 'failed' || submission?.status === 'needs_revision') && quest?.is_active && (
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/challenges/${quest.id}/submit`)}
                  >
                    Retake Challenge
                  </Button>
                )}
                
                {submission?.status === 'passed' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/my-badges')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    View My Badges
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}