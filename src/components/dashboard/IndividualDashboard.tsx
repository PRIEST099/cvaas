import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Trophy, Eye, Share2, TrendingUp, Code, X, Bell, Mail, Calendar, Clock } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { cvService } from '../../services/cvService';
import { questService } from '../../services/questService';
import { talentService } from '../../services/talentService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { EphemeralLinksManager } from '../privacy/EphemeralLinksManager';
import { useNavigate } from 'react-router-dom';

export function IndividualDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cvs, setCVs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEphemeralLinks, setShowEphemeralLinks] = useState(false);
  const [selectedCvForLinks, setSelectedCvForLinks] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [cvsData, submissionsData, badgesData, invitationsData] = await Promise.all([
        cvService.getCVs(),
        questService.getSubmissions(),
        questService.getUserBadges(),
        talentService.getInvitations({ status: 'pending' })
      ]);
      
      setCVs(cvsData);
      setSubmissions(submissionsData);
      setBadges(badgesData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareCV = (cv: any) => {
    setSelectedCvForLinks(cv);
    setShowEphemeralLinks(true);
  };

  const handleWidgetCV = (cv: any) => {
    navigate(`/cvs/${cv.id}/widget`);
  };

  const handleRespondToInvitation = async (invitationId: string, status: 'accepted' | 'declined', message?: string) => {
    try {
      await talentService.respondToInvitation(invitationId, { status, message });
      // Refresh invitations
      const updatedInvitations = await talentService.getInvitations({ status: 'pending' });
      setInvitations(updatedInvitations);
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate total views from all CVs (including recruiter views)
  const totalViews = cvs.reduce((total, cv) => {
    const publicViews = cv.metadata?.totalViews || cv.metadata?.views || 0;
    const recruiterViews = cv.metadata?.recruiterViews || 0;
    return total + publicViews + recruiterViews;
  }, 0);

  const stats = {
    cvs: cvs.length,
    questsCompleted: submissions.filter(s => s.status === 'passed').length,
    profileViews: totalViews,
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

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <h3 className="font-semibold flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Pending Invitations ({invitations.length})
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitations.slice(0, 3).map((invitation: any) => (
              <div key={invitation.id} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">
                        Invitation from {invitation.recruiters?.company_name || 'a recruiter'}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 mb-3">{invitation.message}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Received {new Date(invitation.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleRespondToInvitation(invitation.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRespondToInvitation(invitation.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {invitations.length > 3 && (
              <Button variant="outline" className="w-full">
                View All Invitations
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
            {cvs.slice(0, 3).map((cv) => {
              const publicViews = cv.metadata?.totalViews || cv.metadata?.views || 0;
              const recruiterViews = cv.metadata?.recruiterViews || 0;
              const totalCVViews = publicViews + recruiterViews;
              const downloads = cv.metadata?.downloadCount || cv.metadata?.downloads || 0;
              const shares = cv.metadata?.shareCount || cv.metadata?.shares || 0;
              
              return (
                <div key={cv.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{cv.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {totalCVViews} views
                        {recruiterViews > 0 && (
                          <span className="ml-1 text-blue-600">({recruiterViews} recruiter)</span>
                        )}
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleShareCV(cv)}
                      title="Share CV"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleWidgetCV(cv)}
                      title="CV Widget"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Link to={`/cvs/${cv.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
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
              <Link 
                key={submission.id} 
                to={`/my-submissions/${submission.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {submission.quests?.title || 'Quest Submission'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {submission.quests?.category && (
                        <span className="capitalize">{submission.quests.category}</span>
                      )}
                      {submission.quests?.difficulty && (
                        <span className="ml-2 capitalize">• {submission.quests.difficulty}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
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
                      {submission.status.replace('_', ' ').charAt(0).toUpperCase() + submission.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </Link>
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

      {/* Ephemeral Links Modal */}
      {showEphemeralLinks && selectedCvForLinks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Share {selectedCvForLinks.title}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEphemeralLinks(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <EphemeralLinksManager cvId={selectedCvForLinks.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}