import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Portal } from '../Portal';
import { X, Mail, Lock, User, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AuthMode } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, signupRequest, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === 'login') {
      const result = await login({ email, password });
      if (result.success) {
        onClose();
      }
    } else if (mode === 'signup') {
      const result = await signupRequest({ email, reason });
      if (result.success) {
        setMode('pending');
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#B8FF4F]/10 to-green-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#B8FF4F] rounded-full flex items-center justify-center">
                {mode === 'pending' ? (
                  <CheckCircle className="w-5 h-5 text-[#212124]" />
                ) : mode === 'signup' ? (
                  <User className="w-5 h-5 text-[#212124]" />
                ) : (
                  <Lock className="w-5 h-5 text-[#212124]" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === 'pending' ? 'Application Submitted' : 
                   mode === 'signup' ? 'Request Access' : 'Sign In'}
                </h2>
                <p className="text-sm text-gray-600">
                  {mode === 'pending' ? 'Awaiting approval' : 
                   mode === 'signup' ? 'Get full access to recordings' : 'Access your account'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {mode === 'pending' ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Application Under Review
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Thank you for your interest! Your application has been submitted and is currently under review.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-2">
                    You'll receive an email with your login credentials once your application is approved by our team.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full bg-[#B8FF4F] text-[#212124] py-3 rounded-lg font-bold hover:bg-[#A3E844] transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8FF4F] focus:border-[#B8FF4F] transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field (Login only) */}
                {mode === 'login' && (
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
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8FF4F] focus:border-[#B8FF4F] transition-colors"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Reason Field (Signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want access? (Optional)
                    </label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8FF4F] focus:border-[#B8FF4F] transition-colors resize-none"
                      rows={3}
                      placeholder="Tell us why you'd like access to full recordings..."
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {mode === 'login' ? 'Signing In...' : 'Submitting...'}
                    </>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Request Access'
                  )}
                </button>

                {/* Mode Toggle */}
                <div className="text-center pt-4 border-t border-gray-200">
                  {mode === 'login' ? (
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="text-[#212124] font-medium hover:underline"
                      >
                        Request Access
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#212124] font-medium hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};