import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Trophy, Eye, Share2, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cvService } from '../../services/cvService';
import { questService } from '../../services/questService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

export function IndividualDashboard() {
  const { user } = useAuth();
  const [cvs, setCVs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [cvsData, submissionsData, badgesData] = await Promise.all([
        cvService.getCVs(),
        questService.getSubmissions(),
        questService.getUserBadges()
      ]);
      
      setCVs(cvsData);
      setSubmissions(submissionsData);
      setBadges(badgesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    cvs: cvs.length,
    questsCompleted: submissions.filter(s => s.status === 'passed').length,
    profileViews: cvs.reduce((total, cv) => total + (cv.metadata?.totalViews || 0), 0),
    badges: badges.length,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-blue-100 text-lg">
          Ready to showcase your skills and discover new opportunities?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.cvs}</div>
            <div className="text-sm text-gray-600">Active CVs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.questsCompleted}</div>
            <div className="text-sm text-gray-600">Quests Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.profileViews}</div>
            <div className="text-sm text-gray-600">Profile Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.badges}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My CVs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">My CVs</h2>
            <Button size="sm">
              <Link to="/cvs" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                New CV
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {cvs.slice(0, 3).map((cv) => (
              <div key={cv.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{cv.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {cv.metadata?.totalViews || 0} views
                    </span>
                    <span>Updated {new Date(cv.updated_at).toLocaleDateString()}</span>
                    {cv.is_public && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Public
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Link to={`/cvs/${cv.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>
            ))}
            {cvs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No CVs yet</h3>
                <p className="text-gray-600 mb-4">Create your first CV to get started</p>
                <Button>
                  <Link to="/cvs">Create CV</Link>
                </Button>
              </div>
            )}
            <Button variant="outline" className="w-full">
              <Link to="/cvs">View All CVs</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Quest Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Quest Activity</h2>
            <Button size="sm" variant="outline">
              <Link to="/challenges">Browse Quests</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissions.slice(0, 3).map((submission) => (
              <div key={submission.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Quest Submission</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {submission.score && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Score: {submission.score}%
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      submission.status === 'passed' ? 'bg-green-100 text-green-800' :
                      submission.status === 'failed' ? 'bg-red-100 text-red-800' :
                      submission.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {submission.status.replace('_', ' ').charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quest activity</h3>
                <p className="text-gray-600 mb-4">Complete challenges to earn skill badges</p>
                <Button>
                  <Link to="/challenges">Start First Quest</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}