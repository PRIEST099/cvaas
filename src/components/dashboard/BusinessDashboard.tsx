import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Briefcase, Target, TrendingUp, Clock, CheckCircle, Send, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { questService } from '../../services/questService';
import { talentService } from '../../services/talentService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

export function BusinessDashboard() {
  const { user } = useAuth();
  const [quests, setQuests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [invitationStats, setInvitationStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    responseRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [questsData, submissionsData, invitationsData] = await Promise.all([
        questService.getQuests(user?.id),
        questService.getSubmissions({ forRecruiter: true }),
        talentService.getInvitations()
      ]);
      
      setQuests(questsData);
      setSubmissions(submissionsData);
      setInvitations(invitationsData);
      
      // Get invitation stats
      const stats = await talentService.getInvitationStats();
      setInvitationStats(stats);
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
    activeQuests: quests.filter(q => q.is_active).length,
    totalCandidates: submissions.length,
    questsCreated: quests.length,
    successfulHires: submissions.filter(s => s.status === 'passed').length,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-purple-100 text-lg">
          Manage your hiring projects and discover top talent.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.activeQuests}</div>
            <div className="text-sm text-gray-600">Active Quests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.questsCreated}</div>
            <div className="text-sm text-gray-600">Quests Created</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.successfulHires}</div>
            <div className="text-sm text-gray-600">Successful Reviews</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Quests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Quests</h2>
            <Button size="sm">
              <Link to="/challenges/new" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                New Quest
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {quests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{quest.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {quest.total_attempts} attempts
                    </span>
                    <span>Created {new Date(quest.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    quest.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {quest.is_active ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
            {quests.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quests yet</h3>
                <p className="text-gray-600 mb-4">Create your first quest to start evaluating candidates</p>
                <Button>
                  <Link to="/challenges/new">Create Quest</Link>
                </Button>
              </div>
            )}
            <Button variant="outline" className="w-full">
              <Link to="/recruiter/quests">View All Quests</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Invitations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Invitations</h2>
            <Button size="sm" variant="outline">
              <Link to="/talent">Find Candidates</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {invitations.length > 0 ? (
              <div className="space-y-4">
                {invitations.slice(0, 3).map((invitation: any) => (
                  <div key={invitation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium text-gray-900">
                            Invitation to {invitation.candidates?.first_name || 'Candidate'} {invitation.candidates?.last_name || invitation.candidateId.slice(-8)}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 mt-2">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Sent {new Date(invitation.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Invitations
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations yet</h3>
                <p className="text-gray-600 mb-4">Invite candidates to connect or complete quests</p>
                <Button>
                  <Link to="/talent">Find Candidates</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invitation Stats */}
      {invitationStats.total > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Invitation Statistics</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{invitationStats.total}</div>
                <div className="text-sm text-gray-600">Total Invitations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{invitationStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{invitationStats.accepted}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{Math.round(invitationStats.responseRate * 100)}%</div>
                <div className="text-sm text-gray-600">Response Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Link to="/talent" className="flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Browse Talent</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/challenges/new" className="flex flex-col items-center space-y-2">
                <Target className="h-6 w-6" />
                <span>Create Quest</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/syndication" className="flex flex-col items-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>Syndication</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}