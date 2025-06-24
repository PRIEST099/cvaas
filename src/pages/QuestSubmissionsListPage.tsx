import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  User,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import { questService } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function QuestSubmissionsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const questId = searchParams.get('questId');
  
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuest, setSelectedQuest] = useState(questId || 'all');

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Failed' },
    { value: 'needs_revision', label: 'Needs Revision' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, selectedStatus, selectedQuest]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load submissions for this recruiter and their quests
      const [submissionsData, questsData] = await Promise.all([
        questService.getSubmissions({ forRecruiter: true }),
        questService.getQuests(user?.id)
      ]);
      
      setSubmissions(submissionsData);
      setQuests(questsData);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Quest filter
    if (selectedQuest !== 'all') {
      filtered = filtered.filter(submission => submission.quest_id === selectedQuest);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(submission => submission.status === selectedStatus);
    }

    // Search filter (by quest title or submission content)
    if (searchTerm) {
      filtered = filtered.filter(submission => {
        const quest = quests.find(q => q.id === submission.quest_id);
        const questTitle = quest?.title?.toLowerCase() || '';
        const submissionContent = typeof submission.submission_content === 'string' 
          ? submission.submission_content.toLowerCase()
          : JSON.stringify(submission.submission_content).toLowerCase();
        
        return questTitle.includes(searchTerm.toLowerCase()) ||
               submissionContent.includes(searchTerm.toLowerCase());
      });
    }

    // Sort by submission date (most recent first)
    filtered.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

    setFilteredSubmissions(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'needs_revision': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'under_review': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length,
    passed: submissions.filter(s => s.status === 'passed').length,
    avgScore: submissions.filter(s => s.score).length > 0 
      ? Math.round(submissions.filter(s => s.score).reduce((sum, s) => sum + s.score, 0) / submissions.filter(s => s.score).length)
      : 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quest Submissions</h1>
          <p className="text-gray-600 mt-2">Review and evaluate candidate submissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.passed}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.avgScore}%</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold">Filter Submissions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by quest or submission content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={selectedQuest}
              onChange={(e) => setSelectedQuest(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Quests</option>
              {quests.map((quest) => (
                <option key={quest.id} value={quest.id}>
                  {quest.title}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions.length > 0 ? (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const quest = quests.find(q => q.id === submission.quest_id);
            return (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {quest?.title || 'Unknown Quest'}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1">
                            {submission.status.replace('_', ' ').charAt(0).toUpperCase() + submission.status.slice(1).replace('_', ' ')}
                          </span>
                        </span>
                        {submission.score && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Award className="h-3 w-3 mr-1" />
                            {submission.score}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Candidate #{submission.user_id.slice(-8)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Attempt #{submission.attempt_number}
                        </div>
                        {submission.time_spent && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {Math.round(submission.time_spent / 60)}m
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {typeof submission.submission_content === 'string' 
                            ? submission.submission_content.substring(0, 200) + (submission.submission_content.length > 200 ? '...' : '')
                            : JSON.stringify(submission.submission_content).substring(0, 200) + '...'
                          }
                        </p>
                      </div>

                      {submission.feedback?.overall && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Previous feedback:</strong> {submission.feedback.overall.substring(0, 100)}
                            {submission.feedback.overall.length > 100 && '...'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/submissions/${submission.id}/review`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {submission.status === 'submitted' ? 'Review' : 'View Review'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          {submissions.length === 0 ? (
            <>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-600 mb-6">
                Submissions will appear here when candidates complete your quests.
              </p>
              <Button onClick={() => navigate('/recruiter/quests')}>
                View My Quests
              </Button>
            </>
          ) : (
            <>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more submissions.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedQuest('all');
                setSelectedStatus('all');
              }}>
                Clear Filters
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}