import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Headphones, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const SignupRequestPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { signupRequest, isLoading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
    if (!reason.trim()) {
      setFormError('Please provide a reason for requesting access');
      return false;
    }
    if (reason.trim().length < 10) {
      setFormError('Please provide a more detailed reason (at least 10 characters)');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await signupRequest({ 
      email: email.trim(), 
      reason: reason.trim() 
    });
    
    if (result.success) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-white to-[#B8FF4F] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#212124] mb-4">Request Submitted!</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for your interest in aminoRecording. Your access request has been submitted and is currently under review.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You'll receive an email with your login credentials once your application is approved by our team.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-[#212124] text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Go to Login
              </Link>
              <Link
                to="/"
                className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-[#B8FF4F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Headphones className="w-10 h-10 text-[#B8FF4F]" />
            <span className="text-3xl font-bold text-[#212124]">aminoRecording</span>
          </div>
          <h1 className="text-2xl font-bold text-[#212124] mb-2">Request Access</h1>
          <p className="text-gray-600">Get exclusive access to premium recordings</p>
        </div>

        {/* Signup Request Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
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

            {/* Reason Field */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want access? *
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8FF4F] focus:border-[#B8FF4F] transition-colors resize-none"
                  rows={4}
                  placeholder="Please explain why you'd like access to aminoRecording. Be specific about your use case or interest in the content..."
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 characters. Be specific to improve your chances of approval.
              </p>
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
                  Submitting Request...
                </>
              ) : (
                'Submit Access Request'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#212124] font-medium hover:underline"
              >
                Sign In
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

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your request will be reviewed by our team</li>
            <li>• You'll receive an email if approved</li>
            <li>• Login credentials will be provided via email</li>
            <li>• Review typically takes 1-3 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};