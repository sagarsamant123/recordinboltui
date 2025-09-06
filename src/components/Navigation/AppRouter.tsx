import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../Auth/AuthLayout';
import { LoginPage } from '../Auth/LoginPage';
import { SignupRequestPage } from '../Auth/SignupRequestPage';
import { AdminDashboard } from '../Admin/AdminDashboard';
import { ProtectedRoute } from '../Auth/ProtectedRoute';
import App from '../../App';

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<App />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup-request" element={<SignupRequestPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<App />} />
      </Routes>
    </Router>
  );
};