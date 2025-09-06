import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Headphones, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { login, isLoading, error, isAuthenticated, isAdmin, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Only redirect if we're authenticated and not in a loading state
      if (isAuthenticated && !isLoading) {
        console.log('Auth state in LoginPage:', { isAuthenticated, isAdmin, isLoading });
        
        // Small delay to ensure auth state is fully updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isAdmin) {
          console.log('Redirecting to admin dashboard...');
          navigate('/admin', { replace: true });
        } else {
          console.log('Redirecting to home...');
          navigate('/', { replace: true });
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      setFormError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await login({ email: email.trim(), password });
      console.log('Login result:', result);
      
      if (result.success) {
        // Let the useEffect handle the redirection
        // This ensures auth state is properly updated before redirect
        console.log('Login successful, waiting for auth state update...');
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-[#B8FF4F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Headphones className="w-10 h-10 text-[#B8FF4F]" />
            <span className="text-3xl font-bold text-[#212124]">aminoRecording</span>
          </div>
          <h1 className="text-2xl font-bold text-[#212124] mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your recordings</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8FF4F] focus:border-[#B8FF4F] transition-colors"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8FF4F] focus:border-[#B8FF4F] transition-colors"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Messages */}
            {(formError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#212124] text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup-request"
                className="text-[#212124] font-medium hover:underline"
              >
                Request Access
              </Link>
            </p>
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};