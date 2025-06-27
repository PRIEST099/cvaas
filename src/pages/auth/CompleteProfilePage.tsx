import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, User, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

export function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: 'candidate' as 'candidate' | 'recruiter',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { supabaseUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'CVaaS | Complete Profile';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    if (formData.role === 'recruiter' && !formData.companyName.trim()) {
      setError('Company name is required for recruiter accounts');
      return;
    }

    setIsLoading(true);

    try {
      // Create the profile in the users table
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        company_name: formData.companyName || null,
        email: supabaseUser?.email || '',
        id: supabaseUser?.id || ''
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 mb-6">
            <FileText className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CVaaS</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600">We need a few more details to set up your account</p>
        </div>

        {/* Profile Completion Form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Account Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.role === 'candidate'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateFormData('role', 'candidate')}
                  >
                    <User className="h-6 w-6 mb-2" />
                    <div className="font-medium">Candidate</div>
                    <div className="text-sm text-gray-500">Build your CV</div>
                  </button>
                  <button
                    type="button"
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.role === 'recruiter'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => updateFormData('role', 'recruiter')}
                  >
                    <Building className="h-6 w-6 mb-2" />
                    <div className="font-medium">Recruiter</div>
                    <div className="text-sm text-gray-500">Find talent</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  required
                  placeholder="John"
                />
                <Input
                  label="Last name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  required
                  placeholder="Doe"
                />
              </div>

              {formData.role === 'recruiter' && (
                <Input
                  label="Company name"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  required
                  placeholder="Acme Inc."
                />
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Complete Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}