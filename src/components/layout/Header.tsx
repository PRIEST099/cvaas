import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut, Settings, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">CVaaS</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
              {user.role === 'candidate' && (
                <>
                  <Link
                    to="/cvs"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    My CVs
                  </Link>
                  <Link
                    to="/challenges"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    Challenges
                  </Link>
                </>
              )}
              {user.role === 'recruiter' && (
                <>
                  <Link
                    to="/recruiter/quests"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    My Quests
                  </Link>
                  <Link
                    to="/talent"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    Talent
                  </Link>
                  <Link
                    to="/syndication"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    Syndication
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden xl:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role} Account
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/settings')}
                    className="p-2"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="p-2"
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
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                  size="sm"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role} Account
                    </p>
                  </div>

                  {/* Navigation Links */}
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>

                  {user.role === 'candidate' && (
                    <>
                      <Link
                        to="/cvs"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        My CVs
                      </Link>
                      <Link
                        to="/challenges"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Challenges
                      </Link>
                      <Link
                        to="/my-badges"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        My Badges
                      </Link>
                    </>
                  )}

                  {user.role === 'recruiter' && (
                    <>
                      <Link
                        to="/recruiter/quests"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        My Quests
                      </Link>
                      <Link
                        to="/talent"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Talent Discovery
                      </Link>
                      <Link
                        to="/submissions"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={closeMobileMenu}
                      >
                        Submissions
                      </Link>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/settings');
                        closeMobileMenu();
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/login');
                      closeMobileMenu();
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      navigate('/register');
                      closeMobileMenu();
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}