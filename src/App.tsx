import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CompleteProfilePage } from './pages/auth/CompleteProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { CVListPage } from './pages/CVListPage';
import { CVBuilder } from './components/cv/CVBuilder';
import { TalentDiscoveryPage } from './pages/TalentDiscoveryPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { SyndicationPage } from './pages/SyndicationPage';
import { WidgetPage } from './pages/WidgetPage';
import { EnterprisePage } from './pages/EnterprisePage';
import { PublicCVViewPage } from './pages/PublicCVViewPage';
import { PermanentPublicCVViewPage } from './pages/PermanentPublicCVViewPage';
import { WidgetViewPage } from './pages/WidgetViewPage';
import { QuestBuilder } from './components/quests/QuestBuilder';
import { RecruiterQuestsPage } from './pages/RecruiterQuestsPage';
import { QuestSubmissionReviewPage } from './pages/QuestSubmissionReviewPage';
import { QuestSubmissionsListPage } from './pages/QuestSubmissionsListPage';
import { QuestSubmissionPage } from './pages/QuestSubmissionPage';
import { QuestSubmissionDetailsPage } from './pages/QuestSubmissionDetailsPage';
import { MyBadgesPage } from './pages/MyBadgesPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { RecruiterCVViewPage } from './pages/RecruiterCVViewPage';
import { BoltNewBadge } from './components/ui/bolt-new-badge';

function AppRoutes() {
  const { user, supabaseUser, isLoading } = useAuth();

  // Set default title
  useEffect(() => {
    document.title = 'CVaaS - Professional CV Management Platform';
  }, []);

  // Show loading spinner while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated in Supabase but doesn't have a profile, redirect to complete profile
  if (supabaseUser && !user) {
    return (
      <Layout>
        <Routes>
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route path="*" element={<Navigate to="/complete-profile" replace />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/complete-profile" element={user ? <Navigate to="/dashboard" /> : <CompleteProfilePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {/* CV Management Routes (Candidates) */}
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
        {/* Quest Management (Recruiters) */}
        <Route
          path="/challenges/new"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <QuestBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenges/:questId/edit"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <QuestBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/quests"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterQuestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <QuestSubmissionsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions/:submissionId/review"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <QuestSubmissionReviewPage />
            </ProtectedRoute>
          }
        />
        {/* Challenge Submission (Candidates) */}
        <Route
          path="/challenges/:questId/submit"
          element={
            <ProtectedRoute requiredRole="candidate">
              <QuestSubmissionPage />
            </ProtectedRoute>
          }
        />
        {/* Quest Submission Details (Candidates) */}
        <Route
          path="/my-submissions/:submissionId"
          element={
            <ProtectedRoute requiredRole="candidate">
              <QuestSubmissionDetailsPage />
            </ProtectedRoute>
          }
        />
        {/* Badges & Leaderboard (Candidates) */}
        <Route
          path="/my-badges"
          element={
            <ProtectedRoute requiredRole="candidate">
              <MyBadgesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        {/* Talent Discovery (Recruiters) */}
        <Route
          path="/talent"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <TalentDiscoveryPage />
            </ProtectedRoute>
          }
        />
        {/* Recruiter CV View */}
        <Route
          path="/talent/cv/:cvId"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <RecruiterCVViewPage />
            </ProtectedRoute>
          }
        />
        {/* General Challenges */}
        <Route
          path="/challenges"
          element={
            <ProtectedRoute>
              <ChallengesPage />
            </ProtectedRoute>
          }
        />
        {/* Syndication (Recruiters) */}
        <Route
          path="/syndication"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <SyndicationPage />
            </ProtectedRoute>
          }
        />
        {/* Enterprise (Recruiters) */}
        <Route
          path="/enterprise"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <EnterprisePage />
            </ProtectedRoute>
          }
        />
        {/* Legacy/Alias routes */}
        <Route path="/quests" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><div className="p-8">Projects page coming soon...</div></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div className="p-8">Settings page coming soon...</div></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <>
      {/* Badge always visible */}
      <BoltNewBadge position="bottom-left" variant="text" size="medium" />

      <Router>
        {/* Public routes */}
        <Routes>
          <Route path="/cv/ephemeral/:accessToken" element={<PublicCVViewPage />} />
          <Route path="/cv/public/:publicSlug" element={<PermanentPublicCVViewPage />} />
          <Route path="/widget/cv/:cvId" element={<WidgetViewPage />} />

          {/* All other routes go through auth */}
          <Route
            path="/*"
            element={
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;