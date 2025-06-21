import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CVaaS</span>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              {user.accountType === 'individual' && (
                <>
                  <Link
                    to="/cvs"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    My CVs
                  </Link>
                  <Link
                    to="/quests"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Quests
                  </Link>
                </>
              )}
              {user.accountType === 'business' && (
                <>
                  <Link
                    to="/projects"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Projects
                  </Link>
                  <Link
                    to="/talent"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Talent
                  </Link>
                  <Link
                    to="/syndication"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Syndication
                  </Link>
                </>
              )}
              <Link
                to="/enterprise"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Enterprise
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.accountType} Account
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}