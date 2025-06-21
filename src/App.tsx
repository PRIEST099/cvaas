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

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cvs"
          element={
            <ProtectedRoute requiredRole="candidate">
              <CVListPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cvs/:cvId/edit"
          element={
            <ProtectedRoute requiredRole="candidate">
              <CVBuilder />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cvs/:cvId/widget"
          element={
            <ProtectedRoute requiredRole="candidate">
              <WidgetPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/talent"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <TalentDiscoveryPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/challenges"
          element={
            <ProtectedRoute>
              <ChallengesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/syndication"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <SyndicationPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/enterprise"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <EnterprisePage />
            </ProtectedRoute>
          }
        />
        
        {/* Placeholder routes for future pages */}
        <Route path="/quests" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><div className="p-8">Projects page coming soon...</div></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div className="p-8">Settings page coming soon...</div></ProtectedRoute>} />
      </Routes>
    </Layout>
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