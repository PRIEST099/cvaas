import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Eye, EyeOff, Building, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as 'candidate' | 'recruiter') || 'candidate';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Force role to candidate if recruiter is initially set from URL or elsewhere
  useEffect(() => {
    if (formData.role === 'recruiter') {
      setFormData(prev => ({ ...prev, role: 'candidate' }));
    }
  }, []);

  useEffect(() => {
    document.title = 'CVaaS | Create Account';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Disable recruiter registration
    if (formData.role === 'recruiter') {
      setError('Recruiter registration is coming soon!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'recruiter' && !formData.companyName.trim()) {
      setError('Company name is required for recruiter accounts');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        companyName: formData.companyName,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 sm:mb-6">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">CVaaS</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Join thousands of professionals</p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Sign Up</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Account Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    disabled
                    className={`p-4 border rounded-lg text-left transition-colors cursor-not-allowed opacity-50 ${
                      formData.role === 'recruiter'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300'
                    }`}
                    onClick={() => {}}
                  >
                    <Building className="h-6 w-6 mb-2" />
                    <div className="font-medium">Recruiter</div>
                    <div className="text-sm text-gray-500">Find talent</div>
                    <div className="mt-1 text-xs font-semibold text-orange-500">Coming Soon</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <Input
                label="Email address"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
                placeholder="john@example.com"
              />

              {/* Company Name shows only if role is recruiter (but recruiter disabled anyway) */}
              {formData.role === 'recruiter' && (
                <Input
                  label="Company name"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  required
                  placeholder="Acme Inc."
                />
              )}

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  required
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Input
                label="Confirm password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                required
                placeholder="Confirm your password"
              />

              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
