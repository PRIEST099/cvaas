import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Building, 
  Award, 
  Star,
  Eye,
  Send,
  Bookmark,
  MoreVertical,
  Shield,
  Clock,
  Target,
  FileText,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';
import { talentService } from '../services/talentService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { SendInvitationModal } from '../components/invitations/SendInvitationModal';
import { EmbeddableCVRenderer } from '../components/cv/EmbeddableCVRenderer';
import { WidgetConfig } from '../types';

export function RecruiterCVViewPage() {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvitationModal, setShowInvitationModal] = useState(false);

  useEffect(() => {
    if (cvId && user?.role === 'recruiter') {
      loadCandidateProfile();
    }
  }, [cvId, user]);

  const loadCandidateProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await talentService.getAnonymizedCandidateCV(cvId!);
      setCandidateProfile(profile);
    } catch (error: any) {
      console.error('Failed to load candidate profile:', error);
      setError(error.message || 'Failed to load candidate profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitation = () => {
    // Only show invitation modal if we have a valid user_id
    if (candidateProfile?.user_id) {
      setShowInvitationModal(true);
    } else {
      console.error('Cannot send invitation: user_id not available');
      // You might want to show an error message to the user here
    }
  };

  // Configure widget settings to hide personal information
  const widgetConfig: WidgetConfig = {
    theme: 'light',
    size: 'medium',
    sections: ['personal_info', 'summary', 'education', 'experience', 'skills', 'projects'],
    showPhoto: false,
    showContact: false, // Hide contact information
    customCSS: '',
    autoUpdate: false
  };

  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">This feature is only available for recruiter accounts.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/talent')}>
            Back to Talent Discovery
          </Button>
        </div>
      </div>
    );
  }

  if (!candidateProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The candidate profile could not be found.</p>
          <Button onClick={() => navigate('/talent')}>
            Back to Talent Discovery
          </Button>
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
              <Button variant="ghost" onClick={() => navigate('/talent')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {candidateProfile.display_name}
                </h1>
                <p className="text-sm text-gray-600">
                  {candidateProfile.cv_title} • Anonymous Profile
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Bookmark className="h-4 w-4 mr-2" />
                Save to Pool
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSendInvitation}
                disabled={!candidateProfile?.user_id}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
              <Button variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Quick Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="font-semibold">Profile Overview</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {candidateProfile.display_name.charAt(candidateProfile.display_name.length - 1)}
                  </div>
                  <h4 className="font-medium text-gray-900">{candidateProfile.display_name}</h4>
                  <p className="text-sm text-gray-600">{candidateProfile.cv_title}</p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-medium">
                      {candidateProfile.metadata?.recruiterViews || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">
                      {new Date(candidateProfile.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {candidateProfile.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Quick Actions</h5>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={handleSendInvitation}
                      disabled={!candidateProfile?.user_id}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Add to Quest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - CV Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="font-semibold">Candidate CV</h3>
                <div className="text-sm text-gray-500">
                  <Eye className="h-4 w-4 inline mr-1" />
                  Anonymized View
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <EmbeddableCVRenderer 
                    cv={candidateProfile} 
                    widgetConfig={widgetConfig}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Send Invitation Modal */}
      {showInvitationModal && candidateProfile?.user_id && (
        <SendInvitationModal
          isOpen={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          candidateId={candidateProfile.user_id}
          cvId={candidateProfile.cv_id}
          candidateName={candidateProfile.display_name}
          cvTitle={candidateProfile.cv_title}
        />
      )}
    </div>
  );
}