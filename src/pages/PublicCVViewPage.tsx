import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Eye, Lock, AlertCircle, FileText } from 'lucide-react';
import { syndicationService } from '../services/syndicationService';
import { CVPreview } from '../components/cv/CVPreview';
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
      } else if (result.error === 'Invalid password') {
        setRequiresPassword(true);
        setError('Invalid password. Please try again.');
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
      accessLink(password);
    }
  };

  const handleDownload = async () => {
    if (!accessToken || !linkInfo?.allowDownload) return;

    try {
      setIsDownloading(true);
      
      // Log the download
      await syndicationService.logEphemeralDownload(accessToken);
      
      // In a real implementation, this would generate and download a PDF
      console.log('Downloading CV as PDF...');
      
      // Placeholder: Create a simple text file for demonstration
      const cvText = `CV: ${cv.title}\n\nThis is a placeholder for the actual PDF download functionality.`;
      const blob = new Blob([cvText], { type: 'text/plain' });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Password Required</h2>
            <p className="text-gray-600 mt-2">This CV is password protected</p>
          </CardHeader>
          <CardContent>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-gray-600" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">{cv.title}</h1>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <Eye className="h-3 w-3 mr-1" />
                Shared CV
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {linkInfo?.allowDownload && (
                <Button
                  onClick={handleDownload}
                  isLoading={isDownloading}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
              
              <div className="text-sm text-gray-500">
                {linkInfo?.maxViews && (
                  <span>
                    {linkInfo.currentViews} / {linkInfo.maxViews} views
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CVPreview cv={cv} onClose={() => {}} />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              CVaaS
            </a>
            {' '}• Create your own professional CV
          </p>
        </div>
      </div>
    </div>
  );
}