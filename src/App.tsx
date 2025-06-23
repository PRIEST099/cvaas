import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CVListPage } from './pages/CVListPage';
import { CVBuilder } from './components/cv/CVBuilder';
import { TalentDiscoveryPage } from './pages/TalentDiscoveryPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { SyndicationPage } from './pages/SyndicationPage';
import { WidgetPage } from './pages/WidgetPage';
import { EnterprisePage } from './pages/EnterprisePage';
import { PublicCVViewPage } from './pages/PublicCVViewPage';
import { WidgetViewPage } from './pages/WidgetViewPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      
      {/* Public CV viewing via ephemeral links */}
      <Route path="/cv/ephemeral/:accessToken" element={<PublicCVViewPage />} />
      
      {/* Public widget view (no authentication required) */}
      <Route path="/widget/cv/:cvId" element={<WidgetViewPage />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/cvs"
        element={
          <ProtectedRoute requiredRole="candidate">
            <Layout>
              <CVListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/cvs/:cvId/edit"
        element={
          <ProtectedRoute requiredRole="candidate">
            <Layout>
              <CVBuilder />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/cvs/:cvId/widget"
        element={
          <ProtectedRoute requiredRole="candidate">
            <Layout>
              <WidgetPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/talent"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <Layout>
              <TalentDiscoveryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <Layout>
              <ChallengesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/syndication"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <Layout>
              <SyndicationPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/enterprise"
        element={
          <ProtectedRoute requiredRole="recruiter">
            <Layout>
              <EnterprisePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Placeholder routes for future pages */}
      <Route 
        path="/quests" 
        element={
          <ProtectedRoute>
            <Layout>
              <ChallengesPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">Projects page coming soon...</div>
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">Settings page coming soon...</div>
            </Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;