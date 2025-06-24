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
  Target
} from 'lucide-react';
import { talentService } from '../services/talentService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function RecruiterCVViewPage() {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  const renderSection = (section: any) => {
    switch (section.section_type) {
      case 'summary':
        return (
          <Card key={section.section_type}>
            <CardHeader>
              <h3 className="font-semibold">Professional Summary</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {section.content?.summary || 'No summary provided'}
              </p>
            </CardContent>
          </Card>
        );

      case 'personal_info':
        return (
          <Card key={section.section_type}>
            <CardHeader>
              <h3 className="font-semibold">Professional Information</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.content?.title && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{section.content.title}</span>
                  </div>
                )}
                {section.content?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{section.content.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
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
              <Button variant="outline">
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
                    <Button size="sm" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
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

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sections */}
            {candidateProfile.sections && candidateProfile.sections
              .filter((section: any) => section.is_visible)
              .map((section: any) => renderSection(section))}

            {/* Experience */}
            {candidateProfile.experience && candidateProfile.experience.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Professional Experience
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {candidateProfile.experience.map((exp: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{exp.position}</h4>
                            <p className="text-blue-600 font-medium">{exp.company}</p>
                            {exp.location && (
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {exp.location}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {' - '}
                            {exp.is_current ? 'Present' : 
                             (exp.end_date && new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
                            }
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                        {exp.skills_used && exp.skills_used.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {exp.skills_used.map((skill: string, skillIndex: number) => (
                              <span
                                key={skillIndex}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {candidateProfile.education && candidateProfile.education.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Education
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidateProfile.education.map((edu: any, index: number) => (
                      <div key={index} className="border-l-2 border-green-200 pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                            </h4>
                            <p className="text-green-600 font-medium">{edu.institution}</p>
                            {edu.gpa && (
                              <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>
                            )}
                          </div>
                          {(edu.start_date || edu.end_date) && (
                            <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {edu.start_date && new Date(edu.start_date).getFullYear()}
                              {edu.end_date && ` - ${new Date(edu.end_date).getFullYear()}`}
                              {edu.is_current && ' - Present'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {candidateProfile.skills && candidateProfile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Skills & Expertise
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidateProfile.skills.reduce((acc: any, skill: any) => {
                      const category = skill.category || 'General';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(skill);
                      return acc;
                    }, {}) && Object.entries(candidateProfile.skills.reduce((acc: any, skill: any) => {
                      const category = skill.category || 'General';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(skill);
                      return acc;
                    }, {})).map(([category, skills]: [string, any]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {skills.map((skill: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-900">{skill.name}</span>
                              {skill.proficiency_level && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${skill.proficiency_level}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600">{skill.proficiency_level}%</span>
                                </div>
                              )}
                              {skill.is_verified && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {candidateProfile.projects && candidateProfile.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Projects</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {candidateProfile.projects.map((project: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                        {project.description && (
                          <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech: string, techIndex: number) => (
                              <span
                                key={techIndex}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}