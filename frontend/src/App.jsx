import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RoleBasedNavigation from './components/auth/RoleBasedNavigation';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Donor Pages
import DonatePage from './pages/donor/DonatePage';
import DonationsPage from './pages/donor/DonationsPage';
import FindNGOsPage from './pages/donor/FindNGOsPage';

// NGO Pages
import NGODashboardPage from './pages/ngo/NGODashboardPage';
import DonationRequestsPage from './pages/ngo/DonationRequestsPage';
import ReportsPage from './pages/ngo/ReportsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import VerifyNGOsPage from './pages/admin/VerifyNGOsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

// Chat Pages
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <RoleBasedNavigation />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Chat Routes */}
              <Route 
                path="/chat/:donationId" 
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Donor Routes */}
              <Route 
                path="/donate" 
                element={
                  <ProtectedRoute requiredRole="donor">
                    <DonatePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donations" 
                element={
                  <ProtectedRoute requiredRole="donor">
                    <DonationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/find-ngos" 
                element={
                  <ProtectedRoute requiredRole="donor">
                    <FindNGOsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* NGO Routes */}
              <Route 
                path="/ngo-dashboard" 
                element={
                  <ProtectedRoute requiredRole="ngo">
                    <NGODashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donation-requests" 
                element={
                  <ProtectedRoute requiredRole="ngo">
                    <DonationRequestsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute requiredRole="ngo">
                    <ReportsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/verify-ngos" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <VerifyNGOsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manage-users" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ManageUsersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AnalyticsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                } 
              />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
