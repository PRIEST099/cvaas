import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Eye, Lock, AlertCircle, FileText, ExternalLink, Sparkles } from 'lucide-react';
import { syndicationService } from '../services/syndicationService';
import { EmbeddableCVRenderer } from '../components/cv/EmbeddableCVRenderer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export function PublicCVViewPage() {
  const { accessToken } = useParams<{ accessToken: string }>();
  const [cv, setCV] = useState<any>(null);
  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasAttemptedPassword, setHasAttemptedPassword] = useState(false);

  useEffect(() => {
    if (accessToken) {
      accessLink();
    }
  }, [accessToken]);

  const accessLink = async (passwordInput?: string) => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      setError('');

      const result = await syndicationService.accessEphemeralLink(accessToken, passwordInput);

      if (result.success && result.cv && result.link) {
        setCV(result.cv);
        setLinkInfo(result.link);
        setRequiresPassword(false);
        setHasAttemptedPassword(false);
      } else if (result.error === 'Password required' || result.error === 'Invalid password') {
        setRequiresPassword(true);
        
        if (result.error === 'Password required' && !hasAttemptedPassword) {
          // First time accessing a password-protected link - don't show error
          setError('');
        } else if (result.error === 'Invalid password' || hasAttemptedPassword) {
          // User entered wrong password or this is a retry
          setError('Invalid password. Please try again.');
          setHasAttemptedPassword(true);
        }
      } else {
        setError(result.error || 'Failed to access CV');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      setHasAttemptedPassword(true);
      accessLink(password);
    }
  };

  const generateCVContent = (cv: any) => {
    let content = `${cv.title}\n${'='.repeat(cv.title.length)}\n\n`;
    
    // Add personal info from sections
    const personalSection = cv.sections?.find((s: any) => s.section_type === 'personal_info');
    if (personalSection?.content) {
      content += `${personalSection.content.fullName || 'Name'}\n`;
      if (personalSection.content.title) content += `${personalSection.content.title}\n`;
      if (personalSection.content.email) content += `Email: ${personalSection.content.email}\n`;
      if (personalSection.content.phone) content += `Phone: ${personalSection.content.phone}\n`;
      if (personalSection.content.location) content += `Location: ${personalSection.content.location}\n`;
      content += '\n';
    }

    // Add summary
    const summarySection = cv.sections?.find((s: any) => s.section_type === 'summary');
    if (summarySection?.content?.summary) {
      content += `PROFESSIONAL SUMMARY\n${'-'.repeat(20)}\n${summarySection.content.summary}\n\n`;
    }

    // Add experience
    if (cv.experience && cv.experience.length > 0) {
      content += `EXPERIENCE\n${'-'.repeat(10)}\n`;
      cv.experience.forEach((exp: any) => {
        content += `${exp.position} at ${exp.company}\n`;
        if (exp.location) content += `Location: ${exp.location}\n`;
        if (exp.start_date) {
          content += `Duration: ${exp.start_date}`;
          if (exp.end_date) content += ` - ${exp.end_date}`;
          else if (exp.is_current) content += ` - Present`;
          content += '\n';
        }
        if (exp.description) content += `${exp.description}\n`;
        content += '\n';
      });
    }

    // Add education
    if (cv.education && cv.education.length > 0) {
      content += `EDUCATION\n${'-'.repeat(9)}\n`;
      cv.education.forEach((edu: any) => {
        content += `${edu.degree}`;
        if (edu.field_of_study) content += ` in ${edu.field_of_study}`;
        content += `\n${edu.institution}\n`;
        if (edu.start_date) {
          content += `${edu.start_date}`;
          if (edu.end_date) content += ` - ${edu.end_date}`;
          else if (edu.is_current) content += ` - Present`;
          content += '\n';
        }
        if (edu.gpa) content += `GPA: ${edu.gpa}\n`;
        content += '\n';
      });
    }

    // Add skills
    if (cv.skills && cv.skills.length > 0) {
      content += `SKILLS\n${'-'.repeat(6)}\n`;
      const skillsByCategory = cv.skills.reduce((acc: any, skill: any) => {
        const category = skill.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
      }, {});

      Object.entries(skillsByCategory).forEach(([category, skills]: [string, any]) => {
        content += `${category}: ${skills.join(', ')}\n`;
      });
      content += '\n';
    }

    // Add projects
    if (cv.projects && cv.projects.length > 0) {
      content += `PROJECTS\n${'-'.repeat(8)}\n`;
      cv.projects.forEach((project: any) => {
        content += `${project.title}\n`;
        if (project.description) content += `${project.description}\n`;
        if (project.technologies && project.technologies.length > 0) {
          content += `Technologies: ${project.technologies.join(', ')}\n`;
        }
        if (project.project_url) content += `URL: ${project.project_url}\n`;
        if (project.github_url) content += `GitHub: ${project.github_url}\n`;
        content += '\n';
      });
    }

    return content;
  };

  const handleDownload = async () => {
    if (!accessToken || !linkInfo?.allow_download) return;

    try {
      setIsDownloading(true);
      
      // Log the download
      await syndicationService.logEphemeralDownload(accessToken);
      
      // Generate and download CV content
      const cvContent = generateCVContent(cv);
      const blob = new Blob([cvContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.title || 'CV'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="mx-auto w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Password Required</h2>
            <p className="text-blue-100 mt-2">This CV is password protected</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}
              
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              
              <Button type="submit" className="w-full" disabled={!password.trim()}>
                Access CV
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="text-center p-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="text-center p-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Not Found</h2>
            <p className="text-gray-600 mb-6">The requested CV could not be found or is no longer available.</p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">CVaaS</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">{cv.title}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                <Eye className="h-4 w-4 mr-1" />
                Shared CV
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {linkInfo?.allow_download && (
                <Button
                  onClick={handleDownload}
                  isLoading={isDownloading}
                  variant="outline"
                  className="shadow-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                {linkInfo?.max_views ? (
                  <span>
                    {linkInfo.current_views} / {linkInfo.max_views} views
                  </span>
                ) : (
                  <span>{linkInfo?.current_views || 0} views</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 lg:p-12">
            <EmbeddableCVRenderer cv={cv} />
          </div>
        </div>
      </div>

      {/* Enhanced CTA Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">Powered by CVaaS</span>
            </div>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Create your own professional CV with our AI-powered platform. 
              Build dynamic CVs, complete skill challenges, and get discovered by top companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                className="bg-white text-blue-600 hover:bg-blue-50 border-white"
                onClick={() => window.open('/', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Your CV
              </Button>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white hover:bg-opacity-20"
                onClick={() => window.open('/register?role=recruiter', '_blank')}
              >
                For Recruiters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}