import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Briefcase, Zap, Shield, Globe, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              The Future of
              <span className="block text-blue-200 mt-2">CV Management</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed px-4">
              Connect talent with opportunity through dynamic CVs, skill-based quests, 
              and intelligent matching. Built for the modern workforce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                <Link to="/register?role=candidate" className="flex items-center justify-center">
                  For Individuals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" className="bg-blue-500 hover:bg-blue-400 w-full sm:w-auto">
                <Link to="/register?role=recruiter" className="flex items-center justify-center">
                  For Businesses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Two Platforms, One Vision
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Whether you're showcasing your skills or discovering talent, 
              our platform adapts to your needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* For Individuals */}
            <Card className="p-6 sm:p-8 border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">For Individuals</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Create dynamic, interactive CVs that stand out</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Share with a public link and live embeds</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <BarChart3 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Complete skill quests to prove your abilities</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Get discovered by top companies anonymously</span>
                  </li>
                </ul>
                <Button className="w-full">
                  <Link to="/register?role=candidate">
                    Start Building Your CV
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* For Businesses */}
            <Card className="p-6 sm:p-8 border-2 border-purple-100 hover:border-purple-200 transition-colors">
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">For Businesses</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Create skill-based quests to assess candidates</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Discover talent through anonymous browsing</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <BarChart3 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Manage hiring projects with team collaboration</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Integrate with your existing ATS workflow</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link to="/register?role=recruiter">
                    Start Hiring Smarter
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">10K+</div>
              <div className="text-sm sm:text-base text-gray-600">Active CVs</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm sm:text-base text-gray-600">Companies</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">2K+</div>
              <div className="text-sm sm:text-base text-gray-600">Skill Quests</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">95%</div>
              <div className="text-sm sm:text-base text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your Career Journey?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 leading-relaxed">
            Join thousands of professionals and companies already using CVaaS 
            to connect, grow, and succeed.
          </p>
          <div className="mb-6 sm:mb-8">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-white">
              <Link to="/register" className="flex items-center">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="text-xs sm:text-sm text-blue-200 opacity-80">
            Built with ⚡ <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Bolt</a> - The AI-powered full-stack development platform
          </div>
        </div>
      </section>
    </div>
  );
}